import { ContractError, assertFixtureData, assertMutation, type Scope, type ReadinessAdapter, type FixtureData, type Mutation, type CommandReceipt, type UiRequest, type ScopedView, type Persona } from './contracts.js';
import {createFixtureData, fixtureCutoff} from './fixtures.js';
import {installGlasshouse} from './glasshouse.js';
import {workflows,appendEvent,minutes,assignedRole,permittedReport} from './workflow-model.js';
import {workflowCommand} from './workflow-commands.js';
import {improvement,improvementCommand,verificationState} from './improvement-model.js';

export const personaLabels: Record<Persona,string> = {manager:'Program manager / facilitator',admin:'Organization admin · no coaching',participant:'Participant · self',coach:'Scoped coach',observer:'Observer',guest:'Exercise guest',consultant:'Consultant · Atlas grant only',publisher:'Publisher',operator:'Platform operator · no support grant'};
const program = new Set(['manager','consultant']);
export function can(scope: Scope, capability: string, subject = ''): boolean {
  if (['revoked','expired'].includes(scope.state)) return false;
  if (scope.persona === 'consultant' && scope.tenant !== 'atlas') return false;
  const p = scope.persona;
  if (capability==='publisher') return p==='publisher';
  if (capability==='ops') return p==='operator';
  if (['publisher','operator'].includes(p)) return false;
  if (capability==='organization') return p==='admin'||p==='manager';
  if (capability==='profile') return subject==='p-self'||(p==='coach'&&subject==='p-marcus');
  if (capability==='facilitate'||capability==='review'||capability==='author'||capability==='analytics') return program.has(p);
  if (capability==='directory') return !['observer','guest'].includes(p);
  if (capability==='command') return !['observer','guest','admin'].includes(p);
  if (capability==='program') return !['observer','guest'].includes(p);
  return true;
}
export function canScreen(scope: Scope, id: string, subject = ''): boolean {
  if (id.startsWith('ACC-')) return true;
  if (id.startsWith('PUB-')) return can(scope,'publisher');
  if (id.startsWith('OPS-')) return can(scope,'ops');
  if (['publisher','operator'].includes(scope.persona)) return false;
  if (['revoked','expired'].includes(scope.state)||(scope.persona==='consultant'&&scope.tenant!=='atlas')) return false;
  if (id.startsWith('SET-')) return can(scope,'organization');
  if (id==='FAC-05') return ['manager','consultant','participant','coach','observer','guest'].includes(scope.persona);
  if (id.startsWith('FAC-')) return can(scope,'facilitate');
  if (id.startsWith('AUT-')||id.startsWith('PKG-')||id.startsWith('CTX-')) return can(scope,'author')||can(scope,'organization');
  if (id==='REV-02'||id==='REV-04') return can(scope,'review');
  if (id.startsWith('ANA-')) return can(scope,'analytics');
  if (id==='PEO-02'||id==='PEO-03') return can(scope,'profile',subject||'p-self');
  if (id==='PEO-01') return can(scope,'directory');
  if (id==='EX-02') return can(scope,'author');
  return !['guest','observer'].includes(scope.persona)||['HOME-01','EX-01','EX-03','EX-04','REV-01','SIM-01','SIM-02','SIM-03','SIM-04','SIM-05','SIM-06'].includes(id);
}
export function scopeProjection(data: FixtureData, scope: Scope): FixtureData {
  const result = structuredClone(data);
  const workflow=workflows(result);
  const progress=improvement(result);
  for(const a of result.actions)if(a.status==='verified'&&verificationState(result,a.id)!=='passed'){a.status='verification_pending';a.verification='pending';}
  progress.views=progress.views.filter(v=>can(scope,'analytics')&&v.owner===scope.persona);
  if(!can(scope,'analytics')){progress.retests={};progress.assistance={};}
  if (scope.persona==='operator'||scope.persona==='publisher') return createFixtureData('none');
  if (scope.persona==='consultant'&&scope.tenant!=='atlas') throw new ContractError('UNAVAILABLE','This workspace is unavailable.');
  result.findings=result.findings.filter(f=>f.subject==='Team' ? can(scope,'review')||f.status==='approved' : can(scope,'profile',f.subject));
  result.reports=result.reports.filter(r=>can(scope,'review')||(['published','superseded'].includes(r.status)&&r.audience!=='Review team'));
  for(const [id,x] of Object.entries(workflow.exercises))if(!can(scope,'facilitate')){
    const role=assignedRole(x,scope);x.events=x.events.filter(e=>e.audiences.includes(role)||scope.persona==='observer');
    const allowed=new Set(x.injects.filter(i=>i.state==='released'&&i.definition.audiences.includes(role)).map(i=>i.definition.id));
    x.injects=x.injects.filter(i=>allowed.has(i.definition.id));for(const i of x.injects)i.definition.notes='';
    if(x.pinned){x.pinned.definition.injects=x.pinned.definition.injects.filter(i=>allowed.has(i.id));for(const i of x.pinned.definition.injects)i.notes='';x.pinned.definition.objectives=[];}
    x.requests=[];x.assessmentImpact=[];x.messages=x.messages.filter(m=>(!m.audiences||m.audiences.includes(role))&&(m.thread!=='media'||role==='role-1'));
    if(scope.persona==='observer'||scope.persona==='guest'){x.commands=[];x.decisions=[];}
  }
  if(!can(scope,'author'))workflow.authors={};
  if(!can(scope,'facilitate'))result.evidence=result.evidence.filter(ev=>{const x=workflow.exercises[ev.sessionId||'s-ir-01'];return !ev.audiences||!!x&&ev.audiences.includes(assignedRole(x,scope));});
  for(const id of Object.keys(workflow.findings))if(!result.findings.some(f=>f.id===id))delete workflow.findings[id];
  for(const id of Object.keys(workflow.reports)){if(!result.reports.some(r=>r.id===id)){delete workflow.reports[id];continue;}if(!can(scope,'review')){const state=workflow.reports[id];state.sections=state.sections.filter(s=>s.audience==='Program members'||s.audience==='Participant self');state.history=state.history.map(s=>permittedReport(data,id,scope,s.revision));}}
  if (!can(scope,'author')&&!can(scope,'organization')) result.facts=[];
  if (!can(scope,'profile','p-self')) result.goals=[];
  if (!can(scope,'organization')) result.audit=[];
  if (['guest','observer'].includes(scope.persona)) {result.people=[];result.reports=[];result.actions=[];result.goals=[];result.findings=[];result.scenarios=[];result.sessions=result.sessions.filter(s=>s.id==='s-ir-01');workflow.reports={};workflow.findings={};for(const id of Object.keys(workflow.exercises))if(!result.sessions.some(s=>s.id===id))delete workflow.exercises[id];result.evidence=result.evidence.filter(e=>result.sessions.some(s=>s.id===e.sessionId));}
  return result;
}
export function isOverdue(action: {due:string;status:string}, date=fixtureCutoff): boolean {return action.due<date.slice(0,10)&&!['implemented','verification_pending','verified'].includes(action.status);}
export function canApproveFinding(f:{evidence:string[];opportunity:string;status:string;level:number|string}):boolean {return f.evidence.length>0&&!!f.opportunity&&f.status!=='disputed'&&Number.isInteger(f.level)&&Number(f.level)>=0&&Number(f.level)<=3;}

