// Builds a SvelteKit app for itch.io into build-itch/, zipped there as bitch.zip: npm run build:itch
//
// Reusable across projects. It strips the install-as-an-app extras, which do nothing inside itch's iframe:
// home screen and tile icons, the web manifest and the service worker. Needs, in each project:
// - package.json:     "build:itch": "node scripts/build-itch.js"
// - devDependencies:  @sveltejs/adapter-static
// - .gitignore:       /build-itch
// - svelte.config.js: when ITCH is set (to the output folder), a static build there, with no service worker:
//       import adapterStatic from '@sveltejs/adapter-static';
//       const itch = process.env.ITCH;
//       kit: { adapter: itch ? adapterStatic({ pages: itch, assets: itch }) : adapter, serviceWorker: { register: !itch } }
// - every page prerendered in itch builds, which run in Vite's 'itch' mode; in src/routes/+layout.js:
//       export const prerender = import.meta.env.MODE === 'itch';   (or just true)
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'build-itch';
const ZIP = 'bitch.zip';
// files and folders from static/ (plus SvelteKit's service worker) that itch doesn't need; missing ones are skipped
const DROP = [
	'android',
	'ios',
	'windows',
	'manifest.json',
	'manifest.webmanifest',
	'site.webmanifest',
	'browserconfig.xml',
	'service-worker.js'
];
// app-install head tags, whatever they point at
const META = /^(apple-mobile-web-app|mobile-web-app|msapplication)/;

fs.rmSync(OUT, { recursive: true, force: true });
execSync('npx vite build --mode itch', { stdio: 'inherit', env: { ...process.env, ITCH: OUT } });

for (const name of DROP) {
	fs.rmSync(path.join(OUT, name), { recursive: true, force: true });
}

// a tag goes if it names an app-install meta, or links to anything that was just dropped
const dropped = (url) => DROP.some((name) => url.replace(/^\.?\/?/, '').split(/[/?#]/)[0] === name);
const strip = (tag) => {
	const attr = (name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] ?? '';
	return META.test(attr('name')) || dropped(attr('href')) || dropped(attr('content'));
};

for (const file of fs.readdirSync(OUT).filter((f) => f.endsWith('.html'))) {
	const page = path.join(OUT, file);
	const html = fs
		.readFileSync(page, 'utf8')
		.replace(/[ \t]*<(link|meta)\b[^>]*>[ \t]*\r?\n?/g, (tag) => (strip(tag) ? '' : tag))
		// a hand-written service worker registration (SvelteKit's own is off, see svelte.config.js)
		.replace(/[ \t]*<script>(?:(?!<\/script>)[\s\S])*serviceWorker[\s\S]*?<\/script>[ \t]*\r?\n?/g, (script) =>
			script.includes('__sveltekit') ? script : ''
		)
		// comments on their own line in the head, which may label tags that are now gone
		.replace(/<head>[\s\S]*?<\/head>/, (head) => head.replace(/^[ \t]*<!--[\s\S]*?-->[ \t]*\r?\n/gm, ''));
	fs.writeFileSync(page, html);
}

// itch wants index.html at the top of the zip, not inside a folder.
// The top-level names are listed rather than '.', which would prefix every entry with './',
// and they're read before the zip is written, so it doesn't pack itself.
const top = fs
	.readdirSync(OUT)
	.map((name) => `"${name}"`)
	.join(' ');
if (process.platform === 'win32') {
	// Windows' own tar writes zips; Git Bash's GNU tar, which can come first on PATH, can't
	execSync(`"${process.env.SystemRoot}\\System32\\tar.exe" -a -cf ${OUT}/${ZIP} -C ${OUT} ${top}`, { stdio: 'inherit' });
} else {
	execSync(`cd ${OUT} && zip -qr ${ZIP} ${top}`, { stdio: 'inherit' });
}

console.log(`\nitch.io build ready: upload ${OUT}/${ZIP}`);
