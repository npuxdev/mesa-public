import type {NextConfig} from 'next';

/** Mirrors src/routes.ts legacyRoutes → canonical Atlas paths for HTML shells. */
const legacyRedirects = [
  {source: '/index.html', destination: '/o/atlas/sessions/s-ir-01/live/situation'},
  {source: '/simulate.html', destination: '/o/atlas/exercises'},
  {source: '/scenarios.html', destination: '/o/atlas/scenarios/catalog'},
  {source: '/analytics.html', destination: '/o/atlas/analytics'},
  {source: '/team.html', destination: '/o/atlas/people'},
  {source: '/library.html', destination: '/o/atlas/reports'},
  {source: '/risks.html', destination: '/o/atlas/actions'},
  {source: '/settings.html', destination: '/o/atlas/settings/general'},
  {source: '/screen-2.html', destination: '/o/atlas/exercises/new'},
  {source: '/screen-3.html', destination: '/o/atlas/sessions/s-ir-01/live/situation'},
  {source: '/screen-4.html', destination: '/o/atlas/sessions/s-ir-01/live/decisions'},
  {source: '/screen-5.html', destination: '/o/atlas/sessions/s-ir-01/live/team'},
  {source: '/screen-6.html', destination: '/o/atlas/sessions/s-ir-01/debrief'},
];

const nextConfig: NextConfig = {
  // Domain modules use NodeNext-style `.js` import specifiers that point at `.ts` sources.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias || {}),
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
  async redirects() {
    return legacyRedirects.map((r) => ({...r, permanent: false}));
  },
};

export default nextConfig;
