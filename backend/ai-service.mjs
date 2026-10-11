import {randomUUID} from 'node:crypto';
import {ServiceError} from './repository.mjs';
import {inferStructured} from './inference.mjs';
import {schemas,validateShape,scenarioPackage,expandedPackage,authorContext,sessionContext,validatePolicy,turnContext,assessmentContext,applyAssessment,reportContext,applyTurn} from './ai-domain.mjs';
import {workflows,snapshot,authorDigest,minutes} from '../dist/workflow-model.js';
import {can} from '../dist/platform.js';

const controllers=new Map(),busy=new Set();
const uuid=value=>{if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value||''))throw new ServiceError('ID','A UUID request ID is required.');return value;};
const safeResource=value=>{if(typeof value!=='string'||!/^[-\w ]{1,100}$/.test(value))throw new ServiceError('RESOURCE','Invalid resource identifier.');return value;};
const taskPublic=t=>({id:t.id,operation:t.operation,resource:t.resource,status:t.status,result:t.result,model:t.model,usage:t.usage,createdAt:t.created_at});
const instructions={
 scenario:'Generate a complete SYNTHETIC editable scenario. Use unique stable IDs. Include roles, at least one environment/threat actor, services, registered transitions, timed and conditional injects, and measurable objectives with exactly four anchors. Use only actions allowed for the chosen discipline. Conditions reference transition IDs. Costs must be positive; each target resources budget must be at least the cost of every transition on it (services need nonzero budgets). States must be reachable from initial state. Allowed actions: Incident response = verify_backup/isolate_segment/restore_service/disrupt_service/spread_compromise/exfiltrate_data; Disaster recovery = verify_backup/restore_service/disrupt_service; Business continuity = verify_backup/restore_service/authorize_supplier/disrupt_service; Crisis management = verify_backup/restore_service/approve_statement/disrupt_service. spread_compromise and exfiltrate_data are threat-actor-only; disrupt_service requires a non-human actor. Include one actor-owned transition. Human role audiences only. Define N/O and N/A exclusions. Set bindings empty. Clock stepped. Do not invent approval. Keep the package concise enough to fit the output limit.',
 expand:'Generate new injects and executable branches or revise existing transitions. Return ONLY changed/new injects and transitions. Preserve all other content. Use existing entities and action allowlist, exact stable IDs for changes and new unique IDs for additions. Each conditional inject references a transition ID, human-role audiences, and valid termination time. Costs positive and states reachable. Mutually exclusive branches share a from state with different to states. Include a follow-up inject per branch. Do not alter rubrics, roles, permissions or publication.',
 turn:'Act as the specified synthetic scenario actor and bounded exercise adjudicator. Choose at most one actor-owned registered transition (or empty string to wait), using current precondition and resources. Supply a short actor message to permitted audiences or empty message to wait. You may resolve one pending request only when context permits; use clarify/reject or explicitly allowlisted compensating transition. Never infer approval or execute unsupported prose. Empty requestId/compensationId when not used. Adjudication is a simulated consequence, not evidence of participant competency.',
 assess:'Propose Team and, only when attributed source evidence permits, individual rubric findings for the supplied selected objectives. Subject must be Team or a supplied eligible roster ID. Individual numeric levels require matching participantId in every cited source. Use ONLY provided recorded human action observations. Numeric 0–3 requires qualifying evidence in the objective window AND a released role opportunity before the observation. Quote/cite exact evidence IDs. Missing observation means not_observed, never 0. Never fabricate speech, attendance, scores, or evidence. These are unapproved drafts. Explain limitations.',
 report:'Write a team-only after-action report DRAFT from supplied recorded timeline and approved Team findings. Cite event/finding IDs inline. Separate synthetic consequences from participant behavior, and record limitations and AI/adaptation impact. Never invent observations, approved scores, private participant conclusions, or publication. Select findingIds only from supplied approved findings.'
};
export async function performTask(repo,scope,input,{run=null,lease=null,infer=inferStructured}={}){
 const id=uuid(input.id),operation=input.operation,resource=safeResource(input.resource||'new'),request=String(input.request||'');
 if(!['scenario','expand','assess','report','turn'].includes(operation)||typeof input.request!=='string'||!request.trim()||request.length>4000)throw new ServiceError('VALIDATION','Choose a supported AI operation and a nonempty request of at most 4,000 characters.');
 const previous=(await repo.rest(`strata_ai_tasks?id=eq.${id}&tenant=eq.${scope.tenant}`))[0];
 if(previous){if(previous.actor!==scope.persona||previous.operation!==operation||previous.resource!==resource||previous.request!==request)throw new ServiceError('IDEMPOTENCY','Request ID belongs to different input.',409);return taskPublic(previous);}
 if(busy.has(scope.tenant))throw new ServiceError('AI_BUSY','An AI generation is already in progress in this workspace.',429);
 const {row,engine}=await repo.workspace(scope.tenant),data=engine.snapshot(scope.tenant).data;
 const context=operation==='scenario'?{request,registeredActions:['verify_backup','isolate_segment','restore_service','authorize_supplier','approve_statement','disrupt_service','spread_compromise','exfiltrate_data']}:
 operation==='expand'?authorContext(data,resource):operation==='assess'?assessmentContext(data,resource):operation==='report'?reportContext(data,resource):turnContext(data,resource,run.policy);
 const payload={context,request},maxOutput=['scenario','expand'].includes(operation)?6000:2200;
 // UTF-8 byte count is a conservative input-token reservation, plus schema/prompt overhead.
 const reservation=Buffer.byteLength(JSON.stringify(payload))+Buffer.byteLength(JSON.stringify(schemas[operation]))+Buffer.byteLength(instructions[operation])+2048+maxOutput;
 if(reservation>100000)throw new ServiceError('CONTEXT_LIMIT','Context is too large for one bounded AI turn.');
 if(run){
  const claim=await repo.rest('rpc/strata_ai_claim',{method:'POST',body:{p_id:run.id,p_lease:lease,p_tokens:reservation}});
  if(!claim)throw new ServiceError('AI_LIMIT','AI turn, token budget, or lease limit reached.',409);
 }else{
  const recent=await repo.rest(`strata_ai_tasks?tenant=eq.${scope.tenant}&created_at=gte.${encodeURIComponent(new Date(Date.now()-3600000).toISOString())}&select=id`);
  if(recent.length>=20)throw new ServiceError('AI_RATE_LIMIT','20 manual AI jobs per workspace/hour limit reached.',429);
 }
 const job={id,tenant:scope.tenant,actor:scope.persona,operation,resource,request,status:'running',result:{}};
 const controller=new AbortController();busy.add(scope.tenant);if(run)controllers.set(run.id,controller);
 let generated;
 try{
  await repo.rest('strata_ai_tasks',{method:'POST',body:job});
  generated=await infer('strata_'+operation,schemas[operation],instructions[operation],payload,{signal:controller.signal,maxOutput});
  validateShape(generated.content,schemas[operation]);
  if(controller.signal.aborted)throw new ServiceError('AI_STOPPED','Automation was stopped; response was not applied.');
  const content=generated.content;let result;
  await engine.read(scope);
  if(operation==='scenario'){
   await engine.command(scope,{type:'package.import',resourceId:'new',idempotencyKey:'ai-task:'+id,payload:{package:scenarioPackage(content)}});
   const s=engine.snapshot(scope.tenant).data.scenarios.at(-1);result={scenarioId:s.id,revision:s.revision,description:'Editable AI draft created. Validate, dry-run and publish explicitly.'};
  }else if(operation==='expand'){
   const pack=expandedPackage(data,resource,content),state=engine.snapshot(scope.tenant),s=state.data.scenarios.find(s=>s.id===resource),a=workflows(state.data).authors[resource];
   if(authorDigest(s,a)!==context.digest)throw new ServiceError('CONFLICT','Authoring base changed.');
   a.definition.injects=pack.definition.injects;a.definition.transitions=pack.definition.transitions;s.version++;s.validation='stale';delete a.validatedDigest;delete a.dryRun;a.history.push(snapshot(s,a,'AI inject/branch generation '+id));state.data.audit.push({action:'ai.expand',resource,at:new Date().toISOString()});engine.hydrate(scope.tenant,state);
   result={scenarioId:s.id,revision:s.revision,description:`${content.injects.length} injects and ${content.transitions.length} transitions applied to draft. Revalidate before publishing.`};
  }else if(operation==='assess'){
   const state=engine.snapshot(scope.tenant);result=applyAssessment(state.data,resource,content,id);state.data.audit.push({action:'ai.assess',resource,at:new Date().toISOString()});engine.hydrate(scope.tenant,state);
  }else if(operation==='report'){
   if(!content.sections.length||content.sections.length>20||content.findingIds.some(fid=>!context.findings.some(f=>f.id===fid)))throw new ServiceError('REPORT','Report references unsupported findings or sections.');
   await engine.command(scope,{type:'report.create',resourceId:'new',idempotencyKey:id+':create',payload:{session:resource,title:content.title,reportType:'After-action report'}});
   const r=engine.snapshot(scope.tenant).data.reports.at(-1);
   await engine.command(scope,{type:'report.save',resourceId:r.id,idempotencyKey:id+':save',expectedVersion:r.version,payload:{title:content.title,summary:content.summary+'\n\nAI draft limitations: '+content.limitations,audience:'Review team',findings:content.findingIds,sections:JSON.stringify(content.sections.map((s,i)=>({...s,id:id+':'+i,audience:'Review team'})))}});
   result={reportId:r.id,description:'AI report draft created for human review. Not approved or published.'};
  }else result=await applyTurn(engine,scope,resource,run.policy,content,id);
  const committed=await repo.rest('rpc/strata_ai_finish',{method:'POST',body:{p_tenant:scope.tenant,p_version:row.version,p_state:engine.snapshot(scope.tenant),p_task:id,p_result:result,p_model:generated.model,p_usage:generated.usage,p_run:run?.id||null,p_lease:lease}});
  if(!committed)throw new ServiceError('CONFLICT','Workspace changed or AI was stopped. Response was not applied; no retry was made.',409);
  return taskPublic({...job,status:'complete',result,model:generated.model,usage:generated.usage});
 }catch(error){
  try{await repo.rest(`strata_ai_tasks?id=eq.${id}&tenant=eq.${scope.tenant}&status=eq.running`,{method:'PATCH',body:{status:'failed',...(generated?{model:generated.model,usage:generated.usage}:{}),result:{code:error.code||'AI_INTERRUPTED',description:error.code?error.message:'AI request interrupted. No automatic retry.'}}});}catch{}
  throw error;
 }finally{busy.delete(scope.tenant);if(run)controllers.delete(run.id);}
}
export async function handleExpandedAi(repo,scope,input,path){
 if(!path.startsWith('/api/ai/task')&&!path.startsWith('/api/ai/run'))return undefined;
 if(scope.state!=='ready'||!can(scope,'facilitate'))throw new ServiceError('FORBIDDEN','AI operations require a current facilitator/author scope.',403);
 if(path==='/api/ai/tasks')return (await repo.rest(`strata_ai_tasks?tenant=eq.${scope.tenant}&actor=eq.${scope.persona}&order=created_at.desc&limit=30`)).map(taskPublic);
 if(path==='/api/ai/task'){
  if(input.operation==='turn')throw new ServiceError('FORBIDDEN','Automatic turns require an enabled exercise policy.',403);
  return performTask(repo,scope,input);
 }
 if(path==='/api/ai/runs')return repo.rest(`strata_ai_runs?tenant=eq.${scope.tenant}&session_id=eq.${encodeURIComponent(safeResource(input.resource))}&order=created_at.desc&limit=10`);
 if(path==='/api/ai/run/start'){
  if(!process.env.OPENAI_API_KEY)throw new ServiceError('AI_UNCONFIGURED','Configure the server API key before enabling AI.');
  const id=uuid(input.id),resource=safeResource(input.resource),{engine}=await repo.workspace(scope.tenant),policy=validatePolicy(engine.snapshot(scope.tenant).data,resource,input.policy||{});
  const old=(await repo.rest(`strata_ai_runs?id=eq.${id}&tenant=eq.${scope.tenant}`))[0];
  if(old){if(old.actor!==scope.persona||old.session_id!==resource||JSON.stringify(old.policy)!==JSON.stringify(policy))throw new ServiceError('IDEMPOTENCY','Run ID belongs to different policy.');return old;}
  const run={id,tenant:scope.tenant,session_id:resource,actor:scope.persona,status:'running',policy};await repo.rest('strata_ai_runs',{method:'POST',body:run});return run;
 }
 if(path==='/api/ai/run/stop'){
  const id=uuid(input.id);controllers.get(id)?.abort();
  await repo.rest(`strata_ai_runs?id=eq.${id}&tenant=eq.${scope.tenant}&status=eq.running`,{method:'PATCH',body:{status:'stopped',lease:null,reason:'Stopped explicitly by facilitator.'}});
  return {status:'stopped'};
 }
 if(path==='/api/ai/run/stop-session'){
  await suspendSessionAi(repo,scope.tenant,safeResource(input.resource),'stopped');return {status:'stopped'};
 }
 throw new ServiceError('NOT_FOUND','AI endpoint unavailable.',404);
}
export async function suspendSessionAi(repo,tenant,sessionId,status='paused'){
 const runs=await repo.rest(`strata_ai_runs?tenant=eq.${tenant}&session_id=eq.${encodeURIComponent(sessionId)}&status=eq.running`);
 for(const run of runs){controllers.get(run.id)?.abort();await repo.rest(`strata_ai_runs?id=eq.${run.id}&status=eq.running`,{method:'PATCH',body:{status,lease:null,reason:status==='stopped'?'Stopped explicitly by facilitator.':'Exercise lifecycle paused/ended. Enable a new run explicitly to continue.'}});}
}
export function startAiRunner(database){
 let ready=false,ticking=false;
 const tick=async()=>{
  if(ticking)return;ticking=true;
  try{
   const repo=await database();
   if(!ready){
    // Never resume spending silently after a server restart or unknown outcome.
    await repo.rest('strata_ai_runs?status=eq.running',{method:'PATCH',body:{status:'paused',lease:null,reason:'Server restarted. Explicitly enable a new bounded run to continue.'}});
    await repo.rest('strata_ai_tasks?status=eq.running',{method:'PATCH',body:{status:'failed',result:{description:'Server restarted; unknown provider outcome. No retry.'}}});ready=true;
   }
   const runs=await repo.rest(`strata_ai_runs?status=eq.running&lease=is.null&next_at=lte.${encodeURIComponent(new Date().toISOString())}`);
   for(const run of runs){
    if(busy.has(run.tenant))continue;
    try{
     const {engine}=await repo.workspace(run.tenant),{s,x}=sessionContext(engine.snapshot(run.tenant).data,run.session_id);
     if(s.status!=='running'||minutes(s.simulationTime)>=x.pinned.definition.termination)throw new ServiceError('PAUSED','Exercise paused, ended, or reached termination. Explicitly enable again after review.');
     await performTask(repo,{tenant:run.tenant,persona:run.actor,state:'ready',epoch:0},{id:randomUUID(),operation:'turn',resource:run.session_id,request:'Bounded automatic actor turn'},{run,lease:randomUUID()});
     if(run.turns+1>=run.policy.maxTurns)await repo.rest(`strata_ai_runs?id=eq.${run.id}&status=eq.running`,{method:'PATCH',body:{status:'complete',reason:'Turn limit reached.'}});
    }catch(error){await repo.rest(`strata_ai_runs?id=eq.${run.id}&status=eq.running`,{method:'PATCH',body:{status:'paused',lease:null,reason:error.code?error.message:'Turn failed; no automatic retry.'}});}
   }
  }catch{/* DB unavailable: do not execute or substitute fixture writes. */}finally{ticking=false;}
 };
 const timer=setInterval(tick,2000);timer.unref();void tick();return ()=>clearInterval(timer);
}
