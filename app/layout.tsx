import type {Metadata, Viewport} from 'next';

function resolveFixtureChrome(raw: string | undefined, fallback: 'on' | 'off'): 'on' | 'off' {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === '') return fallback;
  if (['0', 'false', 'off', 'hide'].includes(value)) return 'off';
  if (['1', 'true', 'on', 'show'].includes(value)) return 'on';
  return fallback;
}

const fixtureChrome = resolveFixtureChrome(
  process.env.SHOW_FIXTURE_CHROME,
  process.env.NODE_ENV === 'production' ? 'off' : 'on',
);

export const metadata: Metadata = {
  title: 'MESA · Decision Landscape',
  description: 'MESA — Decision Landscape local readiness harness',
  icons: {
    icon: {
      url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='9' fill='%231B2B2A'/%3E%3Cg transform='translate(5.5 7) scale(0.6)'%3E%3Cpath d='M2 38 14 2h8l6 18 6-18h8L48 38H36l-4-16-4 12h-8l-4-12-4 16H2z' fill='%23E9EDE8'/%3E%3Cpath d='M2 38 14 2h8l6 18 6-18h8L48 38H36l-4-16-4 12h-8l-4-12-4 16H2z' fill='none' stroke='%23D7D2C8' stroke-width='1'/%3E%3Cpath d='M6 26c8-2 12 2 18 0s12-3 18 1' fill='none' stroke='%23B9B36A' stroke-width='2'/%3E%3C/g%3E%3C/svg%3E",
      type: 'image/svg+xml',
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#0C0D10',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" data-fixture-chrome={fixtureChrome}>
      <body>{children}</body>
    </html>
  );
}
