'use client';

import type {CSSProperties, ReactNode} from 'react';
import type {MetricView} from '../../src/contracts';
import {assertMetric} from '../../src/contracts';
import {escape, label, titleCase, date as formatDate} from '../../src/ui';

const ICON_PATHS: Record<string, string> = {
  overview: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  exercise: '<path d="M9 3h6l2 4h3v14H4V7h3z"/><path d="m9 11 6 4-6 4z"/>',
  scenario: '<path d="M3 7h7l2-3h9v16H3z"/><path d="M8 11h8M8 15h6"/>',
  report: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M10 12h5M10 16h5"/>',
  action: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="m7 12 3 3 7-7"/>',
  analytics: '<path d="M4 20V10h4v10M10 20V4h4v16M16 20V7h4v13"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M17 15a5 5 0 0 1 4 5"/>',
  development: '<path d="m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/>',
  recommend: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/>',
  organization: '<path d="M4 21V3h11v18M15 9h5v12M8 7h3M8 11h3M8 15h3M2 21h20"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  bell: '<path d="M5 17h14l-2-4V9a5 5 0 0 0-10 0v4zM10 21h4"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5M12 16v1"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  pause: '<path d="M8 4v16M16 4v16"/>',
  play: '<path d="m7 4 14 8-14 8z"/>',
  link: '<path d="m10 14 4-4M9 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M15 8l2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  warning: '<path d="m12 3 10 18H2zM12 9v5M12 17v1"/>',
  filter: '<path d="M3 5h18M6 12h12M9 19h6"/>',
  refresh: '<path d="M20 8a8 8 0 1 0 0 8M20 3v6h-6"/>',
  import: '<path d="M12 3v10m-4-4 4 4 4-4M5 12l-2 5v4h18v-4l-2-5M3 17h5l2 2h4l2-2h5"/>',
  'sidebar-collapse': '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m7-13-4 4 4 4"/>',
  'sidebar-expand': '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m4-13 4 4-4 4"/>',
};

let logoSequence = 0;

export function Icon({name, className = ''}: {name: string; className?: string}) {
  const path = ICON_PATHS[name] || ICON_PATHS.report;
  return (
    <svg
      className={`icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{__html: path}}
    />
  );
}

export function Logo({variant = 'full'}: {variant?: 'full' | 'compact'}) {
  const id = `mesa-react-${++logoSequence}`;
  const mark = (
    <svg className="brand-mark" viewBox="0 0 48 40" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B2B2A" />
          <stop offset="22%" stopColor="#6E7A77" />
          <stop offset="38%" stopColor="#B9B36A" />
          <stop offset="42%" stopColor="#E9EDE8" />
          <stop offset="62%" stopColor="#D7D2C8" />
          <stop offset="82%" stopColor="#6E7A77" />
          <stop offset="100%" stopColor="#1B2B2A" />
        </linearGradient>
        <clipPath id={`${id}-c`}>
          <path d="M1.5 39 13.5 1.5h7.2L24 18.5 27.3 1.5h7.2L46.5 39H35.2l-3.6-15.2-3.4 10.8h-8.4l-3.4-10.8L12.8 39H1.5z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-c)`}>
        <rect width="48" height="40" fill={`url(#${id}-g)`} />
        <path d="M-2 14c10 3 18-4 28-1 9 2 16 4 24-1" fill="none" stroke="#B9B36A" strokeWidth="1.75" />
        <path d="M-2 22c9-2 17 3 26 0 10-3 16-2 26 2" fill="none" stroke="#E9EDE8" strokeWidth="1" opacity=".7" />
        <path d="M-2 30c8 2 15-3 24 0 10 3 17 1 26-2" fill="none" stroke="#1B2B2A" strokeWidth="1" opacity=".35" />
      </g>
      <path d="M1.5 39 13.5 1.5h7.2L24 18.5 27.3 1.5h7.2L46.5 39H35.2l-3.6-15.2-3.4 10.8h-8.4l-3.4-10.8L12.8 39H1.5z" fill="none" stroke="#1B2B2A" strokeWidth="1.25" />
    </svg>
  );
  if (variant === 'compact') return <span className="brand-logo compact">{mark}</span>;
  return (
    <span className="brand-logo">
      <span className="brand-mark-wrap">{mark}</span>
      <span className="brand-wordmark">
        MESA<small>Decision Landscape</small>
      </span>
    </span>
  );
}

export function Badge({text, tone = 'neutral'}: {text: string; tone?: string}) {
  return (
    <span className={`badge ${tone}`}>
      {['success', 'warning', 'danger'].includes(tone) ? <span aria-hidden="true">{tone === 'success' ? '✓' : '!'}</span> : null}
      {text}
    </span>
  );
}

export function StatusBadge({status}: {status: string}) {
  const tone = ['running', 'published', 'approved', 'verified', 'accepted'].includes(status)
    ? 'success'
    : ['draft', 'in_review', 'disputed', 'blocked', 'verification_pending', 'paused'].includes(status)
      ? 'warning'
      : ['withdrawn', 'revoked', 'rejected'].includes(status)
        ? 'danger'
        : 'neutral';
  return <Badge text={label(status)} tone={tone} />;
}

export function ActionButton({
  text,
  action,
  variant = 'secondary',
  extra = {},
  type = 'button',
  disabled,
}: {
  text: string;
  action: string;
  variant?: string;
  extra?: Record<string, string>;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button className={`btn ${variant}`} type={type} data-action={action} disabled={disabled} {...extra}>
      {text}
    </button>
  );
}

export function RouteLink({
  text,
  href,
  variant = 'text',
  glyph,
  children,
}: {
  text?: string;
  href: string;
  variant?: string;
  glyph?: string;
  children?: ReactNode;
}) {
  const className = variant === 'text' ? 'text-link' : `btn ${variant}`;
  return (
    <a className={className} href={href} data-route>
      {children ?? text}
      {glyph ? <Icon name={glyph} /> : null}
    </a>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <header className="panel-head">
        <div>
          <h2>{titleCase(title)}</h2>
          {subtitle ? <p className="meta">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function Notice({title, message, tone = 'info'}: {title: string; message: string; tone?: string}) {
  return (
    <div className={`notice ${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon name={tone === 'warning' || tone === 'danger' ? 'warning' : 'info'} />
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

export function EmptyState({title, description, action}: {title: string; description: string; action?: ReactNode}) {
  return (
    <div className="empty-state">
      <Icon name="report" />
      <h2>{titleCase(title)}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function MetricCard({metric}: {metric: MetricView}) {
  assertMetric(metric);
  return (
    <article className="metric" data-metric-state={metric.displayState}>
      <p>{metric.label}</p>
      <strong>
        {metric.displayState === 'supported' ? `${metric.value}${metric.unit === '%' ? '%' : ''}` : label(metric.displayState)}
      </strong>
      <span>{metric.displayState === 'supported' && metric.unit !== '%' ? metric.unit : ''}</span>
      <small>
        {metric.denominator !== undefined
          ? `${metric.numerator} / ${metric.denominator} eligible opportunities`
          : 'No eligible numeric comparison'}
        {metric.coveragePercent !== undefined ? ` · ${metric.coveragePercent}% coverage` : ''}
      </small>
    </article>
  );
}

export function PageHeading({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{titleCase(title)}</h1>
        <p>{subtitle}</p>
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}

export function PanelBody({children, style}: {children: ReactNode; style?: CSSProperties}) {
  return (
    <div className="panel-body" style={style}>
      {children}
    </div>
  );
}

export {escape, label, titleCase, formatDate as date};
