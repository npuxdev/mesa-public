/**
 * Marks development fixture chrome so CSS can hide it when
 * `html[data-fixture-chrome="off"]`. Product controls stay visible.
 * `SHOW_FIXTURE_CHROME` selects on/off for `npm run dev` and `npm start`.
 */

const WRAP = [
  ' · Synthetic local workspace',
  'Synthetic data only · No real sign-in request is sent.',
  'Delegated access · Atlas only',
  ' · Synthetic content',
  'Reviewed fixture data · ',
  'Synthetic beta workspace',
  'Fixture content scope',
  'Synthetic workspace',
  ' · extracted fixture',
  'Connected fixture',
  'Explicit coach fixture',
  'Consultant fixture',
  'Current fixture tenant',
  'Synthetic organization',
  'fixture identity only',
  'Fixture sources',
  'Synthetic package',
  'Synthetic grant',
  'UI reference & integration status',
  '● Local database connected',
];

const HARNESS_BUTTONS = new Set([
  'fixture controls',
  'inspect states',
  'inspect fixture state',
  'inspect fixture access',
]);

const HARNESS_NOTICES = new Set([
  'fixture validation only',
  'fixture publication',
  'local development implementation',
  'live identity is not configured',
]);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const HARNESS_PATTERN = new RegExp([
  'Direct fixture membership · Synthetic tenant [AB]',
  'Synthetic [A-Za-z]+ records · ',
  'Save fixture (?:draft|goal|note)',
  ...WRAP.map(escapeRegExp),
  'Enter fixture workspace',
  'Sign out of fixture',
  'Return to fixture sign-in',
  'Publish fixture revision',
  'Run fixture checks',
  'Confirm fixture action',
  'Download labeled fixture CSV',
  'Download synthetic example',
  'Apply fixture scope',
  'Set synthetic roster ready',
  'Synthetic JSON package · ',
  'Selectable in fixture schedule',
  'Available fixture',
  'Platform-authored fixture',
  'Publisher fixture',
  'Operations fixture',
].sort((a, b) => b.length - a.length).join('|'), 'gi');

function wrap(text: string): string {
  return `<span class="fixture-chrome">${text}</span>`;
}

function harnessReplacement(match: string): string {
  if (/^enter fixture workspace$/i.test(match)) return match.replace(/fixture /i, wrap);
  if (/^sign out of fixture$/i.test(match)) return match.replace(/ of fixture/i, wrap);
  if (/^return to fixture sign-in$/i.test(match)) return match.replace(/fixture /i, wrap);
  if (/^save fixture (?:draft|goal|note)$/i.test(match)) return match.replace(/fixture /i, wrap);
  if (/^publish fixture revision$/i.test(match)) return match.replace(/fixture /i, wrap);
  if (/^run fixture checks$/i.test(match)) return match.replace(/fixture /i, wrap);
  if (/^confirm fixture action$/i.test(match)) return match.replace(/ fixture action/i, wrap);
  if (/^download labeled fixture csv$/i.test(match)) return match.replace(/labeled fixture /i, wrap);
  if (/^download synthetic example$/i.test(match)) return match.replace(/synthetic /i, wrap);
  if (/^apply fixture scope$/i.test(match)) return match.replace(/fixture /i, wrap);
  if (/^set synthetic roster ready$/i.test(match)) return match.replace(/synthetic /i, wrap);
  if (/^synthetic json package · $/i.test(match)) return wrap(match.slice(0, 'Synthetic '.length));
  if (/^selectable in fixture schedule$/i.test(match)) return match.replace(/fixture /i, wrap);
  if (/^(?:available|publisher|operations|platform-authored) fixture$/i.test(match)) return match.replace(/ fixture/i, wrap);
  return wrap(match);
}

function isElement(node: Node): node is Element {
  return node.nodeType === 1;
}

function collectText(node: Node, into: Text[]): void {
  if (node.nodeType === 3) {
    into.push(node as Text);
    return;
  }
  if (!isElement(node)) return;
  if (node.classList.contains('fixture-chrome')) return;
  if (/^(SCRIPT|STYLE|TEXTAREA|PRE|CODE)$/.test(node.tagName)) return;
  if (node.classList.contains('evidence-content')) return;
  for (const child of node.childNodes) collectText(child, into);
}

function visibleText(element: Element): string {
  let text = '';
  for (const child of element.childNodes) {
    if (isElement(child)) {
      if (child.classList.contains('fixture-chrome')) continue;
      text += visibleText(child);
    } else text += child.textContent || '';
  }
  return text.replace(/\s+/g, ' ').trim();
}

function rewriteText(root: ParentNode): void {
  const nodes: Text[] = [];
  collectText(root, nodes);
  for (const node of nodes) {
    const text = node.textContent || '';
    HARNESS_PATTERN.lastIndex = 0;
    if (!HARNESS_PATTERN.test(text)) continue;
    HARNESS_PATTERN.lastIndex = 0;
    const template = node.ownerDocument.createElement('template');
    template.innerHTML = text.replace(HARNESS_PATTERN, harnessReplacement);
    node.replaceWith(template.content);
  }
}

/** Tag fixture banners, screen ids, and synthetic labels inside a painted subtree. */
export function markHarnessLabels(root: ParentNode): void {
  if (!('querySelectorAll' in root)) return;
  root.querySelectorAll('.fixture-banner, .prototype-note, .screen-footer > span, a[href="/ui-reference"], .scope-button small').forEach(element => {
    element.classList.add('fixture-chrome');
  });
  root.querySelectorAll('.connection-label').forEach(element => {
    if (/local database/i.test(element.textContent || '')) element.classList.add('fixture-chrome');
  });
  root.querySelectorAll('button, a.btn').forEach(element => {
    const label = (element.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (HARNESS_BUTTONS.has(label)) element.classList.add('fixture-chrome');
  });
  root.querySelectorAll('.notice').forEach(element => {
    const title = element.querySelector('strong')?.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() || '';
    if (HARNESS_NOTICES.has(title)) element.classList.add('fixture-chrome');
  });
  root.querySelectorAll('td').forEach(cell => {
    const label = (cell.textContent || '').trim();
    if (/^D-[A-Z]{2,}(?:\s*\/\s*D-[A-Z]{2,})*(?:\s+sandbox)?$/.test(label)) cell.classList.add('fixture-chrome');
  });
  const dialogTitle = root.querySelector('#dialog-title')?.textContent?.replace(/\s+/g, ' ').trim().toLowerCase();
  if (dialogTitle === 'inspect fixture mode') root.querySelector('.modal-body')?.classList.add('fixture-chrome');
  rewriteText(root);
  root.querySelectorAll('.badge, h3, small, .meta, .chart-caption, .access-footer, strong').forEach(element => {
    if (!element.classList.contains('fixture-chrome') && !visibleText(element)) element.classList.add('fixture-chrome');
  });
}
