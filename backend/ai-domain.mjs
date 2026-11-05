import {ServiceError} from './repository.mjs';
import {workflows,allowedActions,authorDigest,appendEvent,minutes,uid} from '../dist/workflow-model.js';
import {parsePackage,exportPackage} from '../dist/workflow-package.js';
import {improvement} from '../dist/improvement-model.js';

const str={type:'string'},num={type:'number'},arr=items=>({type:'array',items}),enm=(...values)=>({type:'string',enum:values});
const obj=properties=>({type:'object',additionalProperties:false,properties,required:Object.keys(properties)});
const entity=obj({id:str,name:str,kind:enm('human_role','environment_actor','threat_actor','service'),knowledge:str,resources:num,initial:str});
const transition=obj({id:str,name:str,action:enm('verify_backup','isolate_segment','restore_service','authorize_supplier','approve_statement','disrupt_service','spread_compromise','exfiltrate_data'),roleId:str,targetId:str,from:str,to:str,cost:num});
const inject=obj({id:str,title:str,body:str,notes:str,trigger:enm('time','manual','condition'),minute:num,condition:str,channel:enm('internal','customer','vendor','media'),audiences:arr(str),artifact:str});
const objective=obj({id:str,title:str,roleId:str,start:num,end:num,evidence:str,anchors:arr(str),weight:num,threshold:num,exclusions:str});
const definition=obj({entities:arr(entity),transitions:arr(transition),injects:arr(inject),objectives:arr(objective),bindings:arr(str),clock:enm('stepped','realtime'),termination:num});
export const schemas={
 scenario:obj({title:str,summary:str,discipline:enm('Incident response','Disaster recovery','Business continuity','Crisis management'),industry:str,mode:enm('Tabletop','Facilitated simulation'),purpose:enm('Practice','Assessment'),difficulty:enm('Foundation','Intermediate','Advanced'),duration:num,definition}),
 expand:obj({injects:arr(inject),transitions:arr(transition)}),
 turn:obj({transitionId:str,message:str,audiences:arr(str),resolution:enm('none','clarify','reject','compensate'),requestId:str,compensationId:str,rationale:str}),
 assess:obj({findings:arr(obj({objectiveId:str,subject:str,level:enm('0','1','2','3','not_observed'),evidence:arr(str),claim:str})),limitations:str}),
 report:obj({title:str,summary:str,sections:arr(obj({title:str,body:str})),findingIds:arr(str),limitations:str})
};
export function validateShape(value,schema) {
 if(schema.type==='object'){
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join()!==schema.required.slice().sort().join())throw new ServiceError('AI_SCHEMA','AI output fields do not match the contract.',502);
  for(const key of schema.required)validateShape(value[key],schema.properties[key]);
 }else if(schema.type==='array'){
  if(!Array.isArray(value)||value.length>100)throw new ServiceError('AI_SCHEMA','AI collection exceeds the contract.',502);
  value.forEach(v=>validateShape(v,schema.items));
 }else if(typeof value!==schema.type||schema.type==='number'&&!Number.isFinite(value)||schema.type==='string'&&value.length>12000||schema.enum&&!schema.enum.includes(value))throw new ServiceError('AI_SCHEMA','AI output has an invalid value.',502);
 return value;
}
export function authorContext(data,id) {
 const s=data.scenarios.find(s=>s.id===id),a=workflows(data).authors[id];
 if(!s||!a||s.status!=='draft')throw new ServiceError('IMMUTABLE','Select an editable draft.',409);
 return {scenario:{title:s.title,summary:s.summary,discipline:s.discipline,duration:s.duration},definition:a.definition,allowedActions:allowedActions(s.discipline),digest:authorDigest(s,a)};
}
export function scenarioPackage(content){
 validateShape(content,schemas.scenario);
 const {definition,...scenario}=content;
 return parsePackage({format:'strata-scenario',version:'1.0',synthetic:true,profile:'portable',scenario:{...scenario,rights:'Portable synthetic AI draft; unapproved',roles:definition.entities.filter(e=>e.kind==='human_role').map(e=>e.name),objectives:definition.objectives.map(o=>o.title)},definition,provenance:'AI-generated synthetic draft'});
}
export function expandedPackage(data,id,content){
 validateShape(content,schemas.expand);const pack=exportPackage(data,id,'private');
 for(const key of ['injects','transitions']){
  for(const item of content[key]){const index=pack.definition[key].findIndex(x=>x.id===item.id);if(index<0)pack.definition[key].push(item);else pack.definition[key][index]=item;}
 }
 return parsePackage(pack);
}
export function sessionContext(data,id) {
 const s=data.sessions.find(s=>s.id===id),x=workflows(data).exercises[id];
 if(!s||!x?.pinned)throw new ServiceError('SESSION','Pinned exercise unavailable.',404);
 return {s,x};
}
export function validatePolicy(data,id,policy){
 const {s,x}=sessionContext(data,id);
 if(s.status!=='running')throw new ServiceError('PAUSED','Start or resume the exercise before enabling AI.',409);
 if(policy.disclosed!==true)throw new ServiceError('DISCLOSURE','Confirm AI participation disclosure before enabling.');
 const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
 if(!integer(policy.maxTurns,1,30)||!integer(policy.maxTokens,10000,300000)||!integer(policy.intervalSeconds,15,300)||!integer(policy.stepMinutes,0,10))throw new ServiceError('LIMIT','Use 1–30 turns, 10,000–300,000 tokens, 15–300 seconds and 0–10 simulation minutes.');
 if(!x.pinned.definition.entities.some(e=>e.id===policy.actorId&&['threat_actor','environment_actor'].includes(e.kind)))throw new ServiceError('ACTOR','Choose a pinned non-human actor.');
 const roles=x.roster.filter(r=>!r.observer).map(r=>r.role);
 if(!Array.isArray(policy.audiences)||!policy.audiences.length||policy.audiences.some(id=>!roles.includes(id)))throw new ServiceError('AUDIENCE','Choose assigned role audiences.');
 if(!Array.isArray(policy.transitions)||policy.transitions.some(id=>!x.pinned.definition.transitions.some(t=>t.id===id)))throw new ServiceError('TRANSITION','Choose pinned registered transitions.');
 return {actorId:policy.actorId,maxTurns:policy.maxTurns,maxTokens:policy.maxTokens,intervalSeconds:policy.intervalSeconds,stepMinutes:policy.stepMinutes,audiences:[...new Set(policy.audiences)],transitions:[...new Set(policy.transitions)],releaseInjects:policy.releaseInjects===true,adjudicate:policy.adjudicate===true,disclosed:true};
}
const bounded=(value,min,max,fallback,label)=>{
 if(value===undefined||value==='')return fallback;
 const n=Number(value);
 if(!Number.isInteger(n)||n<min||n>max)throw new ServiceError('LIMIT',`${label} must be ${min}–${max}.`);
 return n;
};
export function simulationPolicy(data,id,policy={}){
 const {s,x}=sessionContext(data,id);
 if(!x.aiSimulation)throw new ServiceError('SESSION','This session is not an AI cast simulation.',409);
 if(s.status!=='running'&&s.status!=='paused')throw new ServiceError('PAUSED','Resume or keep the simulation running before the cast acts.',409);
 if(policy.disclosed!==true&&policy.disclosed!=='yes')throw new ServiceError('DISCLOSURE','Confirm AI cast disclosure before the actors start.');
 const def=x.pinned.definition,cast=def.entities.filter(e=>['human_role','threat_actor','environment_actor'].includes(e.kind)).map(e=>e.id);
 if(!cast.length)throw new ServiceError('ACTOR','The pinned scenario has no actors.');
 const audiences=def.entities.filter(e=>e.kind==='human_role').map(e=>e.id);
 return {simulation:true,actorId:cast[0],cast,cursor:0,maxTurns:bounded(policy.maxTurns,1,30,12,'Turns'),maxTokens:bounded(policy.maxTokens,10000,300000,180000,'Token reservation'),intervalSeconds:bounded(policy.intervalSeconds,4,60,8,'Seconds between actors'),stepMinutes:bounded(policy.stepMinutes,0,10,0,'Simulation minutes per turn'),audiences,transitions:def.transitions.map(t=>t.id),releaseInjects:true,adjudicate:false,disclosed:true};
}
export function turnContext(data,id,policy){
 const {s,x}=sessionContext(data,id),def=x.pinned.definition,actor=def.entities.find(e=>e.id===policy.actorId);
 const permitted=def.transitions.filter(t=>policy.transitions.includes(t.id));
 // Actor knowledge and public released cues only. Never include hidden injects/notes,
 // rubrics, answer keys, private reflections, or participant-private messages.
 const assignedRoles=[...new Set(x.roster.filter(r=>!r.observer).map(r=>r.role))];
 const publicAudience=audiences=>audiences?.includes(actor.id)||assignedRoles.length>0&&assignedRoles.every(id=>audiences?.includes(id));
 return {actor:{id:actor.id,name:actor.name,knowledge:actor.knowledge},minute:minutes(s.simulationTime),permittedTransitions:permitted.filter(t=>t.roleId===actor.id),compensations:policy.adjudicate?permitted:[],world:Object.fromEntries(permitted.map(t=>[t.targetId,{state:x.world[t.targetId],budget:Number(x.world[`${t.targetId}:budget`]??def.entities.find(e=>e.id===t.targetId)?.resources??0)}])),releasedEvents:x.events.filter(e=>publicAudience(e.audiences)).slice(-20).map(e=>({id:e.id,title:e.title,detail:e.detail,minute:e.minute})),messages:x.messages.filter(m=>publicAudience(m.audiences)).slice(-10).map(m=>({source:m.source,text:m.text})),audiences:policy.audiences,requests:policy.adjudicate?x.requests.filter(r=>r.state==='pending').map(r=>({id:r.id,intent:r.intent})):[]};
}
export function assessmentContext(data,id){
 const {s,x}=sessionContext(data,id),def=x.pinned.definition;
 // Only deterministic action receipts count as numeric observation sources.
 const observations=data.evidence.filter(e=>e.sessionId===id&&e.source==='Synthetic registered action result').filter(e=>{
  const ev=x.events.find(ev=>ev.id===e.id),t=def.transitions.find(t=>t.id===ev?.kind);
  return t&&def.entities.some(r=>r.id===t.roleId&&r.kind==='human_role');
 }).map(e=>{const ev=x.events.find(ev=>ev.id===e.id),t=def.transitions.find(t=>t.id===ev.kind);return {id:e.id,content:e.content,roleId:t.roleId,minute:ev.minute,participantId:e.participantId||null};});
 return {title:s.title,objectives:def.objectives.filter(o=>x.objectives.includes(o.id)),roster:x.roster.filter(r=>!r.observer).map(r=>({id:r.id,role:r.role})),observations,opportunities:x.injects.filter(i=>i.state==='released').map(i=>({audiences:i.definition.audiences,minute:i.minute})),limitations:'Only recorded human registered action results are observable. Individual attribution requires participantId in the source. Synthetic actor artifacts are NOT participant behavior. Missing evidence is N/O, never zero.'};
}
export function applyAssessment(data,id,content,jobId){
 validateShape(content,schemas.assess);const context=assessmentContext(data,id),w=workflows(data),ids=[],seen=new Set();
 for(const item of content.findings){
  const o=context.objectives.find(o=>o.id===item.objectiveId),key=item.objectiveId+':'+item.subject;if(!o||seen.has(key))throw new ServiceError('OBJECTIVE','Unknown or duplicate objective.');seen.add(key);
  if(item.subject!=='Team'&&!context.roster.some(r=>r.id===item.subject&&r.role===o.roleId))throw new ServiceError('SUBJECT','Individual findings require an eligible non-observer role.');
  const numeric=item.level!=='not_observed';
  const refs=item.evidence.map(id=>context.observations.find(e=>e.id===id));
  const eligible=refs.length&&refs.every(e=>e&&e.roleId===o.roleId&&(item.subject==='Team'||e.participantId===item.subject)&&e.minute>=o.start&&e.minute<=o.end&&context.opportunities.some(i=>i.audiences.includes(o.roleId)&&i.minute<=e.minute));
  if(numeric&&!eligible)throw new ServiceError('MISSING_EVIDENCE','Numeric draft requires eligible human action evidence and a released opportunity.');
  if(!item.claim.trim()||refs.some(r=>!r))throw new ServiceError('EVIDENCE','Unrecorded evidence cannot be cited.');
  const fid=uid('ai-finding');data.findings.push({id:fid,title:o.title,subject:item.subject,status:'draft',level:numeric?Number(item.level):'not_observed',evidence:item.evidence,opportunity:o.id,claim:item.claim,attribution:`AI draft ${jobId}; recorded action evidence only. ${content.limitations}`,reviewer:'Unassigned',version:1});w.findings[fid]={sessionId:id,objectiveId:o.id,inspected:[],history:[{version:1,state:'draft',claim:item.claim,reason:'AI-proposed rubric level; human evidence inspection required'}]};ids.push(fid);
 }
 return {findingIds:ids,description:`${ids.length} AI draft findings created. Inspect evidence and review attribution before approval.`,limitations:content.limitations};
}
export function reportContext(data,id){
 const {s,x}=sessionContext(data,id),w=workflows(data);
 if(!['ended','review','archived'].includes(s.status))throw new ServiceError('STATE','Complete the exercise before drafting a report.');
 return {title:s.title,timeline:x.events.map(e=>({id:e.id,minute:e.minute,title:e.title,detail:e.detail})),findings:data.findings.filter(f=>w.findings[f.id]?.sessionId===id&&f.status==='approved'&&f.subject==='Team').map(f=>({id:f.id,title:f.title,claim:f.claim,evidence:f.evidence,level:f.level})),assessmentImpact:x.assessmentImpact,limitations:'Team-only review draft. No private personal observations or unapproved scores. Human approval and audience review are required.'};
}
export async function applyTurn(engine,scope,id,policy,content,jobId){
 validateShape(content,schemas.turn);const state=engine.snapshot(scope.tenant),data=state.data,{s,x}=sessionContext(data,id),def=x.pinned.definition;
 if(s.status!=='running')throw new ServiceError('PAUSED','Exercise no longer running.');
 const actor=def.entities.find(e=>e.id===policy.actorId),who=`AI · ${actor?.name||policy.actorId}`;
 const execute=(transitionId,actorOnly)=>{
  const t=def.transitions.find(t=>t.id===transitionId&&policy.transitions.includes(t.id));
  if(!t||actorOnly&&t.roleId!==policy.actorId||x.world[t.targetId]!==t.from)throw new ServiceError('PREREQUISITE','AI transition is outside its envelope or precondition is unmet.');
  const budget=Number(x.world[`${t.targetId}:budget`]??def.entities.find(e=>e.id===t.targetId)?.resources??0);
  if(budget<t.cost)throw new ServiceError('RESOURCES','AI action exceeds the resource budget.');
  x.world[`${t.targetId}:budget`]=String(budget-t.cost);x.world[t.targetId]=t.to;
  appendEvent(data,id,`${who} · ${t.name}`,`${t.from} → ${t.to}. ${who} took this registered action. AI task ${jobId}; NOT a participant action.`,t.id,policy.audiences);
 };
 if(content.transitionId){
  try{execute(content.transitionId,true);}
  catch(error){if(!policy.simulation)throw error;appendEvent(data,id,`${who} · action not applied`,error.message||'The registered action was not available.','ai-rejected',policy.audiences);}
 }
 if(content.message){
  let audiences=content.audiences;
  if(policy.simulation){audiences=(Array.isArray(audiences)?audiences:[]).filter(a=>policy.audiences.includes(a));if(!audiences.length)audiences=policy.audiences.slice(0,1);}
  if(content.message.length>2000||!audiences.length||audiences.some(a=>!policy.audiences.includes(a)))throw new ServiceError('AUDIENCE','AI message exceeded permitted delivery bounds.');
  const ev=appendEvent(data,id,`${who} · message`,content.message,'ai-message',audiences);
  x.messages.push({id:uid('ai-msg'),thread:'internal',source:who,text:content.message,minute:minutes(s.simulationTime),attachment:'',status:'delivered',audiences});
  data.evidence.push({id:ev.id,sessionId:id,audiences,title:'AI synthetic actor artifact',type:'document',time:s.simulationTime,version:'1',source:`AI simulation artifact ${jobId}; not participant observation`,content:content.message,downloadable:true});
 }
 if(policy.simulation&&!content.transitionId&&!content.message)appendEvent(data,id,`${who} · waited`,'No registered action was taken this turn.','ai-wait',policy.audiences);
 if(content.resolution!=='none'){
  const r=x.requests.find(r=>r.id===content.requestId&&r.state==='pending');
  if(!policy.adjudicate||!r||!content.rationale.trim())throw new ServiceError('REQUEST','AI adjudication requires an enabled policy and pending request.');
  if(content.resolution==='compensate')execute(content.compensationId,false);
  r.state='resolved';r.resolution=content.resolution;r.rationale='AI bounded adjudication: '+content.rationale;
  appendEvent(data,id,'AI decision adjudicated',r.rationale,'ai-adjudication',policy.audiences);
 }
 x.assessmentImpact.push(`AI bounded turn ${jobId}: synthetic actor/adjudication enabled; human review required.`);improvement(data).assistance[id]='ai';x.version++;
 data.audit.push({action:'ai.turn',resource:id,at:new Date().toISOString()});engine.hydrate(scope.tenant,state);await engine.read(scope);
 if(policy.stepMinutes&&x.clock==='stepped'){
  const remaining=def.termination-minutes(s.simulationTime),step=Math.min(policy.stepMinutes,remaining);
  if(step>=1)await engine.command(scope,{type:'session.step',resourceId:id,idempotencyKey:`${jobId}:step`,payload:{minutes:step}});
 }
 if(policy.releaseInjects){
  const current=engine.snapshot(scope.tenant).data,{s:now,x:runtime}=sessionContext(current,id);
  for(const i of runtime.injects.filter(i=>i.state==='queued'&&(i.definition.trigger==='time'&&i.minute<=minutes(now.simulationTime)||i.definition.trigger==='condition'&&runtime.events.some(e=>e.kind===i.definition.condition)||policy.simulation&&i.definition.trigger==='manual'&&i.minute<=minutes(now.simulationTime))))await engine.command(scope,{type:'inject.release',resourceId:id,idempotencyKey:`${jobId}:release:${i.definition.id}`,payload:{inject:i.definition.id}});
 }
 return {sessionId:id,description:'Bounded AI turn committed. AI artifacts are not participant observations.'};
}
