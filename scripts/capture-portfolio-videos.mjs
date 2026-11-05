/**
 * Portfolio videos for MESA. Two flows, 1920×1080, silent viewport recordings.
 *
 *   SHOW_FIXTURE_CHROME=0 npm run dev
 *   npm install --save-dev playwright && npx playwright install chromium
 *   npm run portfolio:videos
 *   node scripts/capture-portfolio-videos.mjs --flow=01-scenario-graph-loop
 */
import { mkdir, readdir, rename, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { runFlow } from './lib/portfolio-flow-runner.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exportDir = path.join(root, 'portfolio-export/mesa-decision-landscape');
const videoDir = path.join(exportDir, 'videos');
const flowDir = path.join(videoDir, 'flows');
const baseUrl = (process.env.VIDEO_BASE_URL || process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const only = process.argv.find(arg => arg.startsWith('--flow='))?.slice('--flow='.length);

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    console.error('Playwright is not installed. Run: npm install --save-dev playwright && npx playwright install chromium');
    process.exit(1);
  }
}

function durationSeconds(file) {
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file], { encoding: 'utf8' });
  if (probe.status !== 0) return null;
  const value = Number(probe.stdout.trim());
  return Number.isFinite(value) ? value : null;
}

const { chromium } = await loadPlaywright();
const files = (await readdir(flowDir)).filter(name => name.endsWith('.flow.json') && (!only || name.startsWith(only)));
if (!files.length) {
  console.error('No flow scripts matched.');
  process.exit(1);
}
await mkdir(videoDir, { recursive: true });
for (const name of files) {
  const flow = JSON.parse(await readFile(path.join(flowDir, name), 'utf8'));
  const browser = await chromium.launch({ slowMo: flow.recording?.slowMo ?? 80 });
  const scratch = path.join(videoDir, `.tmp-${flow.id}`);
  await mkdir(scratch, { recursive: true });
  const viewport = flow.recording?.viewport || { width: 1920, height: 1080 };
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: flow.recording?.deviceScaleFactor ?? 1,
    recordVideo: { dir: scratch, size: viewport },
  });
  const page = await context.newPage();
  try {
    await runFlow(page, flow, { baseUrl });
    const video = page.video();
    await context.close();
    const raw = await video.path();
    const target = path.join(exportDir, flow.outputVideo);
    await rename(raw, target);
    const seconds = durationSeconds(target);
    const note = seconds == null ? 'duration unknown (ffprobe not installed)' : `${seconds.toFixed(1)}s`;
    console.log(`wrote ${flow.outputVideo} (${note})`);
    if (seconds != null && seconds > (flow.maxDurationSec ?? 30)) {
      console.warn(`WARNING ${flow.outputVideo} exceeds ${flow.maxDurationSec ?? 30}s`);
      process.exitCode = 1;
    }
  } catch (error) {
    await context.close();
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}
