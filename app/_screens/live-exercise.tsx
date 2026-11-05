'use client';

import type {ViewContext} from '../../src/view-context';
import {liveExercise, controlRoom} from '../../src/workflow-exercise-views';
import {HtmlView} from '../_components/HtmlView';

export function LiveExerciseFamily({context}: {context: ViewContext}) {
  if (context.screen.id.startsWith('FAC-')) return <HtmlView html={controlRoom(context)} />;
  return <HtmlView html={liveExercise(context)} />;
}
