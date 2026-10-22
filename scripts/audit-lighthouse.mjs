import { mkdir, writeFile } from 'node:fs/promises';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';

// Attach only: this script deliberately never launches a browser on this host.
const port = Number(process.env.LIGHTHOUSE_PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('Set LIGHTHOUSE_PORT to an existing Chrome CDP port. No browser will be launched.');
}
const endpoint = `http://127.0.0.1:${port}`;
const version = await fetch(`${endpoint}/json/version`, { signal: AbortSignal.timeout(5000) });
if (!version.ok || !(await version.json()).webSocketDebuggerUrl) throw new Error('No attachable CDP endpoint.');

const origin = process.env.AUDIT_ORIGIN || 'http://127.0.0.1:4325';
const routes = ['/', '/en/', '/meniu/', '/en/meniu/', '/preparate/snitel-cotlet-porc/', '/en/preparate/snitel-cotlet-porc/'];
const directory = 'reports/lighthouse';
await mkdir(directory, { recursive: true });
const summary = [];
let failed = false;
for (const profile of ['mobile', 'desktop']) {
  for (const route of routes) {
    const name = `${profile}-${route === '/' ? 'home' : route.replaceAll('/', '-').replace(/^-|-$/g, '')}`;
    const result = await lighthouse(new URL(route, origin).href, {
      port, hostname: '127.0.0.1', logLevel: 'error', output: ['html', 'json'],
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    }, profile === 'desktop' ? desktopConfig : undefined);
    if (!result || result.lhr.runtimeError) throw new Error(`${name}: ${result?.lhr.runtimeError?.message || 'no report'}`);
    await writeFile(`${directory}/${name}.html`, result.report[0]);
    await writeFile(`${directory}/${name}.json`, result.report[1]);
    const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([key, category]) => [key, Math.round(category.score * 100)]));
    const failures = Object.values(result.lhr.audits).filter(a => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'informative').map(a => ({ id: a.id, title: a.title, displayValue: a.displayValue }));
    summary.push({ profile, route, scores, failures });
    console.log(JSON.stringify({ profile, route, scores }));
    if (Object.values(scores).some(score => score < 100)) failed = true;
  }
}
await writeFile(`${directory}/summary.json`, JSON.stringify(summary, null, 2));
if (failed) process.exitCode = 1;
