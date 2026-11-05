'use client';

import type {ReactNode} from 'react';
import type {ViewContext} from '../../src/view-context';
import type {Scope} from '../../src/contracts';
import {workflows} from '../../src/workflow-model';
import {routeTo} from '../../src/routes';
import {Icon, Logo, RouteLink} from '../_components/ui';

export function OperationalShell({
  context,
  scope,
  aiConfigured,
  children,
}: {
  context: ViewContext;
  scope: Scope;
  aiConfigured: boolean;
  children: ReactNode;
}) {
  const session = context.data.sessions.find((s) => s.id === (context.params.sessionId || 's-ir-01'));
  const aiSimulation = !!(session && workflows(context.data).exercises[session.id]?.aiSimulation);
  const control = context.screen.shell === 'SH-CONTROL';
  const tabs: [string, string][] = control
    ? [
        ['FAC-01', 'Control room'],
        ['FAC-02', 'World & actors'],
        ['FAC-03', 'Injects & pacing'],
        ['FAC-04', 'Adjudication'],
        ['FAC-05', 'Recorded replay'],
      ]
    : [
        ['SIM-01', 'Situation'],
        ['SIM-02', 'Communications'],
        ['SIM-03', 'Evidence'],
        ['SIM-04', 'Investigate'],
        ['SIM-05', 'Decisions'],
        ['SIM-06', 'Team workspace'],
      ];
  const route = (id: string) => routeTo(id, {...context.params, orgSlug: scope.tenant});

  return (
    <div className="operational">
      <header className="operational-header">
        <div className="operational-identity">
          <a className="brand-link" href={route('EX-01')} data-route aria-label="Return to exercises">
            <Logo variant="compact" />
          </a>
          <div className="operational-title">
            <span className={`simulation-tag ${control ? 'control-label' : ''}`}>
              {aiSimulation ? 'AI SIMULATION' : control ? 'FACILITATOR CONTROL' : 'SIMULATION EXERCISE'}
            </span>
            <strong>{session?.title || 'Session unavailable'}</strong>
          </div>
        </div>
        <div className="operational-clocks">
          <div>
            <small>Simulation time</small>
            <strong>{session?.simulationTime || '—'}</strong>
          </div>
          <div className="wall-clock">
            <small>Wall time</small>
            <strong>{session?.wallTime || '—'}</strong>
          </div>
          <div>
            <span className={`connection-label${scope.state === 'disconnected' ? '' : ' fixture-chrome'}`}>
              {scope.state === 'disconnected' ? '! Disconnected' : '● Local database connected'}
            </span>
            <small style={{display: 'block'}}>
              Event {session?.sequence || '—'} · {session?.status || 'unavailable'}
            </small>
          </div>
        </div>
      </header>
      <div className="fixture-banner fixture-chrome">
        <span>
          <strong>Local Services</strong> · Supabase persistence · Synthetic development identities · AI{' '}
          {aiConfigured ? 'connected' : 'not configured'} · Human review required
        </span>
        <button data-action="fixture-controls">Inspect states</button>
      </div>
      <nav className="tabs" aria-label={control ? 'Facilitator tasks' : 'Participant tasks'}>
        {tabs.map(([id, text]) => (
          <a key={id} href={route(id)} data-route aria-current={context.screen.id === id ? 'page' : undefined}>
            {text}
          </a>
        ))}
      </nav>
      <main className="main-content" id="main" tabIndex={-1}>
        {children}
        <footer className="screen-footer">
          <span className="fixture-chrome">
            {context.screen.id} · {context.screen.shell}
          </span>
          <RouteLink text="Exit to program" href={route('EX-01')} />
        </footer>
      </main>
    </div>
  );
}
