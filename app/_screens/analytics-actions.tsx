'use client';

import type {ViewContext} from '../../src/view-context';
import {analytics, actions} from '../../src/views-program';
import {HtmlView} from '../_components/HtmlView';

export function AnalyticsActionsFamily({context}: {context: ViewContext}) {
  if (context.screen.id.startsWith('ACT-')) return <HtmlView html={actions(context)} />;
  return <HtmlView html={analytics(context)} />;
}
