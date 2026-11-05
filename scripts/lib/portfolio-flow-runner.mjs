/**
 * Executes a portfolio-export-flow/v1 script against a Playwright page.
 * Step ids are included in thrown errors so a failed recording maps to the JSON.
 */

function locatorOf(page, spec) {
  if (!spec || !spec.strategy) throw new Error('A locator strategy is required.');
  if (spec.strategy === 'role') {
    return page.getByRole(spec.role, { name: spec.name, exact: Boolean(spec.exact) });
  }
  if (spec.strategy === 'text') return page.getByText(spec.text, { exact: Boolean(spec.exact) });
  if (spec.strategy === 'testId') return page.getByTestId(spec.value);
  if (spec.strategy === 'css') return page.locator(spec.value);
  if (spec.strategy === 'lastVisibleInput') return page.locator('input:visible, textarea:visible').last();
  throw new Error(`Unknown locator strategy: ${spec.strategy}`);
}

function targetOf(page, step) {
  if (step.locator) return locatorOf(page, step.locator);
  if (step.role && step.name) return page.getByRole(step.role, { name: step.name, exact: Boolean(step.exact) });
  throw new Error('Step needs a locator or role and name.');
}

async function waitFor(page, spec = {}) {
  const timeout = spec.timeoutMs ?? 15000;
  if (spec.networkIdle) await page.waitForLoadState('networkidle', { timeout });
  if (spec.locator) await locatorOf(page, spec.locator).first().waitFor({ state: 'visible', timeout });
  if (spec.role && spec.name) {
    await page.getByRole(spec.role, { name: spec.name, exact: Boolean(spec.exact) }).first().waitFor({ state: 'visible', timeout });
  }
  if (spec.text) {
    await page.getByText(spec.text, { exact: Boolean(spec.exact) }).first().waitFor({ state: 'visible', timeout });
  }
}

async function applyThen(page, step) {
  if (!step.then) return;
  if (step.then.waitFor) await waitFor(page, step.then.waitFor);
  if (step.then.waitMs) await page.waitForTimeout(step.then.waitMs);
}

async function runStep(page, step, baseUrl) {
  const action = step.action;
  if (action === 'navigate') {
    const url = step.url.startsWith('http') ? step.url : `${baseUrl}${step.url.startsWith('/') ? '' : '/'}${step.url}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  } else if (action === 'clearStorage') {
    await page.evaluate(keys => {
      if (!keys) {
        localStorage.clear();
        sessionStorage.clear();
        return;
      }
      for (const key of keys) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      }
    }, step.keys || null);
  } else if (action === 'setTheme') {
    if (step.themeId) throw new Error('This app has no theme switch. Leave themeId null.');
  } else if (action === 'injectState') {
    await page.evaluate(state => {
      for (const [key, value] of Object.entries(state.localStorage || {})) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
      for (const [key, value] of Object.entries(state.sessionStorage || {})) {
        sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    }, step);
  } else if (action === 'wait') {
    await page.waitForTimeout(step.ms ?? 0);
  } else if (action === 'waitFor') {
    await waitFor(page, step.locator ? { ...step, locator: step.locator } : step);
  } else if (action === 'click') {
    await targetOf(page, step).click();
  } else if (action === 'type') {
    const field = targetOf(page, step);
    await field.fill(step.text ?? '');
    if (step.submit === 'Enter') await field.press('Enter');
    if (step.submit === 'clickSubmit') {
      const submit = step.submitLocator ? locatorOf(page, step.submitLocator) : page.locator('button[type="submit"]').first();
      await submit.click();
    }
  } else if (action === 'press') {
    await page.keyboard.press(step.key);
  } else if (action === 'scroll') {
    if (step.intoView && step.locator) await targetOf(page, step).scrollIntoViewIfNeeded();
    else if (step.deltaY) await page.mouse.wheel(0, step.deltaY);
  } else if (action === 'mockRoute') {
    await page.route(step.urlPattern, route => {
      if (step.method && route.request().method() !== step.method) return route.continue();
      return route.fulfill({
        status: step.status ?? 200,
        contentType: 'application/json',
        body: JSON.stringify(step.response ?? {}),
      });
    });
  } else if (action === 'screenshot') {
    return;
  } else {
    throw new Error(`Unknown action: ${action}`);
  }
  await applyThen(page, step);
}

export async function installCursor(page) {
  await page.addInitScript(() => {
    const draw = () => {
      if (document.getElementById('portfolio-cursor')) return;
      const cursor = document.createElement('div');
      cursor.id = 'portfolio-cursor';
      cursor.style.cssText = 'position:fixed;z-index:2147483646;width:14px;height:14px;margin:-2px 0 0 -2px;border:2px solid #E9EDE8;border-radius:50%;background:#1B2B2A;pointer-events:none;';
      document.documentElement.appendChild(cursor);
      document.addEventListener('mousemove', event => {
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
      }, true);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', draw);
    else draw();
  });
}

export async function runFlow(page, flow, { baseUrl }) {
  const base = baseUrl.replace(/\/$/, '');
  if (flow.recording?.showCursor) await installCursor(page);
  if (flow.initialState?.clearStorage || flow.initialState?.localStorage) {
    await page.addInitScript(state => {
      if (state.clearStorage) {
        localStorage.clear();
        sessionStorage.clear();
      }
      for (const [key, value] of Object.entries(state.localStorage || {})) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    }, flow.initialState || {});
  }
  for (const mock of flow.mocks || []) {
    await runStep(page, { ...mock, action: 'mockRoute', id: `mock-${mock.urlPattern}` }, base);
  }
  for (const step of flow.steps || []) {
    try {
      await runStep(page, step, base);
    } catch (error) {
      throw new Error(`Flow step "${step.id}" (${step.action}) failed: ${error.message}`);
    }
  }
  for (const assertion of flow.endAssertions || []) {
    try {
      await waitFor(page, assertion.waitFor || {});
    } catch (error) {
      throw new Error(`End assertion failed: ${error.message}`);
    }
  }
}
