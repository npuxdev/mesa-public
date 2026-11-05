'use client';

import type {ViewContext} from '../../src/view-context';
import {href} from '../../src/view-context';
import {can} from '../../src/platform';
import {coverage, opportunityRows, verificationState} from '../../src/improvement-model';
import {fixtureCutoff} from '../../src/fixtures';
import {overview} from '../../src/views-program';
import {utilities} from '../../src/views-administration';
import {HtmlView} from '../_components/HtmlView';
import {
  EmptyState,
  MetricCard,
  PageHeading,
  Panel,
  PanelBody,
  RouteLink,
} from '../_components/ui';

/** HOME-01 empty/guest paths are true JSX; populated overview and HOME-02/03 bridge strings. */
export function HomeFamily({context: c}: {context: ViewContext}) {
  if (c.screen.id === 'HOME-01') return <OverviewScreen context={c} />;
  return <HtmlView html={utilities(c)} />;
}

function OverviewScreen({context: c}: {context: ViewContext}) {
  const d = c.data;
  const live = d.sessions.find((s) => s.status === 'running' || s.status === 'paused');

  if (['guest', 'observer'].includes(c.scope.persona)) {
    return (
      <>
        <PageHeading title="Your assigned exercise" subtitle="Only information shared with your exercise role is available." />
        {live ? (
          <Panel title={live.title}>
            <PanelBody>
              <p>
                {live.discipline} · {live.purpose} · {live.status}
              </p>
              <RouteLink text="Open assigned exercise" href={href(c, 'EX-04', {sessionId: live.id})} variant="primary" />
            </PanelBody>
          </Panel>
        ) : (
          <EmptyState title="No assigned exercise" description="No exercise is available in this scope." />
        )}
      </>
    );
  }

  if (!d.sessions.length) {
    return (
      <>
        <PageHeading
          title="Your readiness program"
          subtitle="Start with accepted organization context, then prepare your first exercise."
          actions={<RouteLink text="Set up context" href={href(c, 'CTX-01')} variant="primary" />}
        />
        <EmptyState
          title="Build a useful baseline"
          description="This organization has no exercises or reviewed observations. Complete the setup steps to begin."
          action={<RouteLink text="Choose a scenario" href={href(c, 'CAT-01')} variant="secondary" />}
        />
      </>
    );
  }

  // Keep dense manager overview fidelity via the battle-tested string renderer for the full layout.
  // Guest/empty paths above are native JSX; populated overview remains HtmlView until the full grid is ported.
  return <HtmlView html={overview(c)} />;
}

export function OverviewMetrics({context: c}: {context: ViewContext}) {
  if (!can(c.scope, 'analytics')) return null;
  const reviewedCoverage = coverage(opportunityRows(c.data));
  return (
    <div className="metric-grid section-gap">
      <MetricCard
        metric={{
          key: 'coverage',
          label: 'Reviewed opportunity coverage',
          value: reviewedCoverage.percent === null ? null : Math.round(reviewedCoverage.percent),
          displayState: reviewedCoverage.percent === null ? 'not_observed' : 'supported',
          unit: '%',
          numerator: reviewedCoverage.observed,
          denominator: reviewedCoverage.eligible || undefined,
          definitionVersion: '2.0',
          evidenceCutoff: fixtureCutoff,
        }}
      />
      <MetricCard
        metric={{
          key: 'actions',
          label: 'Actions awaiting verification',
          value: c.data.actions.filter((a) => ['pending', 'review_required'].includes(verificationState(c.data, a.id))).length,
          displayState: 'supported',
          unit: 'implemented actions',
          definitionVersion: '1.0',
          evidenceCutoff: fixtureCutoff,
        }}
      />
    </div>
  );
}
