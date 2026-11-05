#!/usr/bin/env node
/**
 * Local Next.js harness launcher.
 *
 *   npm run dev                  → fixture chrome on (default)
 *   npm run dev -- --hide-fixtures
 *   npm run dev:clean            → same as --hide-fixtures
 *
 * Hides harness-only labels/elements (local-services banner, screen IDs,
 * synthetic-workspace captions, fixture controls) via SHOW_FIXTURE_CHROME=0.
 * Product UI stays visible. See src/fixture-chrome.ts and app.css.
 */
import {spawn} from 'node:child_process';
import {resolveFixtureChrome} from './fixture-chrome.mjs';

const args = process.argv.slice(2);
const hideRequested = args.some((arg) =>
  ['--hide-fixtures', '--hide-fixture', '--clean', '--no-fixtures', '--product'].includes(arg),
);
const passthrough = args.filter((arg) => !arg.startsWith('--hide-fixture') && !['--clean', '--no-fixtures', '--product'].includes(arg));

const fromEnv = process.env.SHOW_FIXTURE_CHROME;
const fixtureChrome = hideRequested
  ? 'off'
  : resolveFixtureChrome(fromEnv, 'on');

process.env.SHOW_FIXTURE_CHROME = fixtureChrome === 'on' ? '1' : '0';

const build = spawn('npm', ['run', 'build:domain'], {stdio: 'inherit', env: process.env, shell: true});
build.on('exit', (code) => {
  if (code) process.exit(code ?? 1);
  if (fixtureChrome === 'off') {
    console.log('Fixture chrome: off (harness labels hidden)');
  }
  const next = spawn(
    'npx',
    ['next', 'dev', '-H', '127.0.0.1', '-p', '3000', ...passthrough],
    {stdio: 'inherit', env: process.env, shell: true},
  );
  next.on('exit', (nextCode) => process.exit(nextCode ?? 0));
});
