import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';
import {applyFixtureChromeAttribute, resolveFixtureChrome} from '../scripts/fixture-chrome.mjs';
import {markHarnessLabels} from '../src/fixture-chrome.ts';

test('fixture chrome flag resolves show and hide values', () => {
  assert.equal(resolveFixtureChrome(undefined, 'on'), 'on');
  assert.equal(resolveFixtureChrome('', 'off'), 'off');
  assert.equal(resolveFixtureChrome('0', 'on'), 'off');
  assert.equal(resolveFixtureChrome('false', 'on'), 'off');
  assert.equal(resolveFixtureChrome('off', 'on'), 'off');
  assert.equal(resolveFixtureChrome('hide', 'on'), 'off');
  assert.equal(resolveFixtureChrome('1', 'off'), 'on');
  assert.equal(resolveFixtureChrome('TRUE', 'off'), 'on');
  assert.equal(resolveFixtureChrome('show', 'off'), 'on');
  assert.equal(resolveFixtureChrome('maybe', 'off'), 'off');
});

test('html documents receive a single fixture chrome attribute', () => {
  assert.equal(applyFixtureChromeAttribute('<html lang="en">', 'off'), '<html data-fixture-chrome="off" lang="en">');
  assert.equal(applyFixtureChromeAttribute('<html data-fixture-chrome="on" lang="en">', 'off'), '<html data-fixture-chrome="off" lang="en">');
  assert.equal(applyFixtureChromeAttribute('<HTML lang="en">', 'on'), '<html data-fixture-chrome="on" lang="en">');
});

test('harness labels are marked and product controls stay intact', () => {
  const dom = new JSDOM(`<!doctype html><body>
    <div class="fixture-banner"><span><strong>Local Services</strong></span><button>Inspect states</button></div>
    <button class="scope-button"><strong>Publisher fixture</strong><small>Synthetic workspace</small></button>
    <span class="meta">Platform-authored fixture · r2.4</span>
    <footer class="screen-footer"><span>HOME-01 · SH-PROGRAM · Synthetic local workspace</span><a href="/ui-reference">UI reference & integration status</a></footer>
    <button>Enter fixture workspace</button>
    <button>Save fixture draft</button>
    <span class="meta">3 permitted scenarios · Synthetic content</span>
    <p class="chart-caption">Reviewed fixture data · 2 / 4 eligible released opportunities</p>
    <span class="badge">Fixture content scope</span>
    <p class="prototype-note">adapter note</p>
    <pre>Synthetic package stays in evidence</pre>
    <button>Schedule exercise</button>
    <div class="notice warning"><strong>Fixture publication</strong><p>Local publication only.</p></div>
    <table><tbody><tr><td>D-AUTH / D-CAT</td><td>Present</td></tr></tbody></table>
  </body>`);
  const body = dom.window.document.body;
  markHarnessLabels(body);
  markHarnessLabels(body);
  assert.equal(body.querySelector('.fixture-banner')?.classList.contains('fixture-chrome'), true);
  assert.equal(body.querySelector('.screen-footer > span')?.classList.contains('fixture-chrome'), true);
  assert.equal(body.querySelector('a[href="/ui-reference"]')?.classList.contains('fixture-chrome'), true);
  assert.equal(body.querySelector('.scope-button small')?.classList.contains('fixture-chrome'), true);
  assert.equal(body.querySelector('.prototype-note')?.classList.contains('fixture-chrome'), true);
  assert.equal(body.querySelector('.notice')?.classList.contains('fixture-chrome'), true);
  assert.equal(body.querySelector('td')?.classList.contains('fixture-chrome'), true);
  assert.equal(body.querySelectorAll('td')[1]?.classList.contains('fixture-chrome'), false);
  const enter = [...body.querySelectorAll('button')].find(button => (button.textContent || '').includes('Enter'));
  assert.equal(enter?.textContent, 'Enter fixture workspace');
  assert.equal(enter?.querySelectorAll('.fixture-chrome').length, 1);
  assert.equal(enter?.querySelector('.fixture-chrome')?.textContent, 'fixture ');
  const save = [...body.querySelectorAll('button')].find(button => (button.textContent || '').includes('Save'));
  assert.equal(save?.querySelector('.fixture-chrome')?.textContent, 'fixture ');
  assert.match(body.querySelector('.chart-caption')?.textContent || '', /2 \/ 4 eligible released opportunities/);
  assert.equal(body.querySelector('.chart-caption .fixture-chrome')?.textContent, 'Reviewed fixture data · ');
  assert.equal(body.querySelector('.badge')?.classList.contains('fixture-chrome'), true);
  const provenance = [...body.querySelectorAll('.meta')].find(element => (element.textContent || '').includes('r2.4'));
  assert.equal(provenance?.textContent, 'Platform-authored fixture · r2.4');
  assert.equal(provenance?.querySelector('.fixture-chrome')?.textContent, ' fixture');
  assert.equal(body.querySelector('pre')?.querySelector('.fixture-chrome'), null);
  assert.equal(body.querySelector('pre')?.textContent, 'Synthetic package stays in evidence');
  const schedule = [...body.querySelectorAll('button')].find(button => button.textContent === 'Schedule exercise');
  assert.equal(schedule?.classList.contains('fixture-chrome'), false);
  const inspect = [...body.querySelectorAll('button')].find(button => (button.textContent || '').includes('Inspect states'));
  assert.equal(inspect?.classList.contains('fixture-chrome'), true);
  assert.equal(body.querySelector('.scope-button strong .fixture-chrome')?.textContent, ' fixture');
  assert.match(body.querySelector('.scope-button strong')?.textContent || '', /^Publisher fixture$/);
});

test('fixture chrome stylesheet hides marked labels only when the flag is off', () => {
  const css = readFileSync(new URL('../app.css', import.meta.url), 'utf8');
  assert.match(css, /html\[data-fixture-chrome="off"\] \.fixture-chrome/);
  assert.match(css, /html\[data-fixture-chrome="off"\] \.fixture-banner/);
  assert.doesNotMatch(css, /html\[data-fixture-chrome="on"\] \.fixture-chrome\{display:\s*none/);
});
