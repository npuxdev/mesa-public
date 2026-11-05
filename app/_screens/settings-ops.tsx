'use client';

import type {ViewContext} from '../../src/view-context';
import {settings, publisher, operations} from '../../src/views-administration';
import {HtmlView} from '../_components/HtmlView';

export function SettingsOpsFamily({context}: {context: ViewContext}) {
  const id = context.screen.id;
  if (id.startsWith('PUB-')) return <HtmlView html={publisher(context)} />;
  if (id.startsWith('OPS-')) return <HtmlView html={operations(context)} />;
  return <HtmlView html={settings(context)} />;
}
