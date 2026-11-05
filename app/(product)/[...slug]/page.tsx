'use client';

import dynamic from 'next/dynamic';

const MesaHost = dynamic(
  () => import('../../MesaHost').then((m) => m.MesaHost),
  {
    ssr: false,
    loading: () => (
      <main id="main" className="main-content" aria-busy="true">
        <p>Loading MESA workspace…</p>
      </main>
    ),
  },
);

export default function CatchAllPage() {
  return <MesaHost />;
}
