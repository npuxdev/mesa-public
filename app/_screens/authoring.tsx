'use client';

import type {ViewContext} from '../../src/view-context';
import {authoring, packageView} from '../../src/workflow-author-views';
import {HtmlView} from '../_components/HtmlView';

/** Authoring + packages. Scenario graph mounts via session behaviors after paint. */
export function AuthoringFamily({context}: {context: ViewContext}) {
  if (context.screen.id.startsWith('PKG-')) return <HtmlView html={packageView(context)} />;
  return <HtmlView html={authoring(context)} />;
}
