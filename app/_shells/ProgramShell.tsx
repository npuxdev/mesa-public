'use client';

import type {ReactNode} from 'react';
import type {ViewContext} from '../../src/view-context';
import type {Scope} from '../../src/contracts';
import {canScreen, personaLabels} from '../../src/platform';
import {routeTo} from '../../src/routes';
import {ActionButton, Icon, Logo} from '../_components/ui';

const PROGRAM_NAV: [string, string, string][] = [
  ['HOME-01', 'Overview', 'overview'],
  ['EX-01', 'Exercises', 'exercise'],
  ['CAT-01', 'Scenarios', 'scenario'],
  ['REP-01', 'Reports', 'report'],
  ['ACT-01', 'Actions', 'action'],
  ['ANA-01', 'Analytics', 'analytics'],
  ['PEO-01', 'People', 'people'],
  ['PEO-03', 'My development', 'development'],
  ['REC-01', 'Recommendations', 'recommend'],
  ['SET-01', 'Organization', 'organization'],
];

function navCurrent(id: string, screen: string): boolean {
  if (id === 'HOME-01') return screen === id;
  if (id === 'CAT-01') return /^(CAT|AUT|PKG)-/.test(screen);
  if (id === 'PEO-03') return screen === 'PEO-03' || screen === 'PEO-02';
  if (id === 'PEO-01') return screen === 'PEO-01';
  if (id === 'REP-01') return screen === 'REP-01' || screen.startsWith('REV-');
  if (id === 'SET-01') return screen.startsWith('SET-') || screen.startsWith('CTX-');
  return screen.split('-')[0] === id.split('-')[0];
}

export function ProgramShell({
  context,
  scope,
  sidebarCollapsed,
  aiConfigured,
  children,
}: {
  context: ViewContext;
  scope: Scope;
  sidebarCollapsed: boolean;
  aiConfigured: boolean;
  children: ReactNode;
}) {
  let items = PROGRAM_NAV;
  if (context.screen.shell === 'SH-PUBLISHER') {
    items = [
      ['PUB-01', 'Profile & rights', 'people'],
      ['PUB-02', 'Review inbox', 'report'],
      ['PUB-04', 'Publications', 'scenario'],
    ];
  }
  if (context.screen.shell === 'SH-OPS') {
    items = [
      ['OPS-01', 'Platform health', 'analytics'],
      ['OPS-02', 'Catalog governance', 'scenario'],
      ['OPS-03', 'Support access', 'shield'],
      ['OPS-04', 'Data operations', 'report'],
    ];
  }
  const label =
    context.screen.shell === 'SH-PUBLISHER'
      ? 'Publisher workspace'
      : context.screen.shell === 'SH-OPS'
        ? 'Platform operations'
        : 'Program workspace';
  const organization =
    context.screen.shell === 'SH-PUBLISHER'
      ? 'Publisher fixture'
      : context.screen.shell === 'SH-OPS'
        ? 'Operations fixture'
        : context.data.settings.name;
  const route = (id: string, params: Record<string, string> = {}) =>
    routeTo(id, {...context.params, orgSlug: scope.tenant, ...params});

  return (
    <>
      <div className="nav-scrim" data-action="close-nav" />
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} aria-label="Primary sidebar">
        <a className="brand-link" href={route('HOME-01')} data-route aria-label="MESA overview">
          <Logo variant={sidebarCollapsed ? 'compact' : 'full'} />
        </a>
        <div className="workspace-label">{label}</div>
        <nav className="main-nav" aria-label="Primary navigation">
          {items
            .filter(([id]) => canScreen(scope, id, id === 'PEO-03' ? 'p-self' : ''))
            .map(([id, text, iconName]) => (
              <a
                key={id}
                href={route(id, id === 'PEO-03' ? {participantId: 'p-self'} : {})}
                data-route
                aria-label={text}
                data-tooltip={text}
                aria-current={navCurrent(id, context.screen.id) ? 'page' : undefined}
              >
                <Icon name={iconName} />
                <span>{text}</span>
              </a>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className="sidebar-collapse-toggle"
            data-action="collapse-sidebar"
            aria-expanded={!sidebarCollapsed}
            aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            <span className="icon-swap">
              <Icon name="sidebar-collapse" />
              <Icon name="sidebar-expand" className="icon-alt" />
            </span>
            <span>Collapse navigation</span>
          </button>
          <a href={route('ACC-05')} data-route className="profile text-link" aria-label="Jordan Davis — profile" title="Jordan Davis — profile">
            <span className="avatar" aria-hidden="true">
              JD
            </span>
            <span>
              <strong>Jordan Davis</strong>
              <small>{personaLabels[scope.persona]}</small>
            </span>
          </a>
        </div>
      </aside>
      <div className="program-frame">
        <header className="topbar">
          <div className="inline">
            <button className="icon-btn menu-toggle" data-action="toggle-nav" aria-label="Open navigation" aria-expanded="false">
              <Icon name="menu" />
            </button>
            <button className="scope-button" data-action="scope-switcher">
              <span className="org-mark">{scope.tenant === 'atlas' ? 'AR' : 'HC'}</span>
              <span>
                <strong>{organization}</strong>
                <small className="fixture-chrome">{scope.persona === 'consultant' ? 'Delegated access · Atlas only' : 'Synthetic workspace'}</small>
              </span>
              <Icon name="down" />
            </button>
          </div>
          <div className="top-utils">
            <a className="icon-btn optional" href={route('HOME-02')} data-route aria-label="Notifications">
              <Icon name="bell" />
            </a>
            <a className="icon-btn optional" href={route('HOME-03')} data-route aria-label="Jobs and downloads">
              <Icon name="download" />
            </a>
            <button className="icon-btn" data-action="help" aria-label="Help">
              <Icon name="help" />
            </button>
            <span className="utility-divider" />
            <span className="avatar" aria-hidden="true">
              JD
            </span>
          </div>
        </header>
        <div className="fixture-banner fixture-chrome">
          <span>
            <strong>Local Services</strong> · Supabase persistence · Synthetic development identities · AI{' '}
            {aiConfigured ? 'connected' : 'not configured'} · Human review required
          </span>
          <button data-action="fixture-controls">Inspect states</button>
        </div>
        <main id="main" className="main-content" tabIndex={-1}>
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <a data-route href={route('HOME-01')}>
              {organization}
            </a>
            <Icon name="chevron" />
            <span>{context.screen.id === 'HOME-01' ? 'Overview' : context.screen.title}</span>
          </nav>
          {children}
          <footer className="screen-footer">
            <span className="fixture-chrome">
              {context.screen.id} · {context.screen.shell} · Synthetic local workspace
            </span>
            <a className="fixture-chrome" href="/ui-reference" data-route>
              UI reference & integration status
            </a>
          </footer>
        </main>
      </div>
    </>
  );
}