export class FixtureAdapter implements ReadinessAdapter {
  readonly mode = 'fixture' as const;
  private data = new Map<string,FixtureData>();
  private receipts = new Map<string,CommandReceipt>();
  private pending = new Map<string,Mutation>();
  private inputs = new Map<string,string>();
  private lastScope = '';
  /** Server repository hydration. Never accept a client snapshot over an existing workspace. */
  hydrate(tenant:string,state:{data:FixtureData;receipts?:[string,CommandReceipt][];pending?:[string,Mutation][];inputs?:[string,string][]}) {
    assertFixtureData(state.data);this.data.set(tenant,structuredClone(state.data));
    this.receipts=new Map(state.receipts||[]);this.pending=new Map(state.pending||[]);this.inputs=new Map(state.inputs||[]);
  }
  snapshot(tenant:string) {return structuredClone({data:this.db(tenant),receipts:[...this.receipts],pending:[...this.pending],inputs:[...this.inputs]});}
  private recoverLedger(){try{if(typeof sessionStorage!=='undefined'){const raw=sessionStorage.getItem('strata-command-ledger-v2');if(raw){const saved=JSON.parse(raw);for(const [key,value] of saved.receipts||[])this.receipts.set(key,value);for(const [key,value] of saved.pending||[])this.pending.set(key,value);}}}catch{}}
  private persistLedger(){try{if(typeof sessionStorage!=='undefined')sessionStorage.setItem('strata-command-ledger-v2',JSON.stringify({receipts:[...this.receipts],pending:[...this.pending]}));}catch{}}
  private db(tenant:string) {if(!this.data.has(tenant)){let d=createFixtureData(tenant);try{const saved=typeof sessionStorage!=='undefined'?sessionStorage.getItem(`strata-workflow-v2:${tenant}`):null;if(saved){const parsed=JSON.parse(saved);assertFixtureData(parsed);d=parsed;}}catch{}workflows(d);if(['atlas','harbor'].includes(tenant)){installGlasshouse(d);try{if(typeof sessionStorage!=='undefined')sessionStorage.setItem('strata-workflow-v2:'+tenant,JSON.stringify(d));}catch{}}this.data.set(tenant,d);}return this.data.get(tenant)!;}
  clearScope() { this.receipts.clear();this.pending.clear();this.inputs.clear();this.lastScope=''; }
  async read(scope: Scope): Promise<UiRequest<ScopedView<FixtureData>>> {
    this.recoverLedger();
    if(scope.state==='loading')return {status:'loading'};
    if(scope.state==='error')return {status:'error',code:'FX-READ-01',message:'The read model could not be loaded. Your in-tab draft is still available.',retryable:true};
    if(['revoked','expired'].includes(scope.state))return {status:'unavailable'};
    try {
      const view=scopeProjection(scope.state==='empty'?createFixtureData('none'):this.db(scope.tenant),scope);assertFixtureData(view);
      this.lastScope=`${scope.tenant}:${scope.persona}:${scope.epoch}`;
      return {status:'ready',fetchedAt:fixtureCutoff,stale:['stale','disconnected'].includes(scope.state),data:{tenantId:scope.tenant,resourceId:scope.tenant,revision:'fixture-v1',permissions:[],view}};
    } catch {return {status:'unavailable'};}
  }
  async commandStatus(scope:Scope,id:string) {return this.receipts.get(`${scope.tenant}:${scope.persona}:${id}`)||null;}
  async command(scope:Scope,command:Mutation):Promise<CommandReceipt> {
    this.recoverLedger();
    assertMutation(command);
    const key=`${scope.tenant}:${scope.persona}:${command.idempotencyKey}`;
    const existing=this.receipts.get(key);if(existing){if(this.inputs.has(key)&&this.inputs.get(key)!==JSON.stringify(command))throw new ContractError('IDEMPOTENCY','This request ID was already used for different content.');return structuredClone(existing);}
    if(['disconnected','revoked','expired','error','stale'].includes(scope.state))throw new ContractError('READ_ONLY','Commands require a current, authorized connection. Nothing has been queued.');
    if(this.lastScope!==`${scope.tenant}:${scope.persona}:${scope.epoch}`)throw new ContractError('SCOPE_CHANGED','Reload this workspace before submitting.');
    if(scope.state==='conflict')throw new ContractError('CONFLICT','A newer revision is available. Your input has been preserved; review it before resubmitting.');
    const db=structuredClone(this.db(scope.tenant)), p=command.payload, id=command.resourceId;
    const need=(cap:string,subject='')=>{if(!can(scope,cap,subject))throw new ContractError('FORBIDDEN','This operation is unavailable for your current role.');};
    const required=(name:string)=>{const v=p[name];if(typeof v!=='string'||!v.trim())throw new ContractError('VALIDATION',`${name} is required.`);return v.trim();};
    const version=(v:number)=>{if(command.expectedVersion!==undefined&&command.expectedVersion!==v)throw new ContractError('CONFLICT','This record changed. Reload the current version; your draft has been preserved.');};
    if(['exercise.schedule','exercise.configure'].includes(command.type)){
      const progress=improvement(db),baseline=String(p.baseline||'');
      if(baseline){const a=db.actions.find(a=>a.id===baseline),f=db.findings.find(f=>f.id===a?.findingId);if(!a||f?.status!=='approved'||f.subject!=='Team')throw new ContractError('RETEST_REQUIRED','A retest must reference an action from an approved team finding.');}
      if(command.type==='exercise.configure'&&Object.values(progress.retests).flat().some(r=>r.session===id)&&baseline!==workflows(db).exercises[id]?.baseline)throw new ContractError('IMMUTABLE','A planned retest cannot change its linked action. Schedule a separate attempt.');
    }
    if(['decision.record','message.send','team.save'].includes(command.type)&&db.sessions.find(s=>s.id===id)?.status!=='running')throw new ContractError('PAUSED','Exercise writes require a running assigned session.');
    let status:CommandReceipt['status']='executed';
    if(improvementCommand(db,scope,command,{need,version,required})||workflowCommand(db,scope,command,{need,version,required})) {
      // Rich authoring, session lifecycle, and review commands commit atomically below.
    } else if(command.type==='session.pause'||command.type==='session.resume'||command.type==='session.end') {
      need('facilitate');const s=db.sessions.find(x=>x.id===id);if(!s)throw new ContractError('UNAVAILABLE','Session unavailable.');
      if(command.type==='session.end'){required('rationale');s.status='ended';}else if(s.status==='running'&&command.type==='session.pause')s.status='paused';else if(s.status==='paused'&&command.type==='session.resume')s.status='running';else throw new ContractError('INVALID_STATE','This session cannot make that transition.');s.sequence++;
    } else if(command.type==='action.submit') {
      need('command');const s=db.sessions.find(x=>x.id===id);if(!s||s.status!=='running')throw new ContractError('PAUSED','Actions require a running exercise.');
      const x=workflows(db).exercises[id],role=assignedRole(x,scope),transition=x.pinned?.definition.transitions.find(t=>t.action===required('action')&&t.targetId===required('target')&&(!p.transitionId||t.id===p.transitionId)&&t.roleId===role&&x.world[t.targetId]===t.from)||x.pinned?.definition.transitions.find(t=>t.action===p.action&&t.targetId===p.target&&(!p.transitionId||t.id===p.transitionId));
      version(x.version);
      if(transition&&Number(x.world[`${transition.targetId}:budget`]??x.pinned?.definition.entities.find(e=>e.id===transition.targetId)?.resources??0)<transition.cost)throw new ContractError('RESOURCES','The target resource budget is exhausted.');
      if(!transition)throw new ContractError('UNSUPPORTED','Choose a registered action and its defined target.');if(transition.roleId!==role)throw new ContractError('FORBIDDEN','This role cannot issue the selected action.');if(x.world[transition.targetId]!==transition.from)throw new ContractError('PREREQUISITE','The target no longer meets the required state.');status=p.outcome==='unknown'?'unknown':'accepted';if(!p.transitionId&&x.pinned!.definition.transitions.filter(t=>t.action===transition.action&&t.targetId===transition.targetId&&t.roleId===role&&x.world[t.targetId]===t.from).length>1)throw new ContractError('AMBIGUOUS','Choose a specific registered transition for this branch.');this.pending.set(key,structuredClone({...command,payload:{...p,transitionId:transition.id}}));x.commands.push({id:command.idempotencyKey,action:transition.action,target:transition.targetId,status,eventIds:[]});
    } else if(command.type==='action.reconcile') {
      need('command');const original=required('originalKey'), prior=this.receipts.get(`${scope.tenant}:${scope.persona}:${original}`);if(!prior)throw new ContractError('UNAVAILABLE','Command receipt not found.');
      const originalMutation=this.pending.get(`${scope.tenant}:${scope.persona}:${original}`);if(!originalMutation||originalMutation.resourceId!==id)throw new ContractError('UNAVAILABLE','The original session command is unavailable.');
      if(prior.status!=='executed'){const x=workflows(db).exercises[id],transition=x.pinned?.definition.transitions.find(t=>t.action===originalMutation.payload.action&&t.targetId===originalMutation.payload.target&&(!originalMutation.payload.transitionId||t.id===originalMutation.payload.transitionId));if(!transition||x.world[transition.targetId]!==transition.from)throw new ContractError('PREREQUISITE','The precondition changed; facilitator adjudication is required.');const budget=Number(x.world[`${transition.targetId}:budget`]??x.pinned?.definition.entities.find(e=>e.id===transition.targetId)?.resources??0);if(budget<transition.cost)throw new ContractError('RESOURCES','The target resource budget is exhausted.');x.world[`${transition.targetId}:budget`]=String(budget-transition.cost);x.world[transition.targetId]=transition.to;x.version++;const event=appendEvent(db,id,`Executed: ${transition.name}`,`${transition.from} → ${transition.to}`,transition.id);prior.status='executed';prior.committedEventIds=[event.id];const entry=x.commands.find(c=>c.id===original);if(entry){entry.status='executed';entry.eventIds=[event.id];}db.evidence.push({id:event.id,sessionId:id,audiences:[transition.roleId],title:transition.name,type:'log',time:db.sessions.find(s=>s.id===id)!.simulationTime,version:'1',source:'Synthetic registered action result',content:`${transition.action}: ${transition.from} → ${transition.to}. Command ${original}.`,downloadable:true});}
      for(const evidence of db.evidence.filter(e=>prior.committedEventIds?.includes(e.id)))evidence.participantId='p-self';
    } else if(command.type==='decision.record') {need('command');const x=workflows(db).exercises[id];x.decisions.push({id:crypto.randomUUID(),question:required('question'),owner:required('owner'),rationale:required('rationale'),contributors:required('contributors'),dissent:String(p.dissent||''),evidence:String(p.evidence||'').split(',').map(s=>s.trim()).filter(Boolean),state:'committed'});appendEvent(db,id,'Decision committed','Team agreement recorded separately from execution.');
    } else if(command.type==='message.send') {need('command');const x=workflows(db).exercises[id];const thread=required('thread');if(!['internal','customer','vendor'].includes(thread))throw new ContractError('FORBIDDEN','This channel is unavailable.');const msg={id:command.idempotencyKey,text:required('message'),source:'Jordan Davis · human participant',thread,minute:minutes(db.sessions.find(s=>s.id===id)!.simulationTime),attachment:String(p.attachment||''),status:p.outcome==='unknown'?'unknown' as const:'delivered' as const};x.messages.push(msg);if(msg.status==='unknown')status='unknown';
    } else if(command.type==='team.save') {need('command');const x=workflows(db).exercises[id];version(x.teamVersion);x.teamNote=required('note');x.teamVersion++;x.teamHistory.push(`Version ${x.teamVersion} · Jordan Davis · ${x.teamNote}`);
    } else if(command.type==='finding.approve'||command.type==='finding.challenge') {
      const f=db.findings.find(x=>x.id===id);if(!f)throw new ContractError('UNAVAILABLE','Finding unavailable.');version(f.version);
      if(command.type==='finding.approve'){need('review');if(!canApproveFinding(f))throw new ContractError('MISSING_EVIDENCE','Approval requires inspected evidence, an eligible opportunity, and resolved attribution.');f.status='approved';f.reviewer='Casey Morgan';}else{need('profile',f.subject);f.challenge=required('rationale');f.status='disputed';}f.version++;
    } else if(command.type==='report.publish'||command.type==='report.approve'||command.type==='report.save') {
      need('review');const r=db.reports.find(x=>x.id===id);if(!r)throw new ContractError('UNAVAILABLE','Report unavailable.');version(r.version);
      if(['published','superseded','withdrawn'].includes(r.status))throw new ContractError('IMMUTABLE','Published report revisions are immutable.');
      if(command.type==='report.save'){r.summary=required('summary');r.status='draft';}
      else if(command.type==='report.approve'){if(r.findingIds.some(fid=>db.findings.find(f=>f.id===fid)?.status!=='approved'))throw new ContractError('UNAPPROVED_FINDING','All included findings must be approved before report approval.');r.status='approved';}
      else{if(r.status!=='approved')throw new ContractError('APPROVAL_REQUIRED','Approve this exact report revision and audience first.');r.status='published';}r.version++;
    } else if(command.type==='corrective.update') {
      need('program');const a=db.actions.find(x=>x.id===id);if(!a)throw new ContractError('UNAVAILABLE','Action unavailable.');version(a.version);const next=required('status');
      if(!['planned','in_progress','blocked','implemented','verification_pending','reopened'].includes(next))throw new ContractError('RETEST_REQUIRED','Verification requires qualifying reviewed retest evidence; no verification adapter is connected.');
      if(['implemented','verification_pending'].includes(next))a.evidence=required('evidence');a.status=next as typeof a.status;a.history.push(`Fixture update · ${next.replaceAll('_',' ')} · ${required('rationale')}`);a.version++;
    } else if(command.type==='fact.accept'||command.type==='fact.exclude') {need('author');const f=db.facts.find(x=>x.id===id);if(!f)throw new ContractError('UNAVAILABLE','Fact unavailable.');if(f.status==='conflict'&&command.type==='fact.accept')throw new ContractError('CONFLICT','Resolve the conflicting source before acceptance.');f.status=command.type==='fact.accept'?'accepted':'excluded';f.reviewer='Jordan Davis';
    } else if(command.type==='scenario.fork') {need('author');const s=db.scenarios.find(x=>x.id===id);if(!s||!s.available)throw new ContractError('ENTITLEMENT_REQUIRED','This edition is unavailable for customization.');db.scenarios.push({...structuredClone(s),id:`draft-${db.scenarios.length}`,status:'draft',revision:'Draft 1',validation:'stale',expert:s.expert==='none'?'none':'derived',version:1});
    } else if(command.type==='scenario.save'||command.type==='scenario.validate'||command.type==='scenario.publish') {need('author');const s=db.scenarios.find(x=>x.id===id);if(!s||s.status!=='draft')throw new ContractError('IMMUTABLE','Published revisions are immutable. Create a draft fork first.');version(s.version);
      if(command.type==='scenario.save'){s.title=required('title');s.summary=required('summary');s.validation='stale';s.version++;}else if(command.type==='scenario.validate'){s.validation=s.title&&s.objectives.length?'valid':'invalid';}else{if(s.validation!=='valid')throw new ContractError('VALIDATION_REQUIRED','Validate the current draft before publication.');s.status='published';s.revision='1.0';}
    } else if(command.type==='exercise.schedule') {need('author');const s=db.scenarios.find(x=>x.id===required('scenario'));if(!s||s.status!=='published'||!s.available)throw new ContractError('UNAVAILABLE','Choose a licensed published revision.');if(required('purpose')!==s.purpose||required('mode')!==s.mode)throw new ContractError('PACK_POLICY','Purpose and mode must match this published fixture pack.');const when=required('when');if(!Number.isFinite(Date.parse(when)))throw new ContractError('VALIDATION','Use a valid date and time.');required('facilitator');if(p.disclosure!=='yes')throw new ContractError('DISCLOSURE_REQUIRED','Confirm the participation disclosure.');db.sessions.push({id:`s-new-${db.sessions.length}`,exerciseId:`ex-new-${db.sessions.length}`,title:required('title'),scenarioId:s.id,discipline:s.discipline,purpose:required('purpose'),mode:required('mode'),status:p.lifecycle==='draft'?'draft':'scheduled',when:new Date(when).toISOString(),owner:String(p.facilitator),role:'Incident commander',duration:p.duration?Number(p.duration):s.duration,revision:s.revision,simulationTime:'00:00:00',wallTime:'00:00:00',sequence:0});const created=db.sessions.at(-1)!;const x=workflows(db).exercises[created.id];x.meeting=String(p.meeting||'');x.timezone=String(p.timezone||db.settings.timezone);x.baseline=String(p.baseline||'');
    } else if(command.type==='settings.save') {need('organization');db.settings.name=required('name');const tz=required('timezone');try{new Intl.DateTimeFormat('en',{timeZone:tz});}catch{throw new ContractError('VALIDATION','Choose a valid IANA timezone.');}db.settings.timezone=tz;db.settings.promotions=p.promotions==='yes';
    } else if(command.type==='goal.create') {need('profile','p-self');db.goals.push({id:crypto.randomUUID(),title:required('title'),status:'Active',evidence:'Participant-selected goal · no inferred competence'});
    } else if(command.type==='session.join') {if(['observer','guest','participant','manager','coach','consultant'].includes(scope.persona)&&p.disclosure==='yes'){}else throw new ContractError('DISCLOSURE_REQUIRED','Acknowledge the disclosure before joining.');
    } else throw new ContractError('ADAPTER_UNAVAILABLE','This service is not connected. No change was made.');
    const receipt:CommandReceipt={commandId:command.idempotencyKey,idempotencyKey:command.idempotencyKey,status,committedEventIds:status==='executed'?[`fixture-${db.audit.length+1}`]:[]};
    this.receipts.set(key,receipt);this.inputs.set(key,JSON.stringify(command));this.persistLedger();db.audit.unshift({action:`Fixture · ${command.type} · ${status}`,resource:id,at:new Date().toISOString()});this.data.set(scope.tenant,db);try{if(typeof sessionStorage!=='undefined')sessionStorage.setItem(`strata-workflow-v2:${scope.tenant}`,JSON.stringify(db));}catch{}return structuredClone(receipt);
  }
}
/** Production implementation intentionally unavailable until real service contracts are supplied. */
export class UnconnectedLiveAdapter implements ReadinessAdapter {
  readonly mode='live' as const;
  async read():Promise<UiRequest<ScopedView<FixtureData>>>{return {status:'unavailable'};}
  async command():Promise<CommandReceipt>{throw new ContractError('ADAPTER_UNAVAILABLE','No live service is configured.');}
  async commandStatus():Promise<CommandReceipt|null>{return null;}
  clearScope(){}
}
