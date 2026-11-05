/** Show or hide harness labels that are not the product UI. */
export function resolveFixtureChrome(raw, fallback) {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === '') return fallback;
  if (['0', 'false', 'off', 'hide'].includes(value)) return 'off';
  if (['1', 'true', 'on', 'show'].includes(value)) return 'on';
  return fallback;
}

export function applyFixtureChromeAttribute(html, mode) {
  if (!['on', 'off'].includes(mode)) throw new Error(`Unexpected fixture chrome mode: ${mode}`);
  if (/data-fixture-chrome="(?:on|off)"/.test(html)) {
    return html.replace(/data-fixture-chrome="(?:on|off)"/, `data-fixture-chrome="${mode}"`);
  }
  return html.replace(/<html\b/i, `<html data-fixture-chrome="${mode}"`);
}
