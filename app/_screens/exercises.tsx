'use client';

import type {ViewContext} from '../../src/view-context';
import {exercises} from '../../src/views-program';
import {exerciseConfiguration, exerciseOverview} from '../../src/workflow-exercise-views';
import {HtmlView} from '../_components/HtmlView';
import {LiveExerciseFamily} from './live-exercise';

export function ExercisesFamily({context}: {context: ViewContext}) {
  const id = context.screen.id;
  if (id === 'EX-04') return <LiveExerciseFamily context={context} />;
  if (id === 'EX-02') return <HtmlView html={exerciseConfiguration(context)} />;
  if (id === 'EX-03') return <HtmlView html={exerciseOverview(context)} />;
  return <HtmlView html={exercises(context)} />;
}
