export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function backendApiHref() {
  const root = process.cwd().replace(/\\/g, '/');
  return `${root.startsWith('/') ? 'file://' : 'file:///'}${root}/backend/api.mjs`;
}

async function dispatch(request: Request) {
  const {handleApiRequest} = await import(/* webpackIgnore: true */ backendApiHref());
  return handleApiRequest(request);
}

export async function GET(request: Request) {
  return dispatch(request);
}

export async function POST(request: Request) {
  return dispatch(request);
}
