'use client';

import {useState} from 'react';
import {IconBars, IconBolt, IconLayers, IconUsers} from './icons';
import {
  AiInjectsFrame,
  InsightsModuleFrame,
  LiveExercisesFrame,
  ReadinessModuleFrame,
  ScenarioBuilderFrame,
} from './ProductFrames';

const MODULES = [
  {
    id: 'builder',
    label: 'Scenario Builder',
    title: 'Build realistic scenarios',
    body: 'Create multi-stage exercises tailored to your risks, teams, and operational priorities.',
    cta: 'Explore Scenario Builder',
    frame: <ScenarioBuilderFrame />,
  },
  {
    id: 'live',
    label: 'Live Exercises',
    title: 'Facilitate with confidence',
    body: 'Run synchronized sessions, pace injects, and keep every role aligned in real time.',
    cta: 'Explore Live Exercises',
    frame: <LiveExercisesFrame />,
  },
  {
    id: 'injects',
    label: 'AI Injects',
    title: 'Keep pressure adaptive',
    body: 'Let AI escalate conditions based on participant decisions so no two runs feel identical.',
    cta: 'Explore AI Injects',
    frame: <AiInjectsFrame />,
  },
  {
    id: 'insights',
    label: 'Insights',
    title: 'Turn outcomes into evidence',
    body: 'Capture decisions, timing, and coordination patterns for a crisp after-action review.',
    cta: 'Explore Insights',
    frame: <InsightsModuleFrame />,
  },
  {
    id: 'readiness',
    label: 'Readiness',
    title: 'Prove improvement over time',
    body: 'Track gates, trends, and follow-ups so leadership can see readiness clearly.',
    cta: 'Explore Readiness',
    frame: <ReadinessModuleFrame />,
  },
] as const;

export function Modules() {
  const [active, setActive] = useState<(typeof MODULES)[number]['id']>('builder');
  const current = MODULES.find((m) => m.id === active) ?? MODULES[0];

  return (
    <section className="ms-modules" id="modules">
      <div className="ms-container">
        <div className="ms-section-head">
          <span className="ms-eyebrow">Flexible by design</span>
          <h2>Powerful alone, better together</h2>
          <p>MESA’s modules work together to create a complete simulation stack for your organization.</p>
        </div>

        <div className="ms-module-tabs" role="tablist" aria-label="MESA modules">
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              type="button"
              role="tab"
              aria-selected={active === mod.id}
              className={`ms-module-tab${active === mod.id ? ' is-active' : ''}`}
              onClick={() => setActive(mod.id)}
            >
              {mod.label}
            </button>
          ))}
        </div>

        <div className="ms-module-panel">
          <div className="ms-module-copy">
            <h3>{current.title}</h3>
            <p>{current.body}</p>
            <a className="ms-link is-gold" href="/sign-in">
              {current.cta} <span aria-hidden>→</span>
            </a>
          </div>
          {current.frame}
        </div>

        <div className="ms-capability-grid">
          <article className="ms-capability">
            <span className="ms-icon-tone">
              <IconLayers />
            </span>
            <h4>Custom scenarios</h4>
            <p>Tailor exercises to your risks and operating model.</p>
          </article>
          <article className="ms-capability">
            <span className="ms-icon-tone">
              <IconUsers />
            </span>
            <h4>Cross-functional teams</h4>
            <p>Coordinate security, IT, leadership, and communications.</p>
          </article>
          <article className="ms-capability">
            <span className="ms-icon-tone">
              <IconBolt />
            </span>
            <h4>Adaptive injects</h4>
            <p>Simulations evolve as participants make decisions.</p>
          </article>
          <article className="ms-capability">
            <span className="ms-icon-tone">
              <IconBars />
            </span>
            <h4>Actionable insights</h4>
            <p>Turn every exercise into measurable readiness.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
