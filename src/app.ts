import {type Scope,type Persona,type FixtureState,type FixtureData,type ScreenDefinition,type CommandReceipt,ContractError} from './contracts.js';
import {can,canScreen,personaLabels} from './platform.js';
import {HttpAdapter,type AiProposal} from './http-adapter.js';
import {routeTo,matchRoute,screens,legacyRoutes,defaultIds} from './routes.js';
import {type ViewContext,href} from './view-context.js';
import {escape as e,logo,icon,badge,button,link,notice,empty,requiredMarker,applyTitleCase,titleCase,field,date,avatar,table,panel} from './ui.js';
import {overview,exercises,schedule,exerciseDetail,reports,report,analytics,actions,people,review,recommendations} from './views-program.js';
import {catalog,author,context,packages} from './views-scenarios.js';
import {exerciseView,facilitator} from './views-exercise.js';
import {settings,utilities,access,publisher,operations,componentExplorer} from './views-administration.js';
import {authoring,packageView,authoringEditor} from './workflow-author-views.js';
import {mountScenarioGraph} from './scenario-graph.js';
import {exerciseConfiguration,exerciseOverview,liveExercise,controlRoom} from './workflow-exercise-views.js';
import {reviewWorkflow,reportWorkflow} from './workflow-review-views.js';
import {workflows,authorDigest,reportDigest,permittedReport,type ReportSnapshot} from './workflow-model.js';
import {parsePackage,exportPackage,type ScenarioPackage} from './workflow-package.js';
import {calendarEvent,reportDocx,reportText} from './workflow-exports.js';
import {analyticsCsv,comparison,filterKeys} from './improvement-model.js';
import {form as workflowForm,select as workflowSelect,action as workflowAction,hidden as workflowHidden} from './workflow-ui.js';
import {aiTools,aiRequestForm,automationForm,runStatus,type AiTask,type AiRun} from './ai-ui.js';

const root=document.querySelector<HTMLElement>('#app')!;
const dialog=document.querySelector<HTMLDialogElement>('#app-dialog')!;
const adapter=new HttpAdapter();
let aiProposal:AiProposal|null=null;
function aiJobResult(job:AiTask){
 const r=job.result||{};return `<p>${e(r.description||'Generation pending. Check history; no duplicate request will be sent.')}</p>${r.scenarioId?link('Open Editable Scenario',route('AUT-04',{scenarioId:r.scenarioId,revisionId:r.revision||'Draft 1'}),'secondary'):''}${r.reportId?link('Review Report Draft',route('REV-04',{reportId:r.reportId}),'secondary'):''}${r.findingIds?.length?link(`Review ${r.findingIds.length} Draft Findings`,route('REV-02',{sessionId:job.resource}),'secondary'):''}`;
}
function reviewAiProposal(proposal:AiProposal){
 aiProposal=proposal;
 if(proposal.status!=='proposed'){showModal('AI Request Status',`<p>${e(proposal.status==='generating'?'Generation is still pending or was interrupted. Check history before creating another request.':`This proposal is ${proposal.status}.`)}</p>`);return;}
 const inject=proposal.target.startsWith('inject:');
 const old=current?.data.scenarios.find(s=>s.id===proposal.scenarioId),definition=old?workflows(current!.data).authors[old.id]?.definition:undefined,prior=inject?definition?.injects.find(i=>'inject:'+i.id===proposal.target):null;
 showModal('Review AI Proposal',`<p class="meta">${e(proposal.model)} · Based on version ${proposal.baseVersion} · ${inject?'Inject narrative only; triggers, timing and audiences are unchanged.':'Overview narrative only; world, injects and rubrics are unchanged.'}</p><div class="grid two"><section><h3>Current Text</h3><strong>${e(prior?.title||old?.title||'')}</strong><p class="graph-detail">${e(prior?.body||old?.summary||'')}</p></section><section><h3>Proposed Text</h3><strong>${e(proposal.content.title)}</strong><p class="graph-detail">${e(inject?proposal.content.body:proposal.content.summary)}</p>${inject?`<h3>Facilitator Notes</h3><p class="graph-detail">${e(proposal.content.notes)}</p>`:''}</section></div><h3>Rationale</h3><p>${e(proposal.content.rationale)}</p>${proposal.content.warnings.length?notice('Review Assumptions',proposal.content.warnings.map(e).join(' · '),'warning'):''}<p class="meta">Acceptance saves a new draft version and invalidates previous validation. No publication, assessment or exercise execution is authorized.</p><div class="form-actions">${button('Reject Proposal','ai-reject','secondary')}${button('Accept Reviewed Changes','ai-accept','primary')}</div>`);
}
let scope:Scope={tenant:'atlas',persona:'manager',state:'ready',epoch:0};
setInterval(async()=>{
 const target=(dialog.open?dialog.querySelector<HTMLElement>('[data-ai-run-status]'):null)||root.querySelector<HTMLElement>('[data-ai-runtime-status]'),c=current;
 if(!target||!c)return;
 try{const runs=await adapter.request<AiRun[]>('/api/ai/runs',c.scope,{resource:c.params.sessionId});if(target.isConnected)target.innerHTML=runStatus(runs);}catch{if(target.isConnected)target.innerHTML='<p class="meta">Automation status unavailable. Reload or check local services before relying on this status.</p>';}
},5000);
let current:ViewContext|null=null;
let renderEpoch=0;
let dirty=false;
let receipt:CommandReceipt|null=null;
let result='';
let lastFocus:HTMLElement|null=null;
let originalCommand: {id:string;session:string}|null=null;
let pendingAction: {kind:string;id:string;payload:Record<string,unknown>;version?:number}|null=null;
let inspectedPackage:ScenarioPackage|null=null;
let exportSnapshot:ReportSnapshot|null=null;
const autosaves=new Map<HTMLFormElement,ReturnType<typeof setTimeout>>();
let lastPath=location.pathname+location.search;
let sidebarCollapsed=false;
try{sidebarCollapsed=localStorage.getItem('strata-sidebar-collapsed')==='true';}catch{}
const nav:[string,string,string][]=[['HOME-01','Overview','overview'],['EX-01','Exercises','exercise'],['CAT-01','Scenarios','scenario'],['REP-01','Reports','report'],['ACT-01','Actions','action'],['ANA-01','Analytics','analytics'],['PEO-01','People','people'],['PEO-03','My development','development'],['REC-01','Recommendations','recommend'],['SET-01','Organization','organization']];

function route(id:string,params:Record<string,string>={},query:Record<string,string>={}):string{return routeTo(id,{...current?.params,orgSlug:scope.tenant,...params},query);}
function showModal(title:string,content:string) {
 dialog.classList.remove('author-editor-dialog');
 if(dialog.open)dialog.close();lastFocus=document.activeElement as HTMLElement;
 dialog.innerHTML=`<header class="modal-header"><h2 id="dialog-title">${e(title)}</h2><button type="button" class="icon-btn" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button></header><div class="modal-body">${content}</div>`;
 applyTitleCase(dialog);
 dialog.showModal();
 const focus=dialog.querySelector<HTMLElement>('input:not([type=hidden]),select,textarea,button');focus?.focus();
}
function closeModal(){dialog.close();lastFocus?.focus();}
dialog.addEventListener('close',()=>lastFocus?.focus());
function flash(message:string){const toast=document.querySelector<HTMLElement>('#app-toast')!;toast.textContent=message;toast.hidden=false;window.setTimeout(()=>toast.hidden=true,4500);}
function clearScope(){for(const timer of autosaves.values())clearTimeout(timer);autosaves.clear();for(let i=sessionStorage.length-1;i>=0;i--){const key=sessionStorage.key(i);if(key?.startsWith('strata-draft:'))sessionStorage.removeItem(key);}adapter.clearScope();current=null;receipt=null;originalCommand=null;pendingAction=null;inspectedPackage=null;exportSnapshot=null;dirty=false;result='';if(dialog.open)dialog.close();root.replaceChildren();scope.epoch++;}

