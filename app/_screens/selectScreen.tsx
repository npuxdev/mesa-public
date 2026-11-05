'use client';

import type {ReactNode} from 'react';
import type {ViewContext} from '../../src/view-context';
import {HtmlView} from '../_components/HtmlView';
import {AccessFamily} from './access';
import {HomeFamily} from './home';
import {ExercisesFamily} from './exercises';
import {CatalogFamily} from './catalog';
import {AuthoringFamily} from './authoring';
import {LiveExerciseFamily} from './live-exercise';
import {ReviewFamily} from './review';
import {AnalyticsActionsFamily} from './analytics-actions';
import {PeopleRecsFamily} from './people-recs';
import {SettingsOpsFamily} from './settings-ops';
import {componentExplorer} from '../../src/views-administration';

/**
 * React screen registry. Families return JSX (true components or HtmlView bridges
 * over the legacy string renderers) so App Router owns the tree while behaviors
 * still attach via data-action / data-command / data-route.
 */
export function selectScreen(c: ViewContext): ReactNode {
  const id = c.screen.id;
  if (id === 'UI-REF') return <HtmlView html={componentExplorer(c)} />;
  if (id.startsWith('ACC-')) return <AccessFamily context={c} />;
  if (id.startsWith('HOME-')) return <HomeFamily context={c} />;
  if (id.startsWith('EX-')) return <ExercisesFamily context={c} />;
  if (id.startsWith('CAT-') || id.startsWith('CTX-')) return <CatalogFamily context={c} />;
  if (id.startsWith('AUT-') || id.startsWith('PKG-')) return <AuthoringFamily context={c} />;
  if (id.startsWith('SIM-') || id.startsWith('FAC-')) return <LiveExerciseFamily context={c} />;
  if (id.startsWith('REV-') || id.startsWith('REP-')) return <ReviewFamily context={c} />;
  if (id.startsWith('ANA-') || id.startsWith('ACT-')) return <AnalyticsActionsFamily context={c} />;
  if (id.startsWith('PEO-') || id.startsWith('REC-')) return <PeopleRecsFamily context={c} />;
  if (id.startsWith('SET-') || id.startsWith('PUB-') || id.startsWith('OPS-')) return <SettingsOpsFamily context={c} />;
  return <HtmlView html={'<div class="empty-state"><h2>Page unavailable</h2><p>Return to a permitted destination.</p></div>'} />;
}
