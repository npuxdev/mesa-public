import {LogoMark} from './Logo';
import {
  IconAlert,
  IconBook,
  IconBolt,
  IconChart,
  IconCheck,
  IconGrid,
  IconHome,
  IconUsers,
} from './icons';

function FrameNav({active = 'Exercises'}: {active?: string}) {
  const items = [
    {label: 'Home', icon: <IconHome />},
    {label: 'Exercises', icon: <IconGrid />},
    {label: 'Insights', icon: <IconChart />},
    {label: 'Team', icon: <IconUsers />},
    {label: 'Library', icon: <IconBook />},
  ];
  return (
    <aside className="ms-frame-side">
      <div className="ms-logo">
        <LogoMark />
        <span>MESA</span>
      </div>
      <nav className="ms-frame-nav" aria-hidden="true">
        {items.map((item) => (
          <span key={item.label} className={item.label === active ? 'is-active' : undefined}>
            {item.icon}
            {item.label}
          </span>
        ))}
      </nav>
    </aside>
  );
}

let trendChartId = 0;

function TrendChart({stroke = '#F5BE29', fill = 'rgba(245,190,41,0.18)'}: {stroke?: string; fill?: string}) {
  const fillId = `mesaTrendFill-${++trendChartId}`;
  return (
    <svg className="ms-chart" viewBox="0 0 320 110" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <path
        d="M8 82 C48 78, 70 70, 96 62 S148 40, 176 46 S236 58, 262 28 S300 22, 312 18 L312 110 L8 110 Z"
        fill={`url(#${fillId})`}
      />
      <path
        d="M8 82 C48 78, 70 70, 96 62 S148 40, 176 46 S236 58, 262 28 S300 22, 312 18"
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {[
        [8, 82],
        [96, 62],
        [176, 46],
        [262, 28],
        [312, 18],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke={stroke} strokeWidth="2" />
      ))}
    </svg>
  );
}

