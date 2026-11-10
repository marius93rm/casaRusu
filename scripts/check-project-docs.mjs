import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, readdir } from 'node:fs/promises';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readme = await readFile(path.join(projectRoot, 'README.md'), 'utf8');
const i18nReadme = await readFile(path.join(projectRoot, 'docs/i18n/README.md'), 'utf8');
const packageJson = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8'));
const errors = [];

async function listHtml(directory, prefix = '') {
  const entries = await readdir(path.join(directory, prefix), { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...(await listHtml(directory, relativePath)));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(relativePath);
  }

  return files;
}

function readDocumentedCounts(content, label) {
  const match = content.match(/genera \*\*(\d+) file HTML\*\*:\s*\*\*(\d+) rotte di contenuto localizzate\*\*/i);

  if (!match) {
    errors.push(`${label}: indicare il totale HTML e le rotte di contenuto localizzate.`);
    return null;
  }

  if (!/404\.html|pagina 404|la 404|404/i.test(content)) {
    errors.push(`${label}: specificare che il totale include la pagina 404.`);
  }

  return { html: Number(match[1]), content: Number(match[2]) };
}

const htmlFiles = await listHtml(path.join(projectRoot, 'dist'));
const notFoundPages = htmlFiles.filter((file) => path.basename(file) === '404.html').length;
const actualCounts = { html: htmlFiles.length, content: htmlFiles.length - notFoundPages };

if (notFoundPages !== 1) errors.push(`dist/: attesa una pagina 404.html, trovate ${notFoundPages}.`);

for (const [label, content] of [
  ['README.md', readme],
  ['docs/i18n/README.md', i18nReadme],
]) {
  const documentedCounts = readDocumentedCounts(content, label);
  if (
    documentedCounts &&
    (documentedCounts.html !== actualCounts.html || documentedCounts.content !== actualCounts.content)
  ) {
    errors.push(
      `${label}: documenta ${documentedCounts.content} rotte e ${documentedCounts.html} HTML; ` +
        `la build ne genera ${actualCounts.content} e ${actualCounts.html}.`,
    );
  }
}

const buildChecks = [...packageJson.scripts.build.matchAll(/npm run (check:[a-z0-9-]+)/g)].map((match) => match[1]);
const readmeBuildSection = readme.split('## Verifica del redesign')[1] ?? '';
const documentedChecks = [...readmeBuildSection.matchAll(/`(check:[a-z0-9-]+)`/g)].map((match) => match[1]);

for (const check of buildChecks) {
  if (!packageJson.scripts[check]) errors.push(`package.json: il comando ${check} usato dalla build non è definito.`);
  if (!documentedChecks.includes(check)) errors.push(`README.md: manca il controllo ${check} eseguito dalla build.`);
}

for (const check of documentedChecks) {
  if (!buildChecks.includes(check)) errors.push(`README.md: ${check} è documentato ma non fa parte di npm run build.`);
}

if (errors.length > 0) {
  console.error(`Controllo documentazione non superato:\n- ${errors.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(
    `Controllo documentazione superato: ${actualCounts.content} rotte di contenuto, ` +
      `${actualCounts.html} file HTML inclusa la 404 e controlli della build documentati.`,
  );
}
