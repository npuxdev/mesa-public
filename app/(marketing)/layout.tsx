import type {Metadata} from 'next';
import {Inter, Newsreader} from 'next/font/google';
import './marketing.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--mesa-font-sans',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--mesa-font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MESA — Rehearse the incident before it happens.',
  description:
    'An AI-powered simulation platform for cybersecurity and operational resilience. Challenge your team, uncover gaps, and build real readiness without real-world risk.',
};

export default function MarketingLayout({children}: {children: React.ReactNode}) {
  return (
    <div className={`mesa-site ${inter.variable} ${newsreader.variable}`}>
      {children}
    </div>
  );
}
