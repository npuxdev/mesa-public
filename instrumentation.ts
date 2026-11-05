function backendApiHref() {
  const root = process.cwd().replace(/\\/g, '/');
  return `${root.startsWith('/') ? 'file://' : 'file:///'}${root}/backend/api.mjs`;
}

export async function register() {
  // Instrumentation is compiled for multiple runtimes. Load the Node backend by absolute
  // file URL with webpackIgnore so child_process/crypto never enter the webpack graph.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const {startAutomation} = await import(/* webpackIgnore: true */ backendApiHref());
  startAutomation();
}
