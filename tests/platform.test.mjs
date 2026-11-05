import test from 'node:test';
import assert from 'node:assert/strict';
import {FixtureAdapter, canScreen, scopeProjection, isOverdue, canApproveFinding} from '../src/platform.ts';
import {createFixtureData} from '../src/fixtures.ts';
import {screens, routeTo, matchRoute} from '../src/routes.ts';
import {assertMetric} from '../src/contracts.ts';

const scope=(overrides={})=>({tenant:'atlas',persona:'manager',state:'ready',epoch:1,...overrides});
const mutation=(type,resourceId,payload={},extra={})=>({type,resourceId,payload,idempotencyKey:crypto.randomUUID(),...extra});
const setup=async(s=scope())=>{const a=new FixtureAdapter();await a.read(s);return a;};
const rejects=(promise,code)=>assert.rejects(promise,e=>e.code===code);

test('all 70 canonical routes round-trip and carry reference trace',()=>{
 assert.equal(screens.length,70);
 for(const screen of screens){assert.equal(matchRoute(routeTo(screen.id))?.screen.id,screen.id,screen.id);assert.ok(screen.requirementIds.length);assert.ok(screen.serviceDependencies.length);}
 assert.equal(matchRoute('/simulate.html').screen.id,'EX-01');
 assert.equal(matchRoute('/o/atlas/exercises/new').screen.id,'EX-02');
 assert.equal(matchRoute('/not-a-page'),null);
});
test('admin does not inherit personal coaching; consultant cannot cross tenant',async()=>{
 assert.equal(canScreen(scope({persona:'admin'}),'PEO-02','p-marcus'),false);
 assert.equal(canScreen(scope({persona:'coach'}),'PEO-02','p-marcus'),true);
 const s=scope({persona:'consultant',tenant:'harbor'});const a=await setup(s);
 assert.equal((await a.read(s)).status,'unavailable');
});
test('observer projection excludes personal and program-only records',()=>{
 const d=scopeProjection(createFixtureData('atlas'),scope({persona:'observer'}));
 for(const key of ['findings','reports','actions','people','scenarios'])assert.equal(d[key].length,0,key);
 assert.equal(d.sessions.length,1);
});
test('observer and disconnected clients cannot issue commands',async()=>{
 for(const [state,persona,code] of [['ready','observer','FORBIDDEN'],['disconnected','manager','READ_ONLY']]){
 const s=scope({state,persona}),a=await setup(s);await rejects(a.command(s,mutation('action.submit','s-ir-01',{action:'verify_backup',target:'backup-01'})),code);}
});
test('accepted is not executed; duplicate and unknown reconciliation are idempotent',async()=>{
 const s=scope(),a=await setup(s),m=mutation('action.submit','s-ir-01',{action:'verify_backup',target:'service',outcome:'unknown'});
 const r=await a.command(s,m);assert.equal(r.status,'unknown');assert.deepEqual(r.committedEventIds,[]);
 assert.deepEqual(await a.command(s,m),r);
 await a.command(s,mutation('action.reconcile','s-ir-01',{originalKey:m.idempotencyKey}));
 const before=(await a.read(s)).data.view.messages.length;
 await a.command(s,mutation('action.reconcile','s-ir-01',{originalKey:m.idempotencyKey}));
 assert.equal((await a.read(s)).data.view.messages.length,before);
 assert.equal((await a.commandStatus(s,m.idempotencyKey)).status,'executed');
});
test('paused sessions reject actions, messages, decisions, and shared writes',async()=>{
 const s=scope(),a=await setup(s);await a.command(s,mutation('session.pause','s-ir-01'));
 for(const type of ['action.submit','message.send','decision.record','team.save'])await rejects(a.command(s,mutation(type,'s-ir-01',{action:'verify_backup',target:'backup-01',message:'Test',note:'Test',question:'Test',owner:'Test',rationale:'Test'})),'PAUSED');
});
test('published reports and scenarios are immutable',async()=>{
 const s=scope(),a=await setup(s);
 await rejects(a.command(s,mutation('report.save','rep-01',{summary:'Changed'})),'IMMUTABLE');
 await rejects(a.command(s,mutation('scenario.save','sc-ir',{title:'Changed',summary:'Changed'})),'IMMUTABLE');
});
test('missing evidence blocks approval; zero is a valid assessed level',async()=>{
 const s=scope(),a=await setup(s);
 await rejects(a.command(s,mutation('finding.approve','f-03')),'MISSING_EVIDENCE');
 assert.equal(canApproveFinding({evidence:['ev-01'],opportunity:'observed',status:'draft',level:0}),true);
 await rejects(a.command(s,mutation('report.approve','rep-02')),'UNAPPROVED_FINDING');
});
test('implemented is not verified; stale revisions conflict',async()=>{
 const s=scope(),a=await setup(s);
 await rejects(a.command(s,mutation('corrective.update','act-01',{status:'verified',rationale:'Test'})),'RETEST_REQUIRED');
 await rejects(a.command(s,mutation('corrective.update','act-01',{status:'implemented',rationale:'Test'})),'VALIDATION');
 await rejects(a.command(s,mutation('corrective.update','act-01',{status:'blocked',rationale:'Test'},{expectedVersion:999})),'CONFLICT');
});
test('pack policy prevents unsupported purpose and delivery combinations',async()=>{
 const s=scope(),a=await setup(s);
 await rejects(a.command(s,mutation('exercise.schedule','new',{scenario:'sc-ir',purpose:'Practice',mode:'Tabletop'})),'PACK_POLICY');
});
test('validation failures do not partially mutate a record',async()=>{
 const s=scope(),a=await setup(s),before=(await a.read(s)).data.view;
 await rejects(a.command(s,mutation('settings.save','atlas',{name:'Changed',timezone:'invalid-zone'})),'VALIDATION');
 await rejects(a.command(s,mutation('corrective.update','act-01',{status:'implemented',evidence:'Test reference'})),'VALIDATION');
 const after=(await a.read(s)).data.view;
 assert.deepEqual(after.settings,before.settings);assert.deepEqual(after.actions,before.actions);
});
test('suppressed values stay null; overdue is derived, not a lifecycle',()=>{
 assert.throws(()=>assertMetric({displayState:'suppressed',value:0}),/Unsupported/);
 assert.equal(assertMetric({displayState:'supported',value:0}).value,0);
 assert.equal(isOverdue({due:'2026-10-01',status:'in_progress'}),true);
 assert.equal(isOverdue({due:'2026-10-01',status:'verified'}),false);
});
