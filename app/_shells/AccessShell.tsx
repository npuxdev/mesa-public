'use client';

import type {ReactNode} from 'react';
import {ActionButton, Logo} from '../_components/ui';

export function AccessShell({children}: {children: ReactNode}) {
  return (
    <div className="access-page">
      <main id="main" className="access-card" tabIndex={-1}>
        {children}
        <div className="access-footer fixture-chrome">
          <ActionButton text="Fixture controls" action="fixture-controls" variant="tertiary" />
        </div>
      </main>
    </div>
  );
}

export function AccessUnavailable({children}: {children: ReactNode}) {
  return (
    <div className="access-page">
      <div className="access-card">
        <Logo />
        {children}
      </div>
    </div>
  );
}
