import test from 'node:test';
import assert from 'node:assert/strict';
import {FixtureAdapter} from '../dist/platform.js';
import {createFixtureData} from '../dist/fixtures.js';
import {glasshousePackage,installGlasshouse} from '../dist/glasshouse.js';
import {parsePackage} from '../dist/workflow-package.js';
import {workflows,validation} from '../dist/workflow-model.js';

const scope={tenant:'harbor',persona:'manager',state:'ready',epoch:1};
const setup=async()=>{const a=new FixtureAdapter();const read=async(persona='manager')=>(await a.read({...scope,persona})).data.view;const send=async(type,payload={},persona='manager')=>{await read(persona);return a.command({...scope,persona},{type,resourceId:'s-glasshouse-01',payload,idempotencyKey:crypto.randomUUID()});};await read();return {a,read,send};};
test('GLASSHOUSE adapts to the package contract and installs without overwriting user content',()=>{
 const p=parsePackage(glasshousePackage);assert.equal(p.definition.injects.length,12);assert.equal(p.definition.objectives.length,6);assert.equal(p.definition.termination,120);assert.equal(p.scenario.duration,150);assert.equal(p.definition.objectives.reduce((n,o)=>n+o.weight,0),100);
 const d=createFixtureData('harbor');installGlasshouse(d);const w=workflows(d),s=d.scenarios.find(s=>s.id==='sc-glasshouse');assert.deepEqual(validation(s,w.authors[s.id],d).filter(c=>c.severity==='blocker'),[]);assert.equal(new Set(w.exercises['s-glasshouse-01'].roster.map(r=>r.id)).size,8);
 d.scenarios.find(s=>s.id==='sc-glasshouse-draft').title='User edited title';const count=d.scenarios.length;installGlasshouse(d);assert.equal(d.scenarios.length,count);assert.equal(d.scenarios.find(s=>s.id==='sc-glasshouse-draft').title,'User edited title');
});
test('GLASSHOUSE runs the full timed MSEL with pause and role-safe participant projections',async()=>{
 const {read,send}=await setup();await send('session.open');await send('exercise.fixture-ready');await send('session.start');await send('inject.release',{inject:'inj-01'});
 await assert.rejects(send('inject.release',{inject:'inj-02'}),e=>e.code==='NOT_ELIGIBLE');await send('session.pause');await assert.rejects(send('session.step',{minutes:1}),e=>e.code==='PAUSED');await send('session.resume');
 let minute=0;for(const i of glasshousePackage.definition.injects.slice(1)){await send('session.step',{minutes:i.minute-minute});minute=i.minute;await send('inject.release',{inject:i.id});}
 const participant=await read('participant'),run=participant.workflow.exercises['s-glasshouse-01'];assert.equal(run.injects.length,12);assert.ok(run.injects.every(i=>i.definition.notes===''));assert.deepEqual(participant.workflow.authors,{});assert.ok(!JSON.stringify(participant).includes('Twenty-one tickets'));assert.ok(!participant.evidence.some(e=>e.source==='GLASSHOUSE investigation ev-07'));
 await send('session.step',{minutes:2});await send('session.end',{rationale:'Completed facilitated 120-minute simulation; begin 30-minute debrief.'});assert.equal((await read()).sessions.find(s=>s.id==='s-glasshouse-01').status,'ended');
});
test('GLASSHOUSE evidence requires time, eligible roles, matching request and explicit authorization',async()=>{
 const {read,send}=await setup();await send('session.open');await send('exercise.fixture-ready');await send('session.start');await send('adjudication.request',{intent:'inspect-agent-trace: investigate the connector audit'},'participant');const request=(await read()).workflow.exercises['s-glasshouse-01'].requests.at(-1).id;
 const p={request,evidence:'ev-07',action:'inspect-agent-trace',investigator:'p-glasshouse-identity',authorized:'yes',rationale:'Identity role requests audit; originals preserved and investigation authorized.'};
 await assert.rejects(send('adjudication.glasshouse-evidence',p),e=>e.code==='NOT_ELIGIBLE');await send('session.step',{minutes:60});await send('session.step',{minutes:30});await assert.rejects(send('adjudication.glasshouse-evidence',{...p,investigator:'p-self'}),e=>e.code==='FORBIDDEN');await assert.rejects(send('adjudication.glasshouse-evidence',{...p,authorized:'no'}),e=>e.code==='APPROVAL_REQUIRED');await assert.rejects(send('adjudication.glasshouse-evidence',p,'participant'),e=>e.code==='FORBIDDEN');
 await send('adjudication.glasshouse-evidence',p);assert.ok((await read('participant')).evidence.some(e=>e.source==='GLASSHOUSE investigation ev-07'&&e.content.includes('T-18')));await assert.rejects(send('adjudication.glasshouse-evidence',p));
});
