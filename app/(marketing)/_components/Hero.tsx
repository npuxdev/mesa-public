import {HeroExerciseFrame} from './ProductFrames';
import {HeroFrameTilt} from './HeroFrameTilt';
import {HeroTopo} from './Topo';

export function Hero() {
  return (
    <section className="ms-hero" id="top">
      <HeroTopo />
      <div className="ms-container">
        <div className="ms-hero-copy">
          <div className="ms-pill">
            <span className="ms-new">NEW</span>
            <span>AI-powered tabletop exercises for cyber readiness →</span>
          </div>
          <h1>Rehearse the incident before it happens.</h1>
          <p>
            An AI-powered simulation platform for cybersecurity and operational resilience. Challenge
            your team, uncover gaps, and build real readiness without real-world risk.
          </p>
          <div className="ms-hero-ctas">
            <a className="ms-btn ms-btn-primary" href="#modules">
              See the platform <span aria-hidden>→</span>
            </a>
            <a className="ms-btn ms-btn-secondary" href="#modules">
              Explore scenarios
            </a>
          </div>
        </div>
        <HeroFrameTilt>
          <HeroExerciseFrame />
        </HeroFrameTilt>
        <div className="ms-trust">
          <span className="ms-trust-label">Designed for resilient organizations</span>
          <span className="ms-trust-divider" aria-hidden />
          <div className="ms-trust-logos">
            <span className="ms-trust-logo">Apex Systems</span>
            <span className="ms-trust-logo">Crest Industries</span>
            <span className="ms-trust-logo">Northbridge</span>
            <span className="ms-trust-logo">Rivermere</span>
          </div>
        </div>
      </div>
    </section>
  );
}
