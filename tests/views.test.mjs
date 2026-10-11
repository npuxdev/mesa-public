import test from 'node:test';
import assert from 'node:assert/strict';
import * as p from '../dist/views-program.js';
import * as s from '../dist/views-scenarios.js';
import * as x from '../dist/views-exercise.js';
import * as a from '../dist/views-administration.js';
import * as wa from '../dist/workflow-author-views.js';
import * as wx from '../dist/workflow-exercise-views.js';
import * as wr from '../dist/workflow-review-views.js';
import {screens,defaultIds,routeTo} from '../dist/routes.js';
import {createFixtureData} from '../dist/fixtures.js';

const exact={'HOME-01':p.overview,'HOME-02':a.utilities,'HOME-03':a.utilities,'EX-01':p.exercises,'EX-02':wx.exerciseConfiguration,'EX-03':wx.exerciseOverview,'EX-04':wx.liveExercise,'REP-01':p.reports,'REV-04':wr.reportWorkflow,'REV-05':wr.reportWorkflow};
const groups={ACC:a.access,CTX:s.context,CAT:s.catalog,AUT:wa.authoring,PKG:wa.packageView,SIM:wx.liveExercise,FAC:wx.controlRoom,REV:wr.reviewWorkflow,ANA:p.analytics,ACT:p.actions,PEO:p.people,REC:p.recommendations,SET:a.settings,PUB:a.publisher,OPS:a.operations};
for(const tenant of ['atlas','harbor'])test(`all 70 page renderers handle ${tenant} fixtures without runtime errors`,()=>{
 for(const screen of screens){
  globalThis.location={pathname:routeTo(screen.id)};
  const context={screen,data:createFixtureData(tenant),scope:{tenant,persona:'manager',state:'ready',epoch:1},params:{...defaultIds,orgSlug:tenant},query:new URLSearchParams(),receipt:null,result:'',error:''};
  const render=exact[screen.id]||groups[screen.id.split('-')[0]];
  assert.equal(typeof render,'function',screen.id);
  const html=render(context);assert.ok(html.length>50,screen.id);assert.ok(!html.includes('[object Object]'),screen.id);
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`${screen.id}: duplicate HTML IDs`);
 }
});
