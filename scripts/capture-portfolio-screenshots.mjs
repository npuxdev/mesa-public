/**
 * Portfolio stills for MESA. Requires a running dev server and Playwright.
 *
 *   SHOW_FIXTURE_CHROME=0 npm run dev
 *   npm install --save-dev playwright && npx playwright install chromium
 *   npm run portfolio:screenshots
 *
 * Output: portfolio-export/mesa-decision-landscape/screenshots/
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'portfolio-export/mesa-decision-landscape/screenshots');
const baseUrl = (process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

const shots = [
  { file: '01-program-overview.png', url: '/', width: 1440, height: 900, text: 'Program Overview' },
  { file: '02-scenario-graph.png', url: '/o/atlas/scenarios/sc-ir/revisions/2.4/content', width: 1440, height: 900, text: 'Scenario Graph' },
  { file: '03-facilitator-control.png', url: '/o/atlas/sessions/s-ir-01/control', width: 1440, height: 900, text: 'Facilitator Control' },
  { file: '04-evidence-gate.png', url: '/o/atlas/findings/f-03', width: 1440, height: 900, text: 'No qualifying evidence' },
  { file: '05-entitlement-preview.png', url: '/o/atlas/scenarios/catalog/sc-cm', width: 1440, height: 900, text: 'Public Allegations' },
  { file: '06-published-report.png', url: '/o/atlas/reports/rep-01', width: 1440, height: 900, text: 'Published Report' },
  { file: '07-ui-reference.png', url: '/ui-reference', width: 1440, height: 900, text: 'UI Reference', needsChrome: true },
  { file: '08-organization-preferences.png', url: '/o/atlas/settings/general', width: 1440, height: 900, text: 'Organization' },
  { file: '09-publish-digest.png', url: '/o/atlas/scenarios/sc-ir/revisions/2.4/publish', width: 1440, height: 900, text: 'Publish' },
  { file: '10-report-mobile.png', url: '/o/atlas/reports/rep-01', width: 390, height: 844, text: 'Published Report' },
  { file: '11-exercise-calendar.png', url: '/o/atlas/exercises?view=agenda', width: 1440, height: 900, text: 'Exercises', optional: true },
];

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    console.error('Playwright is not installed. Run: npm install --save-dev playwright && npx playwright install chromium');
    process.exit(1);
  }
}

const only = process.argv.find(arg => arg.startsWith('--shot='))?.slice('--shot='.length);
const { chromium } = await loadPlaywright();
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
let failed = 0;
for (const shot of shots) {
  if (only && shot.file !== only && !shot.file.startsWith(only)) continue;
  const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height }, deviceScaleFactor: 2 });
  try {
    if (shot.needsChrome) console.warn(`${shot.file} is wrapped in fixture-chrome. Start this pass with SHOW_FIXTURE_CHROME=1 or the page is hidden.`);
    await page.goto(`${baseUrl}${shot.url}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.getByText(shot.text, { exact: false }).first().waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, shot.file) });
    console.log(`wrote ${shot.file}`);
  } catch (error) {
    failed += 1;
    console.error(`failed ${shot.file}: ${error.message}`);
    if (!shot.optional) process.exitCode = 1;
  } finally {
    await page.close();
  }
}
await browser.close();
if (failed && process.exitCode) console.error(`${failed} shot(s) failed. Is SHOW_FIXTURE_CHROME=0 npm run dev up at ${baseUrl}?`);
