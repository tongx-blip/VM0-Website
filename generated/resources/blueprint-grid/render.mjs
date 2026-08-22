#!/usr/bin/env node
/* render.mjs — the bundle's only entry point.
 *
 *   node render.mjs                     # smoke-test: renders sample-plan.json -> out.html
 *   node render.mjs plan.json           # -> out.html
 *   node render.mjs plan.json site.html # -> site.html
 *
 * Renders the plan through this bundle's skin without fetching external images. Media slots keep
 * their semantic `data-photo` / `data-media` metadata so the authoring AI can directly fill them
 * from user-provided assets, relevant source or reference material, or AI-generated images.
 */
import { fileURLToPath } from 'url';
import { dirname, join, isAbsolute, resolve } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const here = dirname(fileURLToPath(import.meta.url));
const meta = JSON.parse(readFileSync(join(here, 'template.json'), 'utf8'));

const planArg = process.argv[2] || join(here, 'sample-plan.json');
const outArg  = process.argv[3] || join(here, 'out.html');
const planPath = isAbsolute(planArg) ? planArg : resolve(here, planArg);
if (!existsSync(planPath)) {
  console.error(`render.mjs: no such plan file: ${planPath}\n` +
                `  usage: node render.mjs [plan.json] [out.html]  (defaults to sample-plan.json -> out.html)`);
  process.exit(2);
}

let plan;
try { plan = JSON.parse(readFileSync(planPath, 'utf8')); }
catch (e) { console.error(`render.mjs: ${planPath} is not valid JSON — ${e.message}`); process.exit(2); }

const out = isAbsolute(outArg) ? outArg : resolve(here, outArg);

// The engine reads foundation.css / motion.css / effects.css / site-shell.html by BARE relative path,
// so the process cwd must be engine/. Dynamic-import specifiers stay relative to THIS file, not cwd.
process.chdir(join(here, 'engine'));

if (meta.arch === 'v3') {
  // template-owned structure: composePage(template, plan) -> { html, problems }
  const { composePage } = await import('./engine/compose.mjs');
  const { template } = await import('./' + meta.skin);
  const r = composePage(template, plan);
  writeFileSync(out, r.html);
  const secs = (r.html.match(/data-section=/g) || []).length;
  console.log(`${out}: ${r.html.length} bytes · ${secs} sections · plan=[${(plan.sections || []).map(s => s.id).join(', ')}]`);
  if (r.problems.length) console.log('CONTRACT PROBLEMS:\n  ' + r.problems.join('\n  '));
} else {
  // skin re-styles shared sections: renderPage(skin, page)
  const { renderPage } = await import('./engine/gen-engine.mjs');
  const { skin } = await import('./' + meta.skin);
  plan.out = out;
  renderPage(skin, plan);
}
console.log('rendered -> ' + out);
