import {AfterActionFrame} from './ProductFrames';

export function AfterAction() {
  return (
    <section className="ms-after" id="insights">
      <div className="ms-container">
        <div className="ms-section-head">
          <span className="ms-eyebrow">After-action insights</span>
          <h2>Understand how your team actually responds</h2>
          <p>
            MESA captures decisions, timing, coordination patterns, and readiness signals across every
            exercise so teams can identify gaps and improve with confidence.
          </p>
        </div>
        <div className="ms-after-panel">
          <div className="ms-after-copy">
            <h3>Turn every exercise into insight</h3>
            <p>
              Measure performance, identify gaps, and improve organizational readiness with objective,
              exercise-based analysis.
            </p>
            <a className="ms-link is-gold" href="#analytics">
              Explore insights <span aria-hidden>→</span>
            </a>
          </div>
          <AfterActionFrame />
        </div>
      </div>
    </section>
  );
}
