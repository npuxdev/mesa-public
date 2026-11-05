'use client';

import type {ViewContext} from '../../src/view-context';
import {reports} from '../../src/views-program';
import {reviewWorkflow, reportWorkflow} from '../../src/workflow-review-views';
import {HtmlView} from '../_components/HtmlView';

export function ReviewFamily({context}: {context: ViewContext}) {
  const id = context.screen.id;
  if (id === 'REP-01') return <HtmlView html={reports(context)} />;
  if (id === 'REV-04' || id === 'REV-05') return <HtmlView html={reportWorkflow(context)} />;
  return <HtmlView html={reviewWorkflow(context)} />;
}
