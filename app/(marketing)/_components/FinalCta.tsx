import {FinalTopo} from './Topo';

export function FinalCta() {
  return (
    <section className="ms-final" id="request">
      <div className="ms-container">
        <div className="ms-final-band">
          <FinalTopo />
          <h2>See MESA in action</h2>
          <p>Request access for a guided walkthrough, or explore the platform and start rehearsing readiness.</p>
          <div className="ms-final-actions">
            <a className="ms-btn ms-btn-primary" href="/sign-in">
              Request access <span aria-hidden>→</span>
            </a>
            <a className="ms-btn ms-btn-secondary" href="#modules">
              Explore the platform
            </a>
          </div>
        </div>
      </div>
      <div className="ms-container ms-footer">
        <p>© {new Date().getFullYear()} MESA. Rehearse the incident before it happens.</p>
      </div>
    </section>
  );
}
