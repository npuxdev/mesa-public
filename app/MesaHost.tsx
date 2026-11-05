'use client';

import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import {startSessionController, type MesaPaint} from '../src/session-controller';
import {HtmlView} from './_components/HtmlView';
import {AccessShell, AccessUnavailable} from './_shells/AccessShell';
import {ProgramShell} from './_shells/ProgramShell';
import {OperationalShell} from './_shells/OperationalShell';
import {selectScreen} from './_screens/selectScreen';
import {ActionButton, Notice} from './_components/ui';

function frameFromPaint(paint: MesaPaint): ReactNode {
  if (paint.mode === 'loading') return <HtmlView html={paint.html} />;
  if (paint.mode === 'error') {
    return (
      <AccessUnavailable>
        <Notice title={paint.noticeTitle || 'Unable to load workspace'} message={paint.noticeMessage || ''} tone="danger" />
        <div className="form-actions">
          <ActionButton text="Retry" action="retry" variant="primary" />
          <ActionButton text="Inspect states" action="fixture-controls" variant="secondary" />
        </div>
      </AccessUnavailable>
    );
  }
  if (paint.mode === 'unavailable') return <HtmlView html={paint.html} />;
  if (!paint.context) return <HtmlView html={paint.html} />;

  // Prefer the React family registry. Fall back to the controller-painted string
  // when session-controller injected AI tools, durable results, or stale banners.
  const controllerChrome =
    paint.html.includes('durable-result') ||
    paint.html.includes('data-ai') ||
    paint.html.includes('Stale read-only snapshot');
  const screen = controllerChrome ? <HtmlView html={paint.html} /> : selectScreen(paint.context);

  if (paint.mode === 'access') return <AccessShell>{screen}</AccessShell>;
  if (paint.mode === 'operational') {
    return (
      <OperationalShell context={paint.context} scope={paint.scope} aiConfigured={paint.aiConfigured}>
        {screen}
      </OperationalShell>
    );
  }
  return (
    <ProgramShell
      context={paint.context}
      scope={paint.scope}
      sidebarCollapsed={paint.sidebarCollapsed}
      aiConfigured={paint.aiConfigured}
    >
      {screen}
    </ProgramShell>
  );
}

/**
 * Catch-all host for the strangler migration. React owns shells and the screen
 * registry; session-controller owns routing, commands, drafts, and data-action
 * behaviors, painting through onPaint.
 */
export function MesaHost() {
  const shellRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const [frame, setFrame] = useState<ReactNode>(
    <main id="main" className="main-content" aria-busy="true">
      <p>Loading MESA workspace…</p>
    </main>,
  );

  const onPaint = useCallback((paint: MesaPaint) => {
    setFrame(frameFromPaint(paint));
  }, []);

  useEffect(() => {
    if (started.current || !shellRef.current) return;
    const root = shellRef.current;
    const dialog = root.querySelector<HTMLDialogElement>('#app-dialog');
    const toast = root.querySelector<HTMLElement>('#app-toast');
    if (!dialog || !toast) {
      throw new Error('MESA shell targets are missing from the React host.');
    }
    started.current = true;
    startSessionController({root, dialog, toast, onPaint});
  }, [onPaint]);

  return (
    <div ref={shellRef}>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <div id="app">{frame}</div>
      <dialog id="app-dialog" className="modal" aria-labelledby="dialog-title"></dialog>
      <div id="app-toast" className="toast" role="status" aria-live="polite" hidden></div>
    </div>
  );
}
