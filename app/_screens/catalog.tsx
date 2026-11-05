'use client';

import type {ViewContext} from '../../src/view-context';
import {catalog, context as contextView} from '../../src/views-scenarios';
import {HtmlView} from '../_components/HtmlView';

export function CatalogFamily({context}: {context: ViewContext}) {
  if (context.screen.id.startsWith('CTX-')) return <HtmlView html={contextView(context)} />;
  return <HtmlView html={catalog(context)} />;
}
