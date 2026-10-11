import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const css=readFileSync(new URL('../app.css',import.meta.url),'utf8');
const tokens=readFileSync(new URL('../design-tokens.css',import.meta.url),'utf8');

test('shared polish uses existing tokens and explicit, restrained transitions',()=>{
  assert.match(css,/-webkit-font-smoothing:antialiased/);
  assert.match(css,/h1,h2,h3,h4\{text-wrap:balance\}/);
  assert.match(css,/\.btn\.small\{min-height:40px\}/);
  assert.match(css,/\.filters \.btn\{min-height:44px\}/);
  assert.match(css,/\.btn:active:not\(:disabled\):not\(\[aria-disabled=true\]\):not\(\[data-static\]\)\{scale:\.96\}/);
  assert.match(css,/\.btn\[data-static\]:active\{scale:1\}/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.btn:active,\.icon-btn:active,\.sidebar-collapse-toggle:active\{scale:1!important\}\}/);
  assert.match(css,/\.icon-swap>\.icon\{transition-property:opacity,filter,scale/);
  assert.match(css,/\.breadcrumbs a\{min-height:40px/);
  assert.match(css,/\.toggle-layout a\{min-width:40px;min-height:40px\}/);
  assert.doesNotMatch(css,/transition\s*:\s*all\b|will-change\s*:\s*all\b/);
  assert.match(tokens,/--shadow-surface:/);
  assert.match(css,/outline:1px solid oklch\(0 0 0 \/ \.1\)/);
});
