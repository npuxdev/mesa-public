'use client';

import type {ViewContext} from '../../src/view-context';
import {access} from '../../src/views-administration';
import {HtmlView} from '../_components/HtmlView';

export function AccessFamily({context}: {context: ViewContext}) {
  return <HtmlView html={access(context)} />;
}
