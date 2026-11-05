import {IconBars, IconBolt, IconLayers, IconMail} from './icons';
import {LiveRunFrame} from './ProductFrames';

export function LiveSimulation() {
  return (
    <section className="ms-live" id="live">
      <div className="ms-container">
        <div className="ms-live-top">
          <div className="ms-live-copy">
            <span className="ms-eyebrow is-blue">Live simulation</span>
            <h2>Run exercises that feel operationally real.</h2>
            <p>
              Adaptive injects, stakeholder pressure, and branching decisions keep teams engaged under
              realistic conditions—without putting production systems at risk.
            </p>
            <a className="ms-link" href="#modules">
              Explore simulations <span aria-hidden>→</span>
            </a>
          </div>
          <div className="ms-live-visual">
            <LiveRunFrame />
            <div className="ms-brief-card">
              <h4>Executive Brief</h4>
              <span className="ms-tag is-gold">Decision Required</span>
              <div className="ms-radio">
                <label className="is-selected">
                  <i />
                  Initiate containment
                </label>
                <label>
                  <i />
                  Engage threat actor
                </label>
                <label>
                  <i />
                  Decline recovery payment
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="ms-feature-grid">
          <article className="ms-feature-card">
            <div className="ms-feature-visual">
              <div className="ms-card" style={{width: '100%'}}>
                <div style={{display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12.5}}>
                  <IconMail width={16} height={16} />
                  <div>
                    <strong>Inject 12 · 10:57 AM</strong>
                    <div style={{color: '#5c6370', marginTop: 4}}>
                      Unexpected system degradation detected.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h3>
              <span className="ms-icon-blue">
                <IconBolt />
              </span>
              Adaptive injects
            </h3>
            <p>Introduce escalation paths and changing conditions as the exercise unfolds.</p>
          </article>

          <article className="ms-feature-card">
            <div className="ms-feature-visual">
              <div className="ms-card" style={{width: '100%'}}>
                <div style={{fontSize: 12, fontWeight: 650, marginBottom: 8}}>Decision</div>
                <div className="ms-radio is-branch">
                  <label className="is-selected">
                    <i />
                    Contain and recover
                  </label>
                  <label>
                    <i />
                    Negotiate payment
                  </label>
                </div>
              </div>
            </div>
            <h3>
              <span className="ms-icon-blue">
                <IconLayers />
              </span>
              Scenario branches
            </h3>
            <p>Test multiple response paths and see how outcomes change with each choice.</p>
          </article>

          <article className="ms-feature-card">
            <div className="ms-feature-visual">
              <div className="ms-card" style={{width: '100%', display: 'flex', gap: 14, alignItems: 'center'}}>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    border: '4px solid var(--btn)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 750,
                    fontSize: 14,
                  }}
                >
                  84%
                </div>
                <div>
                  <div style={{fontSize: 12.5, fontWeight: 650}}>Response Effectiveness</div>
                  <div style={{fontSize: 12, color: '#1f7a4d', fontWeight: 650}}>+12 pts ↑</div>
                </div>
              </div>
            </div>
            <h3>
              <span className="ms-icon-blue">
                <IconBars />
              </span>
              Immediate feedback
            </h3>
            <p>Surface observations and next-step guidance while the exercise is still fresh.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
