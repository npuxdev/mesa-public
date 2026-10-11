import test from 'node:test';
import assert from 'node:assert/strict';
import {FixtureAdapter} from '../dist/platform.js';
import {workflows} from '../dist/workflow-model.js';
import {exportPackage} from '../dist/workflow-package.js';
import {schemas,validatePolicy,turnContext,applyTurn,applyAssessment,assessmentContext,scenarioPackage,expandedPackage} from '../backend/ai-domain.mjs';
import {performTask,handleExpandedAi} from '../backend/ai-service.mjs';
import {inferStructured} from '../backend/inference.mjs';

const scope={tenant:'atlas',persona:'manager',state:'ready',epoch:0};
async function fixture(){const engine=new FixtureAdapter();await engine.read(scope);const state=engine.snapshot('atlas');workflows(state.data);return {engine,state,data:state.data};}
const policy={actorId:'env',maxTurns:2,maxTokens:60000,intervalSeconds:15,stepMinutes:0,audiences:['role-1'],transitions:[],releaseInjects:false,adjudicate:false,disclosed:true};
const turn={transitionId:'',message:'Synthetic stakeholder pressure',audiences:['role-1'],resolution:'none',requestId:'',compensationId:'',rationale:''};
test('automation policy requires current running session, explicit disclosure and bounded values',async()=>{
 const {data}=await fixture();assert.equal(validatePolicy(data,'s-ir-01',policy).maxTurns,2);
 for(const patch of [{disclosed:false},{maxTurns:31},{maxTokens:1000},{intervalSeconds:1},{stepMinutes:11},{actorId:'role-1'},{audiences:['not-assigned']},{transitions:['unknown']}])assert.throws(()=>validatePolicy(data,'s-ir-01',{...policy,...patch}));
 data.sessions.find(s=>s.id==='s-ir-01').status='paused';assert.throws(()=>validatePolicy(data,'s-ir-01',policy));
});
test('runtime prompt excludes hidden inject notes, rubrics, role-private messages and unreleased artifacts',async()=>{
 const {data}=await fixture(),x=workflows(data).exercises['s-ir-01'];
 x.roster.push({id:'extra',name:'Other',role:'other-role',observer:false});
 x.messages.push({id:'private',thread:'internal',source:'Human',text:'PRIVATE-SENTINEL',audiences:['role-1']});
 x.injects[0].definition.notes='HIDDEN-SENTINEL';x.pinned.definition.objectives[0].anchors[0]='RUBRIC-SENTINEL';
 const context=JSON.stringify(turnContext(data,'s-ir-01',policy));
 assert.doesNotMatch(context,/PRIVATE-SENTINEL|HIDDEN-SENTINEL|RUBRIC-SENTINEL/);
});
test('actor dialogue creates labeled synthetic artifacts, never participant observation evidence',async()=>{
 const {engine,data}=await fixture(),before=data.findings.length;
 await applyTurn(engine,scope,'s-ir-01',policy,turn,'job-synthetic');const after=engine.snapshot('atlas').data;
 assert.equal(after.findings.length,before);assert.match(after.evidence.at(-1).source,/not participant observation/);
 assert.ok(!assessmentContext(after,'s-ir-01').observations.some(e=>e.id===after.evidence.at(-1).id));
});
test('AI world changes require actor ownership, allowlist, precondition and resource budget',async()=>{
 const {engine,state,data}=await fixture(),x=workflows(data).exercises['s-ir-01'];
 const t={...x.pinned.definition.transitions[0],id:'ai-t',roleId:'env',to:'actor-verified'};x.pinned.definition.transitions.push(t);engine.hydrate('atlas',state);
 await assert.rejects(applyTurn(engine,scope,'s-ir-01',{...policy,transitions:['t-verify']},{...turn,transitionId:'t-verify'},'not-owner'));
 await applyTurn(engine,scope,'s-ir-01',{...policy,transitions:['ai-t']},{...turn,transitionId:'ai-t'},'owned');
 assert.equal(workflows(engine.snapshot('atlas').data).exercises['s-ir-01'].world.service,'actor-verified');
 await assert.rejects(applyTurn(engine,scope,'s-ir-01',{...policy,transitions:['ai-t']},{...turn,transitionId:'ai-t'},'replay'));
});
test('automatic pacing releases eligible pinned cues but not manual cues; termination is respected',async()=>{
 const {engine}=await fixture();await applyTurn(engine,scope,'s-ir-01',{...policy,stepMinutes:1,releaseInjects:true},turn,'pacing');
 const x=workflows(engine.snapshot('atlas').data).exercises['s-ir-01'];assert.equal(x.injects.find(i=>i.definition.id==='i-initial').state,'released');assert.equal(x.injects.find(i=>i.definition.trigger==='manual').state,'queued');
});
test('AI adjudication cannot execute unsupported compensation or resolve disabled requests',async()=>{
 const {engine,state,data}=await fixture(),x=workflows(data).exercises['s-ir-01'];x.requests.push({id:'r1',intent:'Please restore',state:'pending'});engine.hydrate('atlas',state);
 const resolution={...turn,message:'',resolution:'compensate',requestId:'r1',compensationId:'t-verify',rationale:'Simulated compensation'};
 await assert.rejects(applyTurn(engine,scope,'s-ir-01',policy,resolution,'disabled'));
 await assert.rejects(applyTurn(engine,scope,'s-ir-01',{...policy,adjudicate:true},resolution,'not-allowed'));
 await applyTurn(engine,scope,'s-ir-01',{...policy,adjudicate:true,transitions:['t-verify']},resolution,'allowed');
 assert.equal(workflows(engine.snapshot('atlas').data).exercises['s-ir-01'].requests.at(-1).state,'resolved');
 assert.equal(assessmentContext(engine.snapshot('atlas').data,'s-ir-01').observations.length,0);
});
test('numeric AI findings cannot cite simulated artifacts or invent evidence, missing observation stays N/O',async()=>{
 const {data}=await fixture(),o=workflows(data).exercises['s-ir-01'].pinned.definition.objectives[0];
 const f={objectiveId:o.id,subject:'Team',level:'3',evidence:['invented'],claim:'Complete'};
 assert.throws(()=>applyAssessment(data,'s-ir-01',{findings:[f],limitations:'Draft'},'invented'));
 assert.throws(()=>applyAssessment(data,'s-ir-01',{findings:[{...f,subject:'observer',evidence:[],level:'not_observed'}],limitations:'Draft'},'observer'));
 const result=applyAssessment(data,'s-ir-01',{findings:[{...f,level:'not_observed',evidence:[]}],limitations:'No qualifying human evidence'},'no-observation');
 assert.equal(data.findings.find(f=>f.id===result.findingIds[0]).level,'not_observed');assert.equal(data.findings.at(-1).status,'draft');
});
test('generated scenarios and branches use parser and deterministic validation, not executable prose',async()=>{
 const {engine}=await fixture();await engine.command(scope,{type:'scenario.fork',resourceId:'sc-ir',idempotencyKey:'ai-branch-base',payload:{}});
 const data=engine.snapshot('atlas').data,s=data.scenarios.at(-1),pack=exportPackage(data,s.id,'private');
 const {roles,objectives,rights,...metadata}=pack.scenario;
 assert.equal(scenarioPackage({...metadata,definition:pack.definition}).synthetic,true);
 const inject={...pack.definition.injects[0],id:'new-conditional',trigger:'condition',condition:'t-verify'};
 assert.ok(expandedPackage(data,s.id,{injects:[inject],transitions:[]}).definition.injects.some(i=>i.id===inject.id));
 assert.throws(()=>expandedPackage(data,s.id,{injects:[{...inject,condition:'arbitrary-code'}],transitions:[]}));
 assert.throws(()=>scenarioPackage({...metadata,definition:{...pack.definition,transitions:[{...pack.definition.transitions[0],action:'execute_shell'}]}}));
});
test('observed attributed human action yields review-only participant scores, not AI artifacts or approval',async()=>{
 const {engine}=await fixture();
 await engine.command(scope,{type:'action.submit',resourceId:'s-ir-01',payload:{action:'verify_backup',target:'service',outcome:'accepted'},idempotencyKey:'score-action'});
 await engine.command(scope,{type:'action.reconcile',resourceId:'s-ir-01',payload:{originalKey:'score-action'},idempotencyKey:'score-executed'});
 const data=engine.snapshot('atlas').data,context=assessmentContext(data,'s-ir-01'),evidence=context.observations[0],objective=context.objectives.find(o=>o.roleId===evidence.roleId);
 assert.equal(evidence.participantId,'p-self');
 const result=applyAssessment(data,'s-ir-01',{findings:[{objectiveId:objective.id,subject:'p-self',level:'2',evidence:[evidence.id],claim:'Recorded verification supports the proposed anchor.'}],limitations:'AI draft only'},'score-draft');
 const finding=data.findings.find(f=>f.id===result.findingIds[0]);assert.equal(finding.status,'draft');assert.equal(finding.subject,'p-self');assert.equal(finding.level,2);assert.deepEqual(data.workflow.findings[finding.id].inspected,[]);
});
test('structured inference is bounded, abortable, no-store and handles refusals',async()=>{
 await inferStructured('turn',schemas.turn,'Bounded only',{synthetic:true},{key:'test',maxOutput:2200,fetcher:async(_,o)=>{const body=JSON.parse(o.body);assert.equal(body.store,false);assert.equal(body.max_output_tokens,2200);assert.equal(body.text.format.strict,true);assert.ok(o.signal);return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(turn)}]}]});}});
 await assert.rejects(inferStructured('turn',schemas.turn,'',{}, {key:'test',fetcher:async()=>Response.json({status:'completed',output:[{content:[{type:'refusal'}]}]})}));
});
test('same-verb branches retain the chosen transition ID through confirmation and reconciliation',async()=>{
 const {engine,state,data}=await fixture(),x=workflows(data).exercises['s-ir-01'];
 x.pinned.definition.transitions.push({...x.pinned.definition.transitions[0],id:'alternative-verify',to:'quarantined'});engine.hydrate('atlas',state);await engine.read(scope);
 const payload={action:'verify_backup',target:'service',outcome:'accepted'};
 await assert.rejects(engine.command(scope,{type:'action.submit',resourceId:'s-ir-01',payload,idempotencyKey:'ambiguous-branch'}),e=>e.code==='AMBIGUOUS');
 await engine.command(scope,{type:'action.submit',resourceId:'s-ir-01',payload:{...payload,transitionId:'alternative-verify'},idempotencyKey:'exact-branch'});
 await engine.command(scope,{type:'action.reconcile',resourceId:'s-ir-01',payload:{originalKey:'exact-branch'},idempotencyKey:'reconcile-exact-branch'});
 assert.equal(workflows(engine.snapshot('atlas').data).exercises['s-ir-01'].world.service,'quarantined');
});
class MemoryRepo{
 constructor(state){this.state=state;this.version=1;this.jobs=[];this.run={id:crypto.randomUUID(),policy,status:'running',turns:0,reserved_tokens:0,lease:null};}
 async workspace(){const engine=new FixtureAdapter();engine.hydrate('atlas',this.state);return {row:{version:this.version},engine};}
 async rest(path,{body,method}={}){
  if(path==='rpc/strata_ai_claim'){const r=this.run;if(r.status!=='running'||r.lease||r.turns>=r.policy.maxTurns||r.reserved_tokens+body.p_tokens>r.policy.maxTokens)return null;r.turns++;r.reserved_tokens+=body.p_tokens;r.lease=body.p_lease;return r;}
  if(path==='rpc/strata_ai_finish'){if(this.version!==body.p_version||body.p_run&&(this.run.status!=='running'||this.run.lease!==body.p_lease))return false;this.state=body.p_state;this.version++;Object.assign(this.jobs.find(j=>j.id===body.p_task),{status:'complete',result:body.p_result});this.run.lease=null;return true;}
  if(path==='strata_ai_tasks'&&method==='POST'){this.jobs.push(body);return null;}
  if(path.startsWith('strata_ai_tasks?')){const id=/id=eq.([^&]+)/.exec(path)?.[1];if(method==='PATCH'){Object.assign(this.jobs.find(j=>j.id===id),body);return null;}return id?this.jobs.filter(j=>j.id===id):this.jobs;}
  throw Error(path);
 }
}
test('durable request replay does not rebill; stale commit and stopped lease cannot apply an AI response',async()=>{
 const {state}=await fixture(),repo=new MemoryRepo(state),input={id:crypto.randomUUID(),operation:'turn',resource:'s-ir-01',request:'bounded'},infer=async()=>({content:turn,model:'mock',usage:{total_tokens:50}});
 await performTask(repo,scope,input,{run:repo.run,lease:crypto.randomUUID(),infer});const version=repo.version;
 await performTask(repo,scope,input,{run:repo.run,lease:crypto.randomUUID(),infer:()=>{throw Error('rebilled');}});assert.equal(repo.version,version);
 const stopped=new MemoryRepo(state),before=JSON.stringify(stopped.state);
 await assert.rejects(performTask(stopped,scope,{...input,id:crypto.randomUUID()},{run:stopped.run,lease:crypto.randomUUID(),infer:async()=>{stopped.run.status='stopped';stopped.run.lease=null;return {content:turn,model:'mock',usage:{}};}}),e=>e.code==='CONFLICT');assert.equal(JSON.stringify(stopped.state),before);
 const stale=new MemoryRepo(state);await assert.rejects(performTask(stale,scope,{...input,id:crypto.randomUUID()},{run:stale.run,lease:crypto.randomUUID(),infer:async()=>{stale.version++;return {content:turn,model:'mock',usage:{}};}}),e=>e.code==='CONFLICT');assert.equal(JSON.stringify(stale.state),before);
});
test('token reservation fails before provider call and participant scope cannot start AI jobs',async()=>{
 const {state}=await fixture(),repo=new MemoryRepo(state);repo.run.policy={...policy,maxTokens:1};
 await assert.rejects(performTask(repo,scope,{id:crypto.randomUUID(),operation:'turn',resource:'s-ir-01',request:'bounded'},{run:repo.run,lease:crypto.randomUUID(),infer:()=>{throw Error('must not call provider');}}),e=>e.code==='AI_LIMIT');
 await assert.rejects(handleExpandedAi(repo,{...scope,persona:'participant'},{operation:'scenario'},'/api/ai/task'),e=>e.code==='FORBIDDEN');
});
test('workbench jobs create editable scenario and review-only report resources without approval',async()=>{
 const {state,data}=await fixture(),repo=new MemoryRepo(state),pack=exportPackage(data,'sc-ir','private'),{roles,objectives,rights,...metadata}=pack.scenario;
 const generated={...metadata,definition:pack.definition};
 const scenario=await performTask(repo,scope,{id:crypto.randomUUID(),operation:'scenario',resource:'new',request:'Synthetic'},{infer:async()=>({content:generated,model:'mock',usage:{total_tokens:50}})});
 const draft=repo.state.data.scenarios.find(s=>s.id===scenario.result.scenarioId);assert.equal(draft.status,'draft');assert.equal(draft.validation,'stale');
 const completed=repo.state.data.sessions.find(s=>['ended','review','archived'].includes(s.status));
 const report=await performTask(repo,scope,{id:crypto.randomUUID(),operation:'report',resource:completed.id,request:'Review draft'},{infer:async()=>({content:{title:'AI Review Report',summary:'Recorded synthetic timeline only.',sections:[{title:'Limitations',body:'No real-world conclusions.'}],findingIds:[],limitations:'No approved human score invented.'},model:'mock',usage:{total_tokens:50}})});
 const r=repo.state.data.reports.find(r=>r.id===report.result.reportId);assert.equal(r.status,'draft');assert.equal(r.audience,'Review team');assert.equal(repo.state.data.workflow.reports[r.id].approval,undefined);
});
