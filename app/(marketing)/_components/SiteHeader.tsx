'use client';

import {useEffect, useState} from 'react';
import {Logo} from './Logo';
import {IconChevron} from './icons';

const NAV = [
  {
    label: 'Platform',
    href: '#live',
    items: [
      {label: 'Live simulation', href: '#live'},
      {label: 'Modules', href: '#modules'},
      {label: 'Readiness analytics', href: '#analytics'},
    ],
  },
  {
    label: 'Scenarios',
    href: '#modules',
    items: [
      {label: 'Scenario Builder', href: '#modules'},
      {label: 'Explore scenarios', href: '#modules'},
    ],
  },
  {
    label: 'Use Cases',
    href: '#signals',
    items: [
      {label: 'Cyber readiness', href: '#signals'},
      {label: 'Operational resilience', href: '#impact'},
    ],
  },
  {
    label: 'Resources',
    href: '#news',
    items: [
      {label: 'Newsroom', href: '#news'},
      {label: 'After-action insights', href: '#insights'},
    ],
  },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`ms-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="ms-container ms-header-inner">
        <Logo />
        <nav className="ms-nav" aria-label="Primary">
          {NAV.map((item) => (
            <div className="ms-nav-item" key={item.label}>
              <a className="ms-nav-trigger" href={item.href}>
                {item.label}
                <IconChevron width={14} height={14} />
              </a>
              <div className="ms-nav-menu">
                {item.items.map((sub) => (
                  <a key={sub.label} href={sub.href}>
                    {sub.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="ms-header-actions">
          <a className="ms-signin" href="/sign-in">
            Sign In
          </a>
          <a className="ms-btn ms-btn-primary" href="/sign-in">
            Request Access <span aria-hidden>→</span>
          </a>
          <button
            className="ms-menu-toggle"
            type="button"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </div>
      <div className={`ms-container ms-mobile-nav${open ? ' is-open' : ''}`}>
        {NAV.flatMap((item) => item.items).map((sub) => (
          <a key={sub.label} href={sub.href} onClick={() => setOpen(false)}>
            {sub.label}
          </a>
        ))}
        <a className="ms-btn ms-btn-secondary" href="/sign-in">
          Sign In
        </a>
        <a className="ms-btn ms-btn-primary" href="/sign-in">
          Request Access →
        </a>
      </div>
    </header>
  );
}