export function HeroExerciseFrame() {
  return (
    <div className="ms-frame ms-hero-frame" aria-hidden="true">
      <FrameNav active="Exercises" />
      <div className="ms-frame-main">
        <div className="ms-frame-crumbs">Exercises / Ransomware Response</div>
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap'}}>
          <h3 className="ms-frame-title" style={{flex: 1}}>
            Ransomware Response
          </h3>
          <div className="ms-frame-toolbar">
            <span className="ms-mini-btn">Pause Exercise</span>
            <span className="ms-mini-btn">···</span>
          </div>
        </div>
        <div className="ms-frame-meta">
          <span className="ms-tag is-gold">In Progress</span>
          <span className="ms-tag">Tabletop Exercise</span>
          <span className="ms-tag">24 Participants</span>
          <span className="ms-tag">Started Jan 16, 2025</span>
        </div>
        <div className="ms-grid-2">
          <div className="ms-card is-gold-wash">
            <h4>
              <span className="ms-inject-icon" aria-hidden>
                <IconBolt width={15} height={15} />
              </span>
              Current Inject
            </h4>
            <p style={{fontSize: 13, marginBottom: 12, color: '#3a3f4a'}}>
              Ransomware notification from critical vendor.
            </p>
            <div className="ms-card-actions">
              <span className="ms-btn ms-btn-primary">
                Record Decision <span aria-hidden>→</span>
              </span>
              <span className="ms-btn ms-btn-secondary">View Context</span>
            </div>
          </div>
          <div className="ms-card">
            <h4>Exercise Timeline</h4>
            <div className="ms-stepper" aria-hidden>
              <div className="ms-stepper-item is-done">Brief</div>
              <div className="ms-stepper-item is-done">Initial Inject</div>
              <div className="ms-stepper-item is-current">Escalation</div>
              <div className="ms-stepper-item">Review</div>
            </div>
          </div>
        </div>
        <div className="ms-metrics">
          <div className="ms-metric">
            <div className="ms-metric-label">Decision Quality</div>
            <div className="ms-metric-value">89%</div>
          </div>
          <div className="ms-metric">
            <div className="ms-metric-label">Team Alignment</div>
            <div className="ms-metric-value">92%</div>
          </div>
          <div className="ms-metric">
            <div className="ms-metric-label">Response Time</div>
            <div className="ms-metric-value">1h 24m</div>
            <div className="ms-metric-delta">−18%</div>
          </div>
          <div className="ms-metric">
            <div className="ms-metric-label">Key Findings</div>
            <div className="ms-findings">
              <ul>
                <li>
                  <IconCheck width={14} height={14} style={{color: '#1f7a4d'}} /> Vendor escalation path confirmed
                </li>
                <li>
                  <IconAlert width={14} height={14} style={{color: '#b45309'}} /> Comms lag on legal review
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AfterActionFrame() {
  return (
    <div className="ms-frame" aria-hidden="true">
      <FrameNav active="Insights" />
      <div className="ms-frame-main">
        <div className="ms-frame-crumbs">Exercises / Falcon Resolve / After-Action Review</div>
        <h3 className="ms-frame-title">After-Action Review</h3>
        <div className="ms-frame-meta">
          <span className="ms-tag is-gold">Complete</span>
          <span className="ms-tag">Falcon Resolve</span>
          <span className="ms-tag">48 Participants</span>
          <span className="ms-tag">Jan 16, 2025</span>
        </div>
        <div className="ms-kpi-row">
          {[
            ['Completion', '84%'],
            ['Decision Quality', '89%'],
            ['Team Alignment', '92%'],
          ].map(([label, value]) => (
            <div className="ms-kpi" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <div className="ms-progress">
                <span style={{width: value}} />
              </div>
            </div>
          ))}
        </div>
        <div className="ms-grid-2">
          <div className="ms-card">
            <h4>Readiness Trend</h4>
            <TrendChart />
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8a909b'}}>
              <span>Ex 01</span>
              <span>Ex 02</span>
              <span>Ex 03</span>
              <span>Ex 04</span>
            </div>
          </div>
          <div className="ms-card">
            <h4>Key Findings</h4>
            <div className="ms-findings">
              <ul>
                <li>
                  <IconCheck width={14} height={14} style={{color: '#1f7a4d', flex: 'none'}} />
                  <span>
                    Improved coordination: Cross-team handoffs were 18% faster than the previous exercise.
                  </span>
                </li>
                <li>
                  <IconAlert width={14} height={14} style={{color: '#b45309', flex: 'none'}} />
                  <span>
                    Resolve decision delays: Decision time remained above target in two critical scenarios.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LiveRunFrame() {
  return (
    <div className="ms-frame" aria-hidden="true">
      <FrameNav active="Exercises" />
      <div className="ms-frame-main">
        <div className="ms-frame-crumbs">Live / Ransomware Response</div>
        <h3 className="ms-frame-title">Ransomware Response</h3>
        <div className="ms-steps" style={{marginBottom: 14}}>
          <span>Prepare</span>
          <span className="is-on">Exercise</span>
          <span>Assess</span>
          <span>Report</span>
        </div>
        <div className="ms-card">
          <h4>Inject Feed</h4>
          <div className="ms-timeline">
            {[
              ['09:12', 'Initial ransomware notice received'],
              ['09:31', 'Vendor confirms partial outage'],
              ['10:04', 'Legal requests negotiation posture'],
              ['10:57', 'Unexpected system degradation detected'],
            ].map(([time, text]) => (
              <div className="ms-timeline-row" key={time}>
                <span className="ms-dot is-current" />
                <span>{text}</span>
                <span style={{color: '#8a909b'}}>{time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeadershipFrame() {
  return (
    <div className="ms-frame" style={{minHeight: 248}} aria-hidden="true">
      <FrameNav active="Insights" />
      <div className="ms-frame-main">
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
          <h4 style={{margin: 0, fontFamily: 'var(--font-sans)', fontSize: 14}}>Program Overview</h4>
          <span className="ms-tag">Last 90 Days</span>
        </div>
        <div className="ms-kpi-row">
          <div className="ms-kpi">
            <span>Exercises</span>
            <strong>24</strong>
            <div className="ms-metric-delta">+33%</div>
          </div>
          <div className="ms-kpi">
            <span>Readiness</span>
            <strong>84%</strong>
            <div className="ms-metric-delta">+12 pts</div>
          </div>
          <div className="ms-kpi">
            <span>Follow-Up</span>
            <strong>3</strong>
          </div>
        </div>
        <div className="ms-card" style={{padding: 10}}>
          <h4>Readiness Trend</h4>
          <TrendChart stroke="#3B5BDB" fill="rgba(59,91,219,0.16)" />
        </div>
      </div>
    </div>
  );
}

export function TrackingFrame() {
  return (
    <div className="ms-mini-frame" aria-hidden="true">
      <h4 style={{margin: 0, fontFamily: 'var(--font-sans)', fontSize: 14}}>Readiness over time</h4>
      <TrendChart stroke="#3B5BDB" fill="rgba(59,91,219,0.14)" />
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8a909b'}}>
        <span>Exercise 01</span>
        <span>02</span>
        <span>03</span>
        <span>Exercise 04</span>
      </div>
      <div className="ms-deltas">
        <span>Coordination +14 pts</span>
        <span>Speed +22%</span>
        <span>Decision Quality +11 pts</span>
      </div>
    </div>
  );
}

export function GatesFrame() {
  return (
    <div className="ms-mini-frame" aria-hidden="true">
      <h4 style={{margin: '0 0 12px', fontFamily: 'var(--font-sans)', fontSize: 14}}>Readiness gates</h4>
      <div className="ms-gate-list">
        <div className="ms-gate">
          <div className="ms-gate-left">
            <span className="ms-check">✓</span>
            Plan & Design
          </div>
          <span className="ms-tag is-green">Complete</span>
        </div>
        <div className="ms-gate">
          <div className="ms-gate-left">
            <span className="ms-check">✓</span>
            Conduct Exercise
          </div>
          <span className="ms-tag is-green">Complete</span>
        </div>
        <div className="ms-gate is-active">
          <div className="ms-gate-left">
            <span className="ms-check is-current" />
            Demonstrate Readiness
          </div>
          <span className="ms-tag is-gold">In Progress</span>
        </div>
        <div className="ms-gate">
          <div className="ms-gate-left">
            <span className="ms-check is-empty" />
            Certification
          </div>
          <span className="ms-tag is-outline">Not Started</span>
        </div>
      </div>
    </div>
  );
}

export function ScenarioBuilderFrame() {
  return (
    <div className="ms-frame" aria-hidden="true">
      <FrameNav active="Home" />
      <div className="ms-frame-main">
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap'}}>
          <div style={{flex: 1}}>
            <div className="ms-frame-crumbs">Scenario Builder</div>
            <h3 className="ms-frame-title">Ransomware Response</h3>
          </div>
          <div className="ms-frame-toolbar">
            <span className="ms-mini-btn">Save draft</span>
            <span className="ms-btn ms-btn-primary" style={{minHeight: 34, padding: '0 12px', fontSize: 12.5}}>
              Build scenario <span aria-hidden>→</span>
            </span>
          </div>
        </div>
        <div className="ms-steps">
          <span className="is-on">1. Configure</span>
          <span>2. Build</span>
          <span>3. Review</span>
        </div>
        <div className="ms-builder-flow">
          {[
            ['Threat profile', 'Ransomware'],
            ['Inject sequence', '5 Injects'],
            ['Teams & roles', '12 Teams'],
            ['Escalation paths', '2 Paths'],
          ].map(([title, meta], i) => (
            <div key={title} style={{display: 'contents'}}>
              {i > 0 ? <span className="ms-builder-arrow">→</span> : null}
              <div className="ms-builder-chip">
                <strong>{title}</strong>
                <span>{meta}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="ms-card">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, fontSize: 12}}>
            <div>
              <div style={{color: '#8a909b'}}>Threat</div>
              <strong>Ransomware</strong>
            </div>
            <div>
              <div style={{color: '#8a909b'}}>Injects</div>
              <strong>5</strong>
            </div>
            <div>
              <div style={{color: '#8a909b'}}>Teams</div>
              <strong>12</strong>
            </div>
            <div>
              <div style={{color: '#8a909b'}}>Est. duration</div>
              <strong>~4 hours</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LiveExercisesFrame() {
  return (
    <div className="ms-frame" aria-hidden="true">
      <FrameNav active="Exercises" />
      <div className="ms-frame-main">
        <div className="ms-frame-crumbs">Exercises / Live</div>
        <h3 className="ms-frame-title">Live Exercises</h3>
        <div className="ms-card is-gold-wash">
          <h4>Active session</h4>
          <p style={{fontSize: 13, marginBottom: 8}}>Falcon Resolve · Escalation underway</p>
          <span className="ms-tag is-gold">18 online</span>
        </div>
      </div>
    </div>
  );
}

export function AiInjectsFrame() {
  return (
    <div className="ms-frame" aria-hidden="true">
      <FrameNav active="Exercises" />
      <div className="ms-frame-main">
        <div className="ms-frame-crumbs">AI Injects</div>
        <h3 className="ms-frame-title">Adaptive inject queue</h3>
        <div className="ms-card">
          <div className="ms-timeline">
            {['Vendor pressure increase', 'Media inquiry arrives', 'Secondary system failure'].map((item, i) => (
              <div className="ms-timeline-row" key={item}>
                <span className={i === 0 ? 'ms-dot is-current' : 'ms-dot'} />
                <span>{item}</span>
                <span className="ms-tag">AI</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InsightsModuleFrame() {
  return <AfterActionFrame />;
}

export function ReadinessModuleFrame() {
  return (
    <div className="ms-frame" aria-hidden="true">
      <FrameNav active="Insights" />
      <div className="ms-frame-main">
        <div className="ms-frame-crumbs">Readiness</div>
        <h3 className="ms-frame-title">Organization readiness</h3>
        <div className="ms-kpi-row">
          <div className="ms-kpi">
            <span>Score</span>
            <strong>84%</strong>
          </div>
          <div className="ms-kpi">
            <span>Gate</span>
            <strong>3 / 4</strong>
          </div>
          <div className="ms-kpi">
            <span>Trend</span>
            <strong>+12</strong>
          </div>
        </div>
        <TrendChart />
      </div>
    </div>
  );
}
