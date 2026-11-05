import {IconBars, IconCheck, IconLayers, IconTarget} from './icons';

export function ReadinessSignals() {
  return (
    <section className="ms-signals" id="signals">
      <div className="ms-container">
        <div className="ms-section-head">
          <span className="ms-eyebrow">Readiness signals</span>
          <h2>See where readiness breaks down</h2>
          <p>
            Connect exercise inputs, evaluate response methods, and surface capability gaps before they
            become incidents.
          </p>
        </div>

        <div className="ms-signals-grid">
          <article className="ms-signal-card">
            <div className="ms-signal-visual is-dashed">
              <div style={{display: 'flex', alignItems: 'center', gap: 8, fontWeight: 650}}>
                <span style={{color: 'var(--gold)'}}>
                  <IconLayers />
                </span>
                Inputs
              </div>
              <div className="ms-skel w-70" />
              <div className="ms-skel w-55" />
              <span className="ms-connected">
                <IconCheck width={14} height={14} style={{color: '#1f7a4d'}} />
                Connected
              </span>
            </div>
            <h3>Connect your exercise inputs</h3>
            <p>Bring plans, playbooks, and prior findings into every simulation.</p>
          </article>

          <article className="ms-signal-card">
            <div className="ms-signal-visual">
              <div style={{display: 'flex', alignItems: 'center', gap: 8, fontWeight: 650}}>
                <IconTarget />
                Decision Criteria
              </div>
              <div className="ms-criteria">
                {[1, 2, 3].map((n) => (
                  <div className="ms-criteria-row" key={n}>
                    <span className="ms-check" style={{width: 16, height: 16, fontSize: 9}}>
                      ✓
                    </span>
                    <div className={`ms-skel ${n === 2 ? 'w-55' : 'w-80'}`} style={{marginTop: 0, flex: 1}} />
                  </div>
                ))}
              </div>
            </div>
            <h3>Measure your response method</h3>
            <p>Score decisions against clear criteria tied to your operating model.</p>
          </article>

          <article className="ms-signal-card">
            <div className="ms-signal-visual">
              <div style={{display: 'flex', alignItems: 'center', gap: 8, fontWeight: 650}}>
                <span style={{color: 'var(--gold)'}}>
                  <IconBars />
                </span>
                Capability Map
              </div>
              <div className="ms-heatmap">
                <div>
                  <div className="ms-skel w-80" />
                  <div className="ms-skel w-70" />
                  <div className="ms-skel w-55" />
                  <div className="ms-skel w-80" />
                </div>
                <div className="ms-heatmap-grid" aria-hidden>
                  {[
                    '#A8D5BA',
                    '#FDE68A',
                    '#A8D5BA',
                    '#F8B1A5',
                    '#FDE68A',
                    '#A8D5BA',
                    '#F8B1A5',
                    '#FDE68A',
                    '#A8D5BA',
                    '#F8B1A5',
                    '#A8D5BA',
                    '#FDE68A',
                    '#F8B1A5',
                    '#A8D5BA',
                    '#FDE68A',
                    '#A8D5BA',
                  ].map((color, i) => (
                    <i key={i} style={{background: color}} />
                  ))}
                </div>
              </div>
            </div>
            <h3>Surface readiness gaps</h3>
            <p>Visualize strengths and weak spots across teams, scenarios, and capabilities.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
