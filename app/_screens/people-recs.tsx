'use client';

import type {ViewContext} from '../../src/view-context';
import {people, recommendations} from '../../src/views-program';
import {HtmlView} from '../_components/HtmlView';

export function PeopleRecsFamily({context}: {context: ViewContext}) {
  if (context.screen.id.startsWith('REC-')) return <HtmlView html={recommendations(context)} />;
  return <HtmlView html={people(context)} />;
}