function navCurrent(id:string,screen:string):boolean {
 if(id==='HOME-01')return screen===id;
 if(id==='CAT-01')return /^(CAT|AUT|PKG)-/.test(screen);
 if(id==='PEO-03')return screen==='PEO-03'||screen==='PEO-02';
 if(id==='PEO-01')return screen==='PEO-01';
 if(id==='REP-01')return screen==='REP-01'||screen.startsWith('REV-');
 if(id==='SET-01')return screen.startsWith('SET-')||screen.startsWith('CTX-');
 return screen.split('-')[0]===id.split('-')[0];
}
function fixtureBanner(){return `<div class="fixture-banner"><span><strong>Local Services</strong> · Supabase persistence · Synthetic development identities · AI ${adapter.aiConfigured?'connected':'not configured'} · Human review required</span><button data-action="fixture-controls">Inspect states</button></div>`;}
function programShell(c:ViewContext,content:string):string {
 let items=nav;
 if(c.screen.shell==='SH-PUBLISHER')items=[['PUB-01','Profile & rights','people'],['PUB-02','Review inbox','report'],['PUB-04','Publications','scenario']];
 if(c.screen.shell==='SH-OPS')items=[['OPS-01','Platform health','analytics'],['OPS-02','Catalog governance','scenario'],['OPS-03','Support access','shield'],['OPS-04','Data operations','report']];
 const label=c.screen.shell==='SH-PUBLISHER'?'Publisher workspace':c.screen.shell==='SH-OPS'?'Platform operations':'Program workspace';
 const organization=c.screen.shell==='SH-PUBLISHER'?'Publisher fixture':c.screen.shell==='SH-OPS'?'Operations fixture':c.data.settings.name;
 return `<div class="nav-scrim" data-action="close-nav"></div><aside class="sidebar ${sidebarCollapsed?'collapsed':''}" aria-label="Primary sidebar"><a class="brand-link" href="${route('HOME-01')}" data-route aria-label="STRATA overview">${logo()}</a><div class="workspace-label">${label}</div><nav class="main-nav" aria-label="Primary navigation">${items.filter(([id])=>canScreen(scope,id,id==='PEO-03'?'p-self':'')).map(([id,text,i])=>`<a href="${route(id,id==='PEO-03'?{participantId:'p-self'}:{})}" data-route aria-label="${e(text)}" data-tooltip="${e(text)}" ${navCurrent(id,c.screen.id)?'aria-current="page"':''}>${icon(i)}<span>${text}</span></a>`).join('')}</nav><div class="sidebar-bottom"><button class="sidebar-collapse-toggle" data-action="collapse-sidebar" aria-expanded="${!sidebarCollapsed}" aria-label="${sidebarCollapsed?'Expand navigation':'Collapse navigation'}" title="${sidebarCollapsed?'Expand navigation':'Collapse navigation'}"><span class="icon-swap">${icon('sidebar-collapse')}${icon('sidebar-expand','icon-alt')}</span><span>Collapse navigation</span></button><a href="${route('ACC-05')}" data-route class="profile text-link" aria-label="Jordan Davis — profile" title="Jordan Davis — profile">${avatar('Jordan Davis')}<span><strong>Jordan Davis</strong><small>${e(personaLabels[scope.persona])}</small></span></a></div></aside><div class="program-frame"><header class="topbar"><div class="inline"><button class="icon-btn menu-toggle" data-action="toggle-nav" aria-label="Open navigation" aria-expanded="false">${icon('menu')}</button><button class="scope-button" data-action="scope-switcher"><span class="org-mark">${scope.tenant==='atlas'?'AR':'HC'}</span><span><strong>${e(organization)}</strong><small>${scope.persona==='consultant'?'Delegated access · Atlas only':'Synthetic workspace'}</small></span>${icon('down')}</button></div><div class="top-utils"><a class="icon-btn optional" href="${route('HOME-02')}" data-route aria-label="Notifications">${icon('bell')}</a><a class="icon-btn optional" href="${route('HOME-03')}" data-route aria-label="Jobs and downloads">${icon('download')}</a><button class="icon-btn" data-action="help" aria-label="Help">${icon('help')}</button><span class="utility-divider"></span>${avatar('Jordan Davis')}</div></header>${fixtureBanner()}<main id="main" class="main-content" tabindex="-1"><nav class="breadcrumbs" aria-label="Breadcrumb"><a data-route href="${route('HOME-01')}">${e(organization)}</a>${icon('chevron')}<span>${e(c.screen.id==='HOME-01'?'Overview':c.screen.title)}</span></nav>${content}<footer class="screen-footer"><span>${e(c.screen.id)} · ${e(c.screen.shell)} · Synthetic local workspace</span><a href="/ui-reference" data-route>UI reference & integration status</a></footer></main></div>`;
}
function operationalShell(c:ViewContext,content:string):string {
 const s=c.data.sessions.find(s=>s.id===(c.params.sessionId||'s-ir-01'));
 const control=c.screen.shell==='SH-CONTROL';
 const tabs:[string,string][] = control?[['FAC-01','Control room'],['FAC-02','World & actors'],['FAC-03','Injects & pacing'],['FAC-04','Adjudication'],['FAC-05','Recorded replay']]:[['SIM-01','Situation'],['SIM-02','Communications'],['SIM-03','Evidence'],['SIM-04','Investigate'],['SIM-05','Decisions'],['SIM-06','Team workspace']];
 return `<div class="operational"><header class="operational-header"><div class="operational-identity"><a class="brand-link" href="${route('EX-01')}" data-route aria-label="Return to exercises">${logo()}</a><div class="operational-title"><span class="simulation-tag ${control?'control-label':''}">${control?'FACILITATOR CONTROL':'SIMULATION EXERCISE'}</span><strong>${e(s?.title||'Session unavailable')}</strong></div></div><div class="operational-clocks"><div><small>Simulation time</small><strong>${s?.simulationTime||'—'}</strong></div><div class="wall-clock"><small>Wall time</small><strong>${s?.wallTime||'—'}</strong></div><div><span class="connection-label">${scope.state==='disconnected'?'! Disconnected':'● Local database connected'}</span><small style="display:block">Event ${s?.sequence||'—'} · ${e(s?.status||'unavailable')}</small></div></div></header>${fixtureBanner()}<nav class="tabs" aria-label="${control?'Facilitator':'Participant'} tasks">${tabs.map(([id,t])=>`<a href="${route(id)}" data-route ${c.screen.id===id?'aria-current="page"':''}>${t}</a>`).join('')}</nav><main class="main-content" id="main" tabindex="-1">${content}<footer class="screen-footer"><span>${c.screen.id} · ${c.screen.shell}</span>${link('Exit to program',route('EX-01'))}</footer></main></div>`;
}
function selectView(c:ViewContext):string {
 const id=c.screen.id;
 if(id==='UI-REF')return componentExplorer(c);
 if(id==='HOME-01')return overview(c);
 if(id==='HOME-02'||id==='HOME-03')return utilities(c);
 if(id==='EX-01')return exercises(c);if(id==='EX-02')return exerciseConfiguration(c);if(id==='EX-03')return exerciseOverview(c);
 if(id==='EX-04'||id.startsWith('SIM-'))return liveExercise(c);
 if(id.startsWith('FAC-'))return controlRoom(c);
 if(id.startsWith('CAT-'))return catalog(c);if(id.startsWith('AUT-'))return authoring(c);if(id.startsWith('CTX-'))return context(c);if(id.startsWith('PKG-'))return packageView(c);
 if(id==='REP-01')return reports(c);if(id==='REV-04'||id==='REV-05')return reportWorkflow(c);if(id.startsWith('REV-'))return reviewWorkflow(c);
 if(id.startsWith('ANA-'))return analytics(c);if(id.startsWith('ACT-'))return actions(c);if(id.startsWith('PEO-'))return people(c);if(id.startsWith('REC-'))return recommendations(c);
 if(id.startsWith('SET-'))return settings(c);if(id.startsWith('ACC-'))return access(c);if(id.startsWith('PUB-'))return publisher(c);if(id.startsWith('OPS-'))return operations(c);
 return empty('Page unavailable','Return to a permitted destination.');
}
async function render(focus=false){
 const epoch=++renderEpoch;
 const isReference=location.pathname==='/ui-reference';
 const match=isReference?{screen:{id:'UI-REF',title:'UI reference',route:'/ui-reference',shell:'SH-PROGRAM',requirementIds:[],serviceDependencies:[],componentIds:[],stateFixtureIds:[]} as ScreenDefinition,params:{}}:matchRoute(location.pathname);
 if(!match){root.innerHTML=`<div class="access-page"><div class="access-card">${logo()}${empty('Page unavailable','The route does not identify an available resource.',link('Open overview',route('HOME-01'),'primary'))}</div></div>`;return;}
 if(legacyRoutes[location.pathname]){history.replaceState({},'',routeTo(match.screen.id,{...match.params,orgSlug:scope.tenant}));}
 const routeTenant=match.params.orgSlug;
 if(routeTenant&&routeTenant!==scope.tenant){if(routeTenant==='atlas'||routeTenant==='harbor'){clearScope();scope.tenant=routeTenant;}else{root.innerHTML=empty('Workspace unavailable','No access context is available.');return;}}
 if(!canScreen(scope,match.screen.id,match.params.participantId)){
   current=null;root.innerHTML=`<div class="access-page"><div class="access-card">${logo()}${empty(scope.state==='expired'?'Session expired':'Resource unavailable','This resource is unavailable for your current access scope. No private record details are shown.',button('Inspect fixture access','fixture-controls','secondary'))}${link('Choose workspace',route('ACC-03'),'secondary')}</div></div>`;return;
 }
 const response=await adapter.read(scope);if(epoch!==renderEpoch)return;
 if(response.status==='loading'){root.innerHTML=`<main id="main" class="main-content" aria-busy="true" aria-label="Loading workspace"><p role="status">Loading current scope…</p><div class="skeleton title"></div><div class="grid equal"><div class="skeleton"></div><div class="skeleton"></div></div>${button('Inspect fixture state','fixture-controls','secondary','style="margin-top:24px"')}</main>`;return;}
 if(response.status==='error'){root.innerHTML=`<div class="access-page"><div class="access-card">${logo()}${notice('Unable to load workspace',`${response.message} Reference: ${response.code}`,'danger')}<div class="form-actions">${button('Retry','retry','primary')}${button('Inspect states','fixture-controls','secondary')}</div></div></div>`;return;}
 if(response.status!=='ready'){root.innerHTML=`<div class="access-page"><div class="access-card">${logo()}${empty('Resource unavailable','Your session or access grant may have expired.',button('Return to fixture sign-in','sign-out','primary'))}${button('Inspect states','fixture-controls','secondary')}</div></div>`;return;}
 const data=response.data.view;
 current={data,scope,screen:match.screen,params:{...defaultIds,...match.params,orgSlug:scope.tenant},query:new URLSearchParams(location.search),receipt:originalCommand&&originalCommand.session===match.params.sessionId?receipt:null,result,error:''};
 document.title=`${titleCase(match.screen.title)} · STRATA`;
 let content=selectView(current);
 const tools=aiTools(current);if(tools){const heading=/<div class="page-heading">[\s\S]*?<\/div><\/div>/;content=heading.test(content)?content.replace(heading,match=>match+tools):content+tools;}
 if(result)content=`<div class="durable-result">${notice('Fixture result',result,'success')}</div>`+content;
 if(response.stale&&!['SH-EXERCISE','SH-CONTROL'].includes(current.screen.shell))content=`<div style="margin-bottom:24px">${notice('Stale read-only snapshot',`Last fetched ${date(response.fetchedAt,data.settings.timezone,true)}. Refresh scope before submitting commands.`,'warning')}${button('Refresh scope','retry','secondary','style="margin-top:8px"')}</div>`+content;
 if(current.screen.shell==='SH-ACCESS')root.innerHTML=`<div class="access-page"><main id="main" class="access-card" tabindex="-1">${content}<div class="access-footer">${button('Fixture controls','fixture-controls','tertiary')}</div></main></div>`;
 else if(['SH-EXERCISE','SH-CONTROL'].includes(current.screen.shell))root.innerHTML=operationalShell(current,content);
 else root.innerHTML=programShell(current,content);
 root.querySelectorAll<HTMLFormElement>('form[data-readonly]').forEach(form=>form.querySelectorAll<HTMLInputElement>('input,textarea,select,button[type=submit]').forEach(el=>el.disabled=true));
 restoreDrafts();
 mountScenarioGraph(root);
 applyTitleCase(root);
 root.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('form[data-command="scenario.save"] [name="discipline"],form[data-command="scenario.save"] [name="industry"],form[data-command="scenario.save"] [name="purpose"],form[data-command="scenario.save"] [name="mode"]').forEach(el=>el.disabled=true);
 if(current.screen.id==='AUT-02'&&data.scenarios.find(s=>s.id===current!.params.scenarioId)?.status==='published')root.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('form[data-command="scenario.save"] input,form[data-command="scenario.save"] textarea').forEach(el=>el.readOnly=true);
 if(response.stale)root.querySelectorAll<HTMLButtonElement>('form[data-command] button[type=submit]').forEach(el=>el.disabled=true);
 lastPath=location.pathname+location.search;
 if(focus)document.querySelector<HTMLElement>('#main')?.focus({preventScroll:true});
}
async function navigate(path:string,force=false){
 if(dirty&&!force){showModal('Leave unsaved work?',`<p>Your unsent input is held in this tab only. Save through the page’s explicit action before leaving, or discard it.</p><div class="form-actions">${button('Stay on page','close-modal','primary')}${button('Discard & continue','discard-navigate','secondary',`data-path="${e(path)}"`)}</div>`);return;}
 dirty=false;result='';if(dialog.open)closeModal();history.pushState({},'',path);await render(true);window.scrollTo({top:0});
}
async function submit(type:string,id:string,payload:Record<string,unknown>,version?:number,form?:HTMLFormElement):Promise<CommandReceipt|null>{
 const buttonEl=form?.querySelector<HTMLButtonElement>('[type=submit]');const original=buttonEl?.textContent;
 if(buttonEl?.disabled)return null;
 if(buttonEl){buttonEl.disabled=true;buttonEl.textContent='Submitting…';}
 const key=form?.dataset.commandKey||crypto.randomUUID();if(form)form.dataset.commandKey=key;
 try{
  const r=await adapter.command(scope,{type,resourceId:id,payload,expectedVersion:version,idempotencyKey:key});
  if(form){sessionStorage.removeItem(draftKey(form));const timer=autosaves.get(form);if(timer)clearTimeout(timer);autosaves.delete(form);}
  if(type==='action.submit')receipt=r;dirty=false;result=`${type.replaceAll('.',' ')}: ${r.status}. ${r.status==='executed'?'Saved to local Supabase. Simulation outcomes remain governed by registered rules and human review.':r.status==='unknown'?'Outcome not yet confirmed. Reconcile the original command; do not resubmit.':'Accepted is not executed. No consequence has been confirmed.'}`;
  if(type==='action.submit'){originalCommand={id:key,session:id};const consoleForm=root.querySelector<HTMLFormElement>('#action-console');if(consoleForm)sessionStorage.removeItem(draftKey(consoleForm));}
  if(dialog.open)closeModal();return r;
 }catch(err){const message=err instanceof Error?err.message:'The operation could not be completed.';
  if(form){const target=form.querySelector<HTMLElement>('.form-error');if(target){target.textContent=message;target.tabIndex=-1;target.focus();}}
  else showModal('Action not completed',`${notice(err instanceof ContractError?err.code:'Request error',message,'warning')}`);
  if(form&&err instanceof ContractError&&!['CONNECTION','DATABASE_ERROR','REQUEST_FAILED','SERVICE_ERROR'].includes(err.code))delete form.dataset.commandKey;
  return null;
 }finally{if(buttonEl){buttonEl.disabled=false;buttonEl.textContent=original||'Submit';}}
}
async function afterWorkflow(kind:string,id:string){
 const read=await adapter.read(scope);if(read.status!=='ready'){await render();return;}const d=read.data.view;
 if(['scenario.fork','scenario.restore','package.import'].includes(kind)){const s=d.scenarios.at(-1)!;await navigate(route('AUT-02',{scenarioId:s.id,revisionId:s.revision}),true);return;}
 if(kind==='scenario.publish'){const s=d.scenarios.find(s=>s.id===id)!;await navigate(route('AUT-08',{scenarioId:s.id,revisionId:s.revision}),true);return;}
 if(kind==='report.amend'||kind==='report.create'){const r=d.reports.at(-1)!;await navigate(route('REV-04',{reportId:r.id}),true);return;}
 if(kind==='report.publish'){await navigate(route('REV-05',{reportId:id}),true);return;}
 await render();
}
function download(name:string,text:string|Uint8Array,type='application/json'){const data=typeof text==='string'?text:new Uint8Array(text).buffer;const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);flash('Synthetic fixture file downloaded.');}
function fixtureControls(){
 showModal('Inspect fixture mode',`<p>These controls exercise the UI contract with synthetic identities and data. They do not grant access to a live service.</p><form id="fixture-form" class="fixture-controls"><div class="field"><label for="fixture-persona">Fixture identity</label><select id="fixture-persona" name="persona">${Object.entries(personaLabels).map(([v,t])=>`<option value="${v}" ${scope.persona===v?'selected':''}>${e(t)}</option>`).join('')}</select></div><div class="field"><label for="fixture-tenant">Synthetic tenant</label><select id="fixture-tenant" name="tenant"><option value="atlas" ${scope.tenant==='atlas'?'selected':''}>Atlas · populated</option><option value="harbor" ${scope.tenant==='harbor'?'selected':''}>Harbor · first use</option></select></div><div class="field"><label for="fixture-state">Request / access state</label><select id="fixture-state" name="state">${['ready','loading','empty','stale','error','expired','revoked','disconnected','conflict'].map(v=>`<option ${scope.state===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="form-actions"><button type="submit" class="btn primary">Apply fixture scope</button></div></form><p class="prototype-note">Tenant change clears open views, pending receipts, and unsent drafts. Production authorization and realtime services remain integration blockers.</p>`);
}
function confirmMutation(kind:string,id:string,title:string,message:string,fields='',payload:Record<string,unknown>={},version?:number){
 pendingAction={kind,id,payload,version};showModal(title,`<p>${e(message)}</p><form id="confirm-form"><div class="form-error" role="alert"></div>${fields}<div class="form-actions">${button('Cancel','close-modal','secondary')}<button type="submit" class="btn primary">Confirm fixture action</button></div></form>`);
}

function draftKey(form:HTMLFormElement){return `strata-draft:${scope.tenant}:${scope.persona}:${location.pathname}:${form.dataset.command||form.id}:${form.dataset.resource||''}${form.dataset.draftItem?':'+form.dataset.draftItem:''}`;}
function formValues(form:HTMLFormElement):Record<string,unknown>{const data=new FormData(form),values:Record<string,unknown>=Object.fromEntries(data.entries());for(const name of ['bindings','audiences','objectives','findings'])if(form.querySelector(`[name="${name}"]`))values[name]=data.getAll(name).map(String);return values;}
function rememberDraft(form:HTMLFormElement){try{sessionStorage.setItem(draftKey(form),JSON.stringify({values:formValues(form),version:form.dataset.version}));}catch{}}
function restoreDrafts(container:HTMLElement=root){
 for(const form of container.querySelectorAll<HTMLFormElement>('form[data-command],#action-console')){if(form.hasAttribute('data-readonly'))continue;let saved;try{saved=JSON.parse(sessionStorage.getItem(draftKey(form))||'null');}catch{}if(!saved)continue;
  for(const [name,value] of Object.entries(saved.values as Record<string,unknown>))for(const input of form.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>(`[name="${CSS.escape(name)}"]`)){if(input instanceof HTMLInputElement&&input.type==='checkbox')input.checked=Array.isArray(value)?value.includes(input.value):value===input.value;else input.value=String(value);}
  if(saved.version!==form.dataset.version){form.dataset.version=saved.version||'';const error=form.querySelector<HTMLElement>('.form-error');if(error)error.innerHTML=`A newer version is available. Your input was recovered. ${button('Review current version','workflow-conflict','secondary')}`;}
  const status=form.querySelector<HTMLElement>('[data-save-status]');if(status)status.textContent='Recovered unsaved draft';dirty=true;
 }
}
async function autosave(form:HTMLFormElement){
 if(!form.isConnected||!form.checkValidity())return;const state=form.querySelector<HTMLElement>('[data-save-status]'),data=formValues(form),captured=JSON.stringify(data),version=Number(form.dataset.version),tenant=scope.tenant,epoch=scope.epoch;
 try{if(state)state.textContent='Saving…';await adapter.command(scope,{type:form.dataset.command!,resourceId:form.dataset.resource!,payload:data,expectedVersion:version,idempotencyKey:crypto.randomUUID()});if(scope.epoch!==epoch||scope.tenant!==tenant)return;const read=await adapter.read(scope);if(read.status==='ready'){current!.data=read.data.view;form.dataset.version=String(read.data.view.scenarios.find(s=>s.id===form.dataset.resource)?.version);}
  if(JSON.stringify(formValues(form))===captured){sessionStorage.removeItem(draftKey(form));dirty=false;if(state)state.textContent='Saved'}else{rememberDraft(form);if(state)state.textContent='New changes pending';autosaves.set(form,setTimeout(()=>void autosave(form),800));}
 }catch(err){if(state)state.textContent='Draft retained · save failed';const error=form.querySelector<HTMLElement>('.form-error');if(error){error.textContent=err instanceof Error?err.message:'Save failed.';if(err instanceof ContractError&&err.code==='CONFLICT')error.insertAdjacentHTML('beforeend',button('Review current version','workflow-conflict','secondary'));}}
}
function updateClearFilters(target:HTMLElement){const form=target.closest<HTMLFormElement>('form[data-clear-defaults]');if(!form)return;const defaults=JSON.parse(form.dataset.clearDefaults!) as Record<string,string>;const values=new FormData(form);const canClear=form.dataset.appliedFilters==='true'||Object.entries(defaults).some(([key,value])=>String(values.get(key)||'')!==value);const clear=form.querySelector<HTMLButtonElement>('[data-action="clear-filters"]');if(clear)clear.disabled=!canClear;}
document.addEventListener('input',event=>{const el=event.target as HTMLElement;updateClearFilters(el);const form=el.closest<HTMLFormElement>('form[data-command],#action-console');if(form&&!form.hasAttribute('data-readonly')){dirty=true;rememberDraft(form);if(form.dataset.autosave){const existing=autosaves.get(form);if(existing)clearTimeout(existing);autosaves.set(form,setTimeout(()=>void autosave(form),900));}}});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&document.querySelector('.sidebar.open')){
  document.querySelector('.sidebar')?.classList.remove('open');document.querySelector('.nav-scrim')?.classList.remove('open');
  const toggle=document.querySelector<HTMLButtonElement>('.menu-toggle');toggle?.setAttribute('aria-expanded','false');toggle?.focus();
 }
});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
window.addEventListener('popstate',()=>{if(dirty){const target=location.pathname+location.search;history.pushState({},'',lastPath);void navigate(target);}else{result='';void render(true);}});

document.addEventListener('click',async event=>{
 const target=event.target as HTMLElement;const a=target.closest<HTMLAnchorElement>('a[data-route]');
 if(a&&event instanceof MouseEvent&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&event.button===0){event.preventDefault();await navigate(a.pathname+a.search+a.hash);return;}
 const el=target.closest<HTMLElement>('[data-action]');if(!el)return;if(el instanceof HTMLButtonElement&&el.disabled)return;
 if(el.dataset.action==='filter')return;
 event.preventDefault();const action=el.dataset.action,id=el.dataset.id||'';const c=current;
 if(action==='close-modal'){closeModal();return;}
 if(action==='ai-workbench'){
  if(!c)return;if(dirty){flash('Save the current draft before generating AI changes.');return;}showModal('AI Workbench',aiRequestForm(c,el.dataset.operation||'scenario'));return;
 }
 if(action==='ai-controls'){
  if(!c)return;try{const runs=await adapter.request<AiRun[]>('/api/ai/runs',c.scope,{resource:c.params.sessionId});showModal('Bounded AI Automation',automationForm(c,runs));}catch(error){flash((error as Error).message);}return;
 }
 if(action==='ai-stop'){
  if(!c)return;try{await adapter.request('/api/ai/run/stop',c.scope,{id});showModal('Automation Stopped',notice('Stop Confirmed','The run lease is invalidated. In-flight responses cannot apply changes. No automatic resume.'));}catch(error){flash((error as Error).message);}return;
 }
 if(action==='ai-stop-session'){
  if(!c)return;try{await adapter.request('/api/ai/run/stop-session',c.scope,{resource:c.params.sessionId});result='AI automation stopped. In-flight turns cannot apply changes.';await render();}catch(error){flash((error as Error).message);}return;
 }
 if(action==='ai-jobs'){
  if(!c)return;try{const jobs=await adapter.request<AiTask[]>('/api/ai/tasks',c.scope);showModal('AI Job History',table(['Operation','Status','Model / Tokens','Result'],jobs.map(j=>[e(j.operation),e(j.status),`${e(j.model)} · ${j.usage?.total_tokens??'Unknown'}`,aiJobResult(j)]),'Durable AI jobs'));}catch(error){flash((error as Error).message);}return;
 }
 if(action==='ai-accept'||action==='ai-reject'){
  if(!aiProposal||!c)return;const proposal=aiProposal;if(el instanceof HTMLButtonElement)el.disabled=true;
  try{await adapter.decide(c.scope,proposal.id,action==='ai-accept');aiProposal=null;dirty=false;closeModal();result=action==='ai-accept'?'AI proposal accepted and saved to Supabase. Revalidate this draft before publishing.':'AI proposal rejected. Scenario content is unchanged.';await render();}catch(error){showModal('Proposal Not Applied',notice('Review Required',error instanceof Error?error.message:'Request failed.','warning'));}return;
 }
 if(action==='ai-history'){
  if(!c)return;try{const proposals=await adapter.proposals(c.scope,c.params.scenarioId);showModal('AI Proposal History',proposals.length?table(['Target','Model','Status',''],proposals.map(p=>[e(p.target),e(p.model),e(p.status),p.status==='proposed'?button('Review','ai-review','secondary',`data-id="${e(p.id)}"`):'']),'Stored AI proposals'):'<p>No AI proposals for this scenario yet.</p>');}catch(error){flash(error instanceof Error?error.message:'History unavailable.');}return;
 }
 if(action==='ai-review'){
  if(!c)return;try{const proposal=(await adapter.proposals(c.scope,c.params.scenarioId)).find(p=>p.id===id);if(proposal)reviewAiProposal(proposal);}catch(error){flash(error instanceof Error?error.message:'Proposal unavailable.');}return;
 }
 if(action==='ai-generate'){
  if(!c)return;const graph=root.querySelector<HTMLElement>('[data-scenario-graph]'),status=graph?.querySelector<HTMLElement>('[data-graph-status]'),targetNode=graph?.querySelector<HTMLSelectElement>('[data-graph-target]')?.value||'',request=graph?.querySelector<HTMLTextAreaElement>('[name=graph-request]')?.value||'';
  if(!targetNode||!request.trim()){if(status)status.textContent='Select an overview or inject and describe the requested change.';return;}
  const captured={...c.scope},scenarioId=c.params.scenarioId;const requestKey='strata-ai-request:'+captured.tenant+':'+scenarioId;let saved:{id:string;target:string;request:string}|null=null;try{saved=JSON.parse(sessionStorage.getItem(requestKey)||'null');}catch{}
  const pending=saved?.target===targetNode&&saved?.request===request?saved:{id:crypto.randomUUID(),target:targetNode,request};sessionStorage.setItem(requestKey,JSON.stringify(pending));
  if(el instanceof HTMLButtonElement)el.disabled=true;if(status)status.textContent='Generating a proposal… No changes will be applied automatically.';
  try{const proposal=await adapter.propose(captured,scenarioId,targetNode,request,pending.id);if(scope.epoch!==captured.epoch||current?.params.scenarioId!==scenarioId)return;if(status)status.textContent='Proposal stored. Review it before applying.';if(proposal.status!=='generating')sessionStorage.removeItem(requestKey);reviewAiProposal(proposal);}catch(error){if(status)status.textContent=error instanceof Error?error.message:'Generation failed. No changes applied.';}finally{if(el instanceof HTMLButtonElement)el.disabled=false;}return;
 }
 if(action==='clear-filters'){await navigate(el.dataset.target||location.pathname);return;}
 if(action==='collapse-sidebar'){
  sidebarCollapsed=!sidebarCollapsed;try{localStorage.setItem('strata-sidebar-collapsed',String(sidebarCollapsed));}catch{}
  document.querySelector('.sidebar')?.classList.toggle('collapsed',sidebarCollapsed);el.setAttribute('aria-expanded',String(!sidebarCollapsed));el.setAttribute('aria-label',sidebarCollapsed?'Expand navigation':'Collapse navigation');el.setAttribute('title',sidebarCollapsed?'Expand navigation':'Collapse navigation');return;
 }
 if(action==='toggle-nav'||action==='close-nav'){const open=action==='toggle-nav'&&!document.querySelector('.sidebar')?.classList.contains('open');document.querySelector('.sidebar')?.classList.toggle('open',open);document.querySelector('.nav-scrim')?.classList.toggle('open',open);document.querySelector('.menu-toggle')?.setAttribute('aria-expanded',String(open));return;}
 if(action==='fixture-controls'){fixtureControls();return;}
 if(action==='scope-switcher'){if(dirty){await navigate(route('ACC-03'));return;}await navigate(route('ACC-03'));return;}
 if(action==='switch-tenant'){if(dirty){flash('Save or discard unsent changes before switching.');return;}clearScope();scope.tenant=el.dataset.tenant==='harbor'?'harbor':'atlas';scope.state='ready';await navigate(route('HOME-01'),true);return;}
 if(action==='discard-navigate'){dirty=false;closeModal();await navigate(el.dataset.path||route('HOME-01'),true);return;}
 if(action==='retry'){scope.state='ready';await render();return;}
 if(action==='sign-out'){clearScope();scope.state='ready';await navigate('/sign-in',true);return;}
 if(action==='enter-fixture'){clearScope();scope.state='ready';scope.persona='manager';await navigate(route('HOME-01'),true);return;}
 if(action==='help'){showModal('Using STRATA',`<p>Prepare accepted context, select a scenario, schedule an exercise, and review evidence before publishing conclusions.</p><div class="help-row">${icon('shield')}<span>Participant and facilitator workspaces have separate scopes.</span></div><div class="help-row">${icon('action')}<span>Accepted commands are not confirmed executions.</span></div><div class="help-row">${icon('report')}<span>Approved reports and private observations have explicit audiences.</span></div><div class="form-actions">${link('Open UI reference','/ui-reference','secondary')}</div>`);return;}
 if(action==='unavailable'){showModal('Service not connected',`${notice('Integration pending',`${el.dataset.service||'This service'} is not configured. No request was sent and no successful change is claimed.`,'warning')}<p class="prototype-note">The typed live adapter deliberately returns unavailable until the actual service contract is supplied.</p>`);return;}
 if(!c)return;
 if(action==='author-editor'){
  const kind=el.dataset.kind==='objective'?'objective':'inject',item=el.dataset.item||'';
  showModal(`${item?'Edit':'Add'} ${kind==='objective'?'Objective':'Inject'}`,authoringEditor(c,kind,item));dialog.classList.add('author-editor-dialog');restoreDrafts(dialog);
  dialog.querySelector<HTMLElement>('input:not([type=hidden]),select,textarea')?.focus();return;
 }
 if(action==='analytics-save-view'){showModal('Save analytics selection',workflowForm('analytics.save-view','new',undefined,`${workflowHidden('screen',c.screen.id)}${workflowHidden('session',c.params.sessionId||'')}${workflowHidden('query',new URLSearchParams([...c.query].filter(([key])=>[...filterKeys,'view'].includes(key))).toString())}${field('name','View name','',undefined,'Local to this tenant and fixture role.',true)}`,'Save local view'));return;}
 if(action==='analytics-export'){download('strata-selected-opportunities.csv',analyticsCsv(c.data,c.query,c.screen.id==='ANA-02'?c.params.sessionId:undefined),'text/csv');return;}
 if(action==='analytics-comparison-export'){const a=c.data.actions.find(a=>a.id===c.query.get('action')),r=a?c.data.workflow?.improvement?.retests[a.id]?.at(-1):undefined,cmp=comparison(c.data,c.query.get('baseline')||r?.baseline||'',c.query.get('retest')||r?.session||'',c.query.get('baseObjective')||r?.baselineObjective||'',c.query.get('testObjective')||r?.retestObjective||'');const cell=(s:string)=>`"${s.replace(/^[=+@-]/,"'$&").replaceAll('"','""')}"`;download('strata-retest-conditions.csv',[['classification','condition','baseline','retest','matched'],...cmp.checks.map(row=>['SYNTHETIC_LOCAL',row.condition,row.baseline,row.retest,String(row.same)])].map(row=>row.map(cell).join(',')).join('\r\n'),'text/csv');return;}
 if(action==='workflow-command'){
  const kind=el.dataset.command!,payload=JSON.parse(el.dataset.payload||'{}'),version=el.dataset.version?Number(el.dataset.version):undefined;
  if(el.dataset.confirm){confirmMutation(kind,id,'Review requested change',el.dataset.confirm,'',payload,version);return;}
  if(await submit(kind,id,payload,version))await afterWorkflow(kind,id);return;
 }
 if(action==='workflow-reconcile-action'){if(await submit('action.reconcile',el.dataset.session!,{originalKey:id}))await render();return;}
 if(action==='workflow-conflict'){
  const form=el.closest<HTMLFormElement>('form')!;const read=await adapter.read(scope);if(read.status!=='ready')return;const cmd=form.dataset.command||'',id=form.dataset.resource||'';
  const currentVersion=cmd.startsWith('scenario.')?read.data.view.scenarios.find(s=>s.id===id)?.version:cmd==='team.save'?workflows(read.data.view).exercises[id]?.teamVersion:cmd.startsWith('report.')?read.data.view.reports.find(r=>r.id===id)?.version:cmd.startsWith('finding.')?read.data.view.findings.find(f=>f.id===id)?.version:undefined;
  if(form.closest('.author-editor-dialog')){const error=form.querySelector<HTMLElement>('.form-error')!;error.innerHTML=`<p>Your recovered draft is retained. Review the current revision (${currentVersion}) before rebasing.</p><details><summary>Current scenario definition</summary><pre class="evidence-content">${e(JSON.stringify(workflows(read.data.view).authors[id]?.definition,null,2))}</pre></details>${button('Keep my draft on current version','workflow-rebase','secondary',`data-version="${currentVersion}" data-resource="${e(id)}"`)}`;return;}
  showModal('Resolve concurrent change',`<p>Your draft stays in the form. Current revision: ${currentVersion}. Compare before rebasing.</p><pre class="evidence-content">${e(JSON.stringify(cmd.startsWith('scenario.')?read.data.view.scenarios.find(s=>s.id===id):cmd==='team.save'?workflows(read.data.view).exercises[id]?.teamNote:read.data.view.reports.find(r=>r.id===id),null,2))}</pre>${button('Keep my draft on current version','workflow-rebase','primary',`data-version="${currentVersion}" data-resource="${e(id)}"`)}`);return;
 }
 if(action==='workflow-rebase'){const form=el.closest<HTMLFormElement>('form')||root.querySelector<HTMLFormElement>(`form[data-resource="${CSS.escape(el.dataset.resource||'')}"]`);if(form){form.dataset.version=el.dataset.version;form.querySelector('.form-error')!.textContent='Draft rebased. Review and save explicitly.';rememberDraft(form);}if(!form?.closest('.author-editor-dialog'))closeModal();return;}
 if(action==='workflow-decision-revise'){showModal('Revise decision with reason',workflowForm('decision.revise',el.dataset.session!,undefined,`${workflowHidden('decision',id)}${field('rationale','Revised rationale and reason','',undefined,'Preserves the prior commitment.',true,'textarea')}`,'Save revised decision'));return;}
 if(action==='workflow-inject-change'){showModal('Change inject pacing',workflowForm('inject.delay',el.dataset.session!,undefined,`${workflowHidden('inject',id)}${field('minutes','Delay simulation minutes','5',undefined,'',true,'number')}${field('rationale','Pacing rationale','',undefined,'Recorded as assessment impact.',true,'textarea')}`,'Delay inject')+workflowAction('Cancel queued inject','inject.cancel',el.dataset.session!,{inject:id,rationale:'Canceled after facilitator pacing review'},'Cancel the queued cue? Criteria remain pinned.'));return;}
 if(action==='workflow-resolve-request'){const x=workflows(c.data).exercises[el.dataset.session!];showModal('Resolve attributed request',workflowForm('adjudication.resolve',el.dataset.session!,x.version,`${workflowHidden('request',id)}${field('resolution','Resolution','clarify',['clarify','reject','compensate'],'Compensation uses a registered transition only.',true)}${workflowSelect('transition','Registered compensating transition',x.pinned?.definition.transitions.map(t=>({id:t.id,name:t.name}))||[])}${field('rationale','Resolution rationale','',undefined,'',true,'textarea')}${field('impact','Assessment re-review impact','',undefined,'Required for compensation.',true,'textarea')}`,'Confirm resolution'));return;}
 if(action==='workflow-finding-reject'){const f=c.data.findings.find(f=>f.id===id)!;showModal('Reject finding with rationale',workflowForm('finding.reject',id,f.version,field('rationale','Reason','',undefined,'Preserved in correction history.',true,'textarea'),'Reject observation'));return;}
 if(action==='workflow-report-withdraw'){const r=c.data.reports.find(r=>r.id===id)!;showModal('Withdraw publication',workflowForm('report.withdraw',id,r.version,field('rationale','Withdrawal rationale','',undefined,'Reader and exports will show unavailable.',true,'textarea'),'Withdraw report'));return;}
 if(action==='workflow-add-section'){const r=c.data.reports.find(r=>r.id===id)!,state=workflows(c.data).reports[id];if(dirty){flash('Save the current report before adding a section.');return;}if(await submit('report.save',id,{title:r.title,summary:r.summary,audience:r.audience,findings:r.findingIds,sections:JSON.stringify([...state.sections,{id:crypto.randomUUID(),title:'New section',body:'Add reviewed narrative and limitations.',audience:'Review team'}])},r.version))await render();return;}
 if(action==='workflow-calendar'){const s=c.data.sessions.find(s=>s.id===id);if(s)download(`${s.id}.ics`,calendarEvent(s),'text/calendar');return;}
 if(action==='workflow-export-package'){try{const pack=exportPackage(c.data,id,el.dataset.profile==='private'?'private':'portable',el.dataset.facts==='true');download(`${id}-${pack.profile}.json`,JSON.stringify(pack,null,2));}catch(err){flash((err as Error).message);}return;}
 if(action==='workflow-import-commit'&&inspectedPackage){if(await submit('package.import','new',{package:inspectedPackage}))await afterWorkflow('package.import','new');return;}
 if(action==='workflow-export-report'){try{exportSnapshot=permittedReport(c.data,id,scope,el.dataset.revision);showModal('Export exact published snapshot',`<dl class="detail-dl"><dt>Revision</dt><dd>${e(exportSnapshot.revision)}</dd><dt>Audience</dt><dd>${e(exportSnapshot.audience)}</dd><dt>Included sections</dt><dd>${exportSnapshot.sections.map(s=>e(s.title)).join(', ')}</dd><dt>Excluded</dt><dd>Unpermitted sections, private observations outside scope, unpublished drafts.</dd></dl><div class="form-actions">${button('Download JSON','workflow-report-json','primary')}${button('Download DOCX','workflow-report-docx','secondary')}${button('Print / save PDF','workflow-report-print','secondary')}</div>`);}catch(err){flash((err as Error).message);}return;}
 if(action?.startsWith('workflow-report-')&&exportSnapshot){if(action==='workflow-report-json')download('strata-published-report.json',JSON.stringify(exportSnapshot,null,2));if(action==='workflow-report-docx')download('strata-published-report.docx',reportDocx(exportSnapshot),'application/vnd.openxmlformats-officedocument.wordprocessingml.document');if(action==='workflow-report-print'){const printWindow=window.open('','_blank');if(printWindow){printWindow.document.write(`<!doctype html><html><head><title>${e(exportSnapshot.title)}</title><style>body{font:16px/1.6 system-ui;max-width:800px;margin:40px auto}p{white-space:pre-wrap}</style></head><body>${reportText(exportSnapshot).map(t=>`<p>${e(t)}</p>`).join('')}</body></html>`);printWindow.document.close();printWindow.print();}else flash('Allow the print window to save this snapshot as PDF.');}return;}
 if(action==='evidence'){const ev=c.data.evidence.find(ev=>ev.id===id);showModal(ev?.title||'Evidence unavailable',ev?`<div class="inline">${badge('Simulated evidence','info')}${badge(`Version ${ev.version}`)}</div><p class="meta" style="margin:12px 0 20px">${e(ev.source)} · ${ev.time}</p><div class="evidence-content">${e(ev.content)}</div>`:empty('Evidence unavailable','No authorized evidence is available.'));return;}
 if(action==='copy-citation'){const ev=c.data.evidence.find(ev=>ev.id===id);if(ev){await navigator.clipboard.writeText(`${ev.id} · ${ev.title} · v${ev.version} · ${ev.source}`);flash('Evidence citation copied.');}return;}
 if(action==='download-evidence'){const ev=c.data.evidence.find(ev=>ev.id===id);if(ev?.downloadable)download(`fixture-${ev.id}.txt`,`${ev.title}\nVersion ${ev.version}\nSIMULATED EVIDENCE\n\n${ev.content}`,'text/plain');return;}
 if(action==='role-brief'){showModal('Role brief · incident commander',`<p>Coordinate a shared view of known facts, confirm ownership, and record decision rationale and uncertainty.</p><ul class="bullet-list"><li>Use released evidence only.</li><li>Commitments do not execute simulated actions.</li><li>Escalate unsupported intent to the facilitator.</li><li>No live personal score is displayed.</li></ul>`);return;}
 if(action==='fork-scenario'){const r=await submit('scenario.fork',id,{});if(r){const read=await adapter.read(scope);if(read.status==='ready'){const draft=read.data.view.scenarios.at(-1)!;await navigate(route('AUT-02',{scenarioId:draft.id,revisionId:draft.revision}),true);}}return;}
 if(action==='validate-scenario'){const s=c.data.scenarios.find(s=>s.id===id);if(await submit('scenario.validate',id,{},s?.version))await render();return;}
 if(action==='publish-scenario'){confirmMutation('scenario.publish',id,'Publish fixture revision?','This creates an immutable local fixture publication. Live validation, rights, and publication remain unconnected.');return;}
 if(action==='fact-accept'||action==='fact-exclude'){if(await submit(action==='fact-accept'?'fact.accept':'fact.exclude',id,{}))await render();return;}
 if(action==='pause-session'||action==='resume-session'){if(await submit(action==='pause-session'?'session.pause':'session.resume',id,{}))await render();return;}
 if(action==='end-session'){const x=workflows(c.data).exercises[id],pending=x.commands.filter(cmd=>cmd.status!=='executed');confirmMutation('session.end',id,'End this exercise?',`Ending makes the session read-only. ${pending.length} commands remain unresolved; their outcomes are retained for review.`,`${notice('Assessment impact','Ending stops participant actions. Unfinished opportunities and facilitator overrides remain recorded.','warning')}<div style="margin-top:20px">${field('rationale','Reason for ending','',undefined,'Recorded with the end event and assessment impact.',true,'textarea')}</div>`,{},x.version);return;}
 if(action==='reconcile-command'&&originalCommand){const original={...originalCommand};if(await submit('action.reconcile',original.session,{originalKey:original.id})){receipt=await adapter.commandStatus(scope,original.id);result='Original fixture command reconciled as executed. The same command ID was retained; no duplicate action was submitted.';await render();}return;}
 if(action==='approve-finding'){const f=c.data.findings.find(f=>f.id===id);confirmMutation('finding.approve',id,'Approve reviewed finding?','Confirm that you inspected the evidence and resolved attribution. The original observation remains revisioned.',`<label class="check-label"><input name="inspected" type="checkbox" value="yes" required><span>I inspected every cited reference and the eligible opportunity. ${requiredMarker()}</span></label>`,{version:f?.version});return;}
 if(action==='challenge-finding'){confirmMutation('finding.challenge',id,'Challenge attribution','Your explanation remains attached to the observation. Accepted corrections require dependent report and profile amendments.',field('rationale','Correction explanation','',undefined,'Describe the specific attribution or evidence issue.',true,'textarea'));return;}
 if(action==='report-approve'||action==='report-publish'){confirmMutation(action==='report-approve'?'report.approve':'report.publish',id,action==='report-approve'?'Approve report revision?':'Publish approved report?','Approval and publication apply to the exact report revision and audience. Subsequent edits require renewed approval.');return;}
 if(action==='new-goal'){showModal('Add a development goal',`<form data-command="goal.create" data-resource="p-self"><div class="form-error" role="alert"></div>${field('title','Your development goal','',undefined,'Private to you and an assigned coach; excluded from commercial targeting.',true,'textarea')}<div class="form-actions"><button type="submit" class="btn primary">Save fixture goal</button></div></form>`);return;}
 if(action==='dismiss-recommendation'){el.closest('.panel')?.replaceWith(Object.assign(document.createElement('p'),{className:'notice info',textContent:'Recommendation dismissed for this view. It remains available in the scenario catalog.'}));return;}
 if(action==='export-report'||action==='export-passport'||action==='export-metrics'){
 const subject=action==='export-report'?'Approved report revision':action==='export-passport'?'Your approved personal summary':'Reviewed metric definition and denominator';
 showModal('Export preview',`<dl class="detail-dl"><dt>Resource</dt><dd>${subject}</dd><dt>Audience</dt><dd>Current permitted scope only</dd><dt>Excluded</dt><dd>Other participants’ private observations, secrets, and hidden evidence</dd><dt>Format</dt><dd>${action==='export-metrics'?'CSV':'PDF / DOCX / JSON · configured adapter required'}</dd></dl><div class="section-gap">${notice('Live export service unavailable','Rights, redaction, revision pinning, and download authorization require server checks. No production export was generated.','warning')}</div>${action==='export-metrics'?`<div class="form-actions">${button('Download labeled fixture CSV','download-metrics','secondary')}</div>`:''}`);return;
 }
 if(action==='download-metrics'){download('strata-synthetic-coverage.csv','scope,definition,evidence_cutoff,objective,observed,eligible,coverage_percent\nSYNTHETIC_ATLAS,coverage-v1,2026-10-09,Containment,8,8,100\nSYNTHETIC_ATLAS,coverage-v1,2026-10-09,Recovery validation,6,10,60\nSYNTHETIC_ATLAS,coverage-v1,2026-10-09,Communication,4,6,66.7\n','text/csv');return;}
 if(action==='download-package'){const s=c.data.scenarios.find(s=>s.id===id);if(s?.available)download(`strata-fixture-${s.id}.json`,JSON.stringify({format:'strata-fixture-preview',version:'1.0',synthetic:true,scenario:{title:s.title,discipline:s.discipline,mode:s.mode,purpose:s.purpose,duration:s.duration,objectives:s.objectives},provenance:'Synthetic UI test fixture; no expert approval or production rights claimed'},null,2));return;}
 if(action==='inspect-package'){await inspectPackage();return;}
});

document.addEventListener('submit',async event=>{
 const form=event.target as HTMLFormElement;if(!(form instanceof HTMLFormElement))return;event.preventDefault();
 const values=Object.fromEntries(new FormData(form).entries()) as Record<string,string>;
 if(form.id==='ai-task-form'||form.id==='ai-run-form'){
  if(!current)return;const captured={...current.scope},resource=form.dataset.resource!,operation=form.dataset.operation||'run',key=`strata-ai-job:${captured.tenant}:${operation}:${resource}`;
  const fd=new FormData(form),policy=form.id==='ai-run-form'?{actorId:values.actorId,maxTurns:Number(values.maxTurns),maxTokens:Number(values.maxTokens),intervalSeconds:Number(values.intervalSeconds),stepMinutes:Number(values.stepMinutes),audiences:fd.getAll('audiences'),transitions:fd.getAll('transitions'),releaseInjects:fd.has('releaseInjects'),adjudicate:fd.has('adjudicate'),disclosed:fd.has('disclosed')}:null;
  const fingerprint=JSON.stringify({request:values.request,policy});let saved:{id:string;fingerprint:string}|null=null;try{saved=JSON.parse(sessionStorage.getItem(key)||'null');}catch{}
  const pending=saved?.fingerprint===fingerprint?saved:{id:crypto.randomUUID(),fingerprint};sessionStorage.setItem(key,JSON.stringify(pending));
  const submitButton=form.querySelector<HTMLButtonElement>('button[type=submit]')!;submitButton.disabled=true;submitButton.textContent='Working…';
  try{
   if(policy){const run=await adapter.request<AiRun>('/api/ai/run/start',captured,{id:pending.id,resource,policy});sessionStorage.removeItem(key);closeModal();dirty=false;result=run.status==='running'?'Bounded AI automation enabled. Monitor it from the facilitator control room; Stop invalidates in-flight turns.':`Original AI run is ${run.status}. No new run was enabled. Review status before enabling again.`;await render();}
   else{const job=await adapter.request<AiTask>('/api/ai/task',captured,{id:pending.id,operation,resource,request:values.request});if(job.status!=='running')sessionStorage.removeItem(key);if(scope.epoch!==captured.epoch)return;dirty=false;await render();showModal('AI Job Result',aiJobResult(job)+`<p class="meta">${e(job.status)} · ${e(job.model||'')} · ${job.usage?.total_tokens??'Unknown'} tokens</p>`);}
  }catch(error){const errorEl=form.querySelector<HTMLElement>('.form-error');if(errorEl)errorEl.textContent=(error as Error).message+' Check AI Job History before retrying. The original request ID is preserved.';submitButton.disabled=false;submitButton.textContent='Check / Retry Original Request';}
  return;
 }
 if(form.hasAttribute('data-filter-form')){const q=new URLSearchParams(values);await navigate(location.pathname+'?'+q);return;}
 if(form.id==='fixture-form'){
  const destination=location.pathname;clearScope();scope={tenant:values.tenant==='harbor'?'harbor':'atlas',persona:values.persona as Persona,state:values.state as FixtureState,epoch:scope.epoch};
  let next=destination.replace(/\/o\/(atlas|harbor)/,`/o/${scope.tenant}`);
  if(scope.persona==='publisher')next=route('PUB-01');else if(scope.persona==='operator')next=route('OPS-01');else if(next.startsWith('/publisher')||next.startsWith('/ops')||next.startsWith('/sign-in'))next=route('HOME-01');
  if(dialog.open)closeModal();history.pushState({},'',next);await render(true);return;
 }
 if(form.id==='action-console'){
  const transition=workflows(current!.data).exercises[form.dataset.resource||'s-ir-01'].pinned?.definition.transitions.find(t=>t.id===values.transitionId);if(transition){values.action=transition.action;values.target=transition.targetId;}
  confirmMutation('action.submit',form.dataset.resource||'s-ir-01','Review simulated action','Submitting a typed action creates a receipt. Acceptance does not change the displayed world; execution must be confirmed.',`<dl class="detail-dl"><dt>Registered action</dt><dd>${e(values.action)}</dd><dt>Target</dt><dd>${e(values.target)}</dd><dt>Consequence</dt><dd>${values.action==='verify_backup'?'Read-only integrity investigation':'Changes simulated segment isolation'}</dd><dt>Intent</dt><dd>${e(values.intent||'No additional intent')}</dd></dl>`,values,workflows(current!.data).exercises[form.dataset.resource||'s-ir-01'].version);return;
 }
 if(form.id==='confirm-form'&&pendingAction){
  const p=pendingAction;let version:number|undefined=p.version;
  const r=await submit(p.kind,p.id,{...p.payload,...values},version,form);if(r){pendingAction=null;await afterWorkflow(p.kind,p.id);}return;
 }
 if(form.id==='workflow-import'){
  const error=form.querySelector<HTMLElement>('.form-error')!,out=document.querySelector<HTMLElement>('#import-result')!;inspectedPackage=null;
  try{const file=document.querySelector<HTMLInputElement>('#workflow-package-file')?.files?.[0];if(file&&file.size>1_000_000)throw new Error('Local package limit: 1 MB.');const raw=file?await file.text():values.package;if(new TextEncoder().encode(raw).length>1_000_000)throw new Error('Local package limit: 1 MB.');inspectedPackage=parsePackage(raw);error.textContent='';out.innerHTML=panel('Validated import preview',`<div class="panel-body"><h2>${e(inspectedPackage.scenario.title)}</h2><p>${inspectedPackage.definition.entities.length} entities · ${inspectedPackage.definition.transitions.length} transitions · ${inspectedPackage.definition.objectives.length} objectives</p><p>IDs are preserved within the new isolated draft. Organization bindings are cleared; signatures and approvals are not inherited. Inline text assets only.</p><pre class="evidence-content">${e(JSON.stringify(inspectedPackage,null,2))}</pre>${button('Commit as a new draft','workflow-import-commit','primary')}</div>`);}catch(err){error.textContent=(err as Error).message;out.innerHTML='';}return;
 }
 if(form.dataset.command){
  const cmd=form.dataset.command;const payload:Record<string,unknown>=formValues(form);
  if(cmd==='adjudication.request'&&values.glasshouseAction)payload.intent=`${values.glasshouseAction}: ${values.intent}`;
  if(cmd==='report.save'){const n=Number(values['section-count']);payload.sections=JSON.stringify(Array.from({length:n},(_,i)=>({id:values[`section-id-${i}`],title:values[`section-title-${i}`],body:values[`section-body-${i}`],audience:values[`section-audience-${i}`]})));}
  const r=await submit(cmd,form.dataset.resource||'',payload,form.dataset.version?Number(form.dataset.version):undefined,form);
  if(r){if(form.dataset.next){const next=route(form.dataset.next);const preserved=result;await navigate(next,true);result=preserved;await render();}else await afterWorkflow(cmd,form.dataset.resource||'');if(form.dataset.draftItem){const kind=cmd==='scenario.objective'?'objective':'inject',item=String(payload.itemId||'');root.querySelector<HTMLElement>(`[data-action="author-editor"][data-kind="${kind}"]${item?`[data-item="${CSS.escape(item)}"]`:':not([data-item])'}`)?.focus();}}return;
 }
});
async function inspectPackage(){
 const form=document.querySelector<HTMLFormElement>('#package-form')!;const error=form.querySelector<HTMLElement>('.form-error')!;const output=document.querySelector<HTMLElement>('#package-result')!;error.textContent='';output.innerHTML='';
 try{
  const file=document.querySelector<HTMLInputElement>('#package-file')?.files?.[0];let raw=(form.querySelector('[name=package]') as HTMLTextAreaElement).value;
  if(file){if(file.size>1_000_000)throw new Error('The local preview limit is 1 MB.');raw=await file.text();}else if(new TextEncoder().encode(raw).length>1_000_000)throw new Error('The local preview limit is 1 MB.');
  const parsed=JSON.parse(raw);if(!parsed||typeof parsed!=='object'||parsed.format!=='strata-fixture-preview'||parsed.synthetic!==true||typeof parsed.scenario?.title!=='string')throw new Error('Unsupported package. Use the labeled synthetic example to inspect this fixture flow.');
  const allowed=['format','version','synthetic','scenario','provenance'];if(Object.keys(parsed).some(k=>!allowed.includes(k)))throw new Error('Unexpected top-level data. User, access, session, and secret records are not accepted.');
  output.innerHTML=notice('Local JSON structure inspected',`${parsed.scenario.title} · fixture preview only. Rights, signatures, assets, references, and quarantine are not validated; import is blocked until D-PKG is connected.`,'warning');
 }catch(err){error.textContent=err instanceof Error?err.message:'Package could not be inspected.';}
}
document.addEventListener('change',event=>{
 const input=event.target as HTMLInputElement;
 updateClearFilters(input);
 if(input.name==='period'&&input.value==='custom'){const filters=input.closest('.analytics-filter-bar');const details=filters?.querySelector<HTMLDetailsElement>('details');if(details){details.open=true;details.querySelector<HTMLInputElement>('[name=from]')?.focus();}}
 if(input.name==='session'&&input.closest<HTMLFormElement>('form')?.dataset.command==='corrective.link-retest'){
  const target=input.closest('form')?.querySelector<HTMLSelectElement>('[name="retestObjective"]'),definition=current?workflows(current.data).exercises[input.value]?.pinned?.definition:undefined;
  if(target)target.replaceChildren(...(definition?.objectives||[]).map(o=>new Option(o.title,o.id)));return;
 }
 if(input.id==='inline-artifact-file'){const file=input.files?.[0],form=input.closest<HTMLFormElement>('form');if(file&&form){const error=form.querySelector<HTMLElement>('.form-error')!;if(file.size>1_000_000||!file.name.toLowerCase().endsWith('.txt')){error.textContent='Only .txt artifacts up to 1 MB are supported in this fixture.';return;}void file.text().then(text=>{const field=form.querySelector<HTMLTextAreaElement>('[name=artifact]')!;field.value=text;dirty=true;rememberDraft(form);error.textContent='Text artifact loaded. Inspect and save explicitly.';});}return;}
 if(input.id==='field-scenario'){
  const scenario=current?.data.scenarios.find(s=>s.id===input.value);
  if(scenario)for(const key of ['purpose','mode'] as const){const select=document.querySelector<HTMLSelectElement>(`select[name="${key}"]`);if(select)select.replaceChildren(new Option(scenario[key],scenario[key]));}
  if(scenario){const duration=document.querySelector<HTMLInputElement>('#field-duration');if(duration)duration.value=String(scenario.duration);}
 }
 if(input.id==='replay-seek'){const events=[['01','Backup candidate released','01:32:00 · EV-01 became available.'],['14','Containment executed','01:48:00 · Registered action confirmed.'],['18','Monitoring indicator received','02:14:32 · Exposure remains under review.']];const event=events[Number(input.value)];document.querySelector('#replay-event')!.innerHTML=`${badge(`Event ${event[0]}`)}<h3 style="margin-top:12px">${event[1]}</h3><p class="muted">Simulation ${event[2]}</p>`;}
});
void render();
