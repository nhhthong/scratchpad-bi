// Inlines the built JS and CSS into a single self-contained HTML file.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'demo/dist';
const out = process.argv[2] ?? join(dist, 'scratchpad-bi-demo.html');
let html = readFileSync(join(dist, 'demo/index.html'), 'utf8');

const read = (ref) =>
    readFileSync(join(dist, ref.replace(/^\.?\/+/, '')), 'utf8');

html = html.replace(/<link rel="modulepreload"[^>]*>/g, '');
// Replacement functions (not strings) so "$&" sequences in the bundles stay literal.
const css = [
    ...html.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g),
];
for (const [tag, href] of css)
    html = html.replace(tag, () => `<style>${read(href)}</style>`);

const scripts = [
    ...html.matchAll(
        /<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g,
    ),
];
for (const [tag, src] of scripts) {
    const js = read(src).replace(/<\/script/gi, '<\\/script');
    // Drop the tag here and re-add at the end of <body> so the DOM exists first.
    html = html
        .replace(tag, () => '')
        .replace(
            '</body>',
            () => `<script type="module">${js}</script></body>`,
        );
}

writeFileSync(out, html);
console.log(out, `${Math.round(Buffer.byteLength(html) / 1024)} KiB`);
