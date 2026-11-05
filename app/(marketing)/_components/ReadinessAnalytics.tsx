import {GatesFrame, LeadershipFrame, TrackingFrame} from './ProductFrames';

export function ReadinessAnalytics() {
  return (
    <section className="ms-analytics" id="analytics">
      <div className="ms-container">
        <div className="ms-section-head">
          <span className="ms-eyebrow is-blue">Readiness analytics</span>
          <h2>Measure what matters.</h2>
          <p>
            Track improvement, prove readiness, and close the loop between simulation and organizational
            performance.
          </p>
        </div>
        <div className="ms-analytics-grid">
          <article className="ms-analytics-item">
            <div className="ms-analytics-preview">
              <LeadershipFrame />
            </div>
            <div>
              <h3>Leadership dashboard</h3>
              <p>See exercise activity, readiness trends, and key follow-up areas at a glance.</p>
            </div>
          </article>
          <article className="ms-analytics-item">
            <div className="ms-analytics-preview">
              <TrackingFrame />
            </div>
            <div>
              <h3>Readiness tracking</h3>
              <p>
                Monitor improvement over time with credible measures for coordination, speed, and
                decision quality.
              </p>
            </div>
          </article>
          <article className="ms-analytics-item">
            <div className="ms-analytics-preview">
              <GatesFrame />
            </div>
            <div>
              <h3>Readiness gates</h3>
              <p>Set thresholds and milestones so teams can demonstrate readiness before it matters most.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
