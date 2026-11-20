// Builds the demo bundle (see demo/). The result is inlined into one HTML file by demo/inline.mjs.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import inertia from '@inertiajs/vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';

// DEMO_BRAND=original: use the original logo, favicon, app name and real mock names from demo/.brand
// (kept out of git). Default: generic mock branding that is safe to share publicly.
const ORIGINAL = process.env.DEMO_BRAND === 'original';
const APP_NAME = ORIGINAL ? 'BI YGK' : 'Scratchpad BI';
const LOGO = ORIGINAL ? 'demo/.brand/logo.png' : 'public/images/logo.png';
const FAVICON = ORIGINAL ? 'demo/.brand/favicon.svg' : 'public/favicon.svg';

const dataUri = (file: string, mime: string) =>
    `data:${mime};base64,${readFileSync(resolve(file)).toString('base64')}`;

// The demo may be shared outside the team: replace real-looking names with generic ones at build time.
// Numbers and structure stay the same; the files in resources/js/mocks are not modified.
type Mock = Record<string, any>;
const readMock = (name: string): Mock =>
    JSON.parse(
        readFileSync(resolve(`resources/js/mocks/${name}.json`), 'utf8'),
    );

function anonymize(name: string, data: Mock): Mock {
    const pad = (n: number, w = 2) => String(n).padStart(w, '0');
    if (name === 'chains') {
        const keep: Record<string, string> = {
            OEM: 'OEM',
            チェーン以外イガイ: 'Non-chain',
            海外カイガイ: 'Overseas',
        };
        const map: Record<string, string> = {};
        let i = 0;
        for (const r of data.years['2026'].rows)
            map[r.name] = keep[r.name] ?? `Chain ${pad(++i)}`;
        for (const y of Object.values<Mock>(data.years))
            for (const r of y.rows) r.name = map[r.name] ?? r.name;
    } else if (name === 'stores') {
        data.chain = 'Sample Chain';
        data.rows.forEach(
            (r: Mock, k: number) => (r.name = `Store ${pad(k + 1)}`),
        );
    } else if (name === 'store-products') {
        const stores = readMock('stores').rows.map((r: Mock) => r.name);
        data.store = `Store ${pad(Math.max(stores.indexOf(data.store), 0) + 1)}`;
        const types = new Map<string, string>();
        const specs = new Map<string, string>();
        for (const r of data.rows) {
            if (!types.has(r.type))
                types.set(
                    r.type,
                    `Type ${String.fromCharCode(65 + types.size)}`,
                );
            if (!specs.has(r.spec)) specs.set(r.spec, `Spec ${specs.size + 1}`);
            r.type = types.get(r.type);
            r.spec = specs.get(r.spec);
        }
    } else if (name === 'chain-products') {
        data.rows.forEach(
            (r: Mock, k: number) => (r.name = `Product ${pad(k + 1, 3)}`),
        );
    }
    return data;
}

export default defineConfig({
    publicDir: false,
    resolve: { alias: { '@': resolve('resources/js') } },
    define: {
        'import.meta.env.VITE_APP_NAME': JSON.stringify(APP_NAME),
        'import.meta.env.VITE_ORG_NAME': JSON.stringify(
            ORIGINAL ? 'YGK' : 'HQ',
        ),
    },
    plugins: [
        {
            // The logo is referenced by an absolute public path, which does not exist in a single file.
            name: 'demo-inline-assets',
            enforce: 'pre',
            transform(code, id) {
                const mock = id.match(/resources\/js\/mocks\/([\w-]+)\.json$/);
                if (mock) {
                    return ORIGINAL
                        ? code
                        : JSON.stringify(anonymize(mock[1], JSON.parse(code)));
                }
                if (id.endsWith('AppLogoImage.vue')) {
                    return code.replace(
                        'src="/images/logo.png"',
                        `src="${dataUri(LOGO, 'image/png')}"`,
                    );
                }
            },
            transformIndexHtml(html) {
                return html
                    .replace('__FAVICON__', dataUri(FAVICON, 'image/svg+xml'))
                    .replace(
                        '<title>Scratchpad BI</title>',
                        `<title>${APP_NAME}</title>`,
                    );
            },
        },
        inertia(),
        tailwindcss(),
        vue({
            template: {
                transformAssetUrls: { base: null, includeAbsolute: false },
            },
        }),
    ],
    build: {
        outDir: 'demo/dist',
        emptyOutDir: true,
        assetsInlineLimit: 100_000_000,
        cssCodeSplit: false,
        chunkSizeWarningLimit: 10_000,
        rollupOptions: {
            input: resolve('demo/index.html'),
            output: { codeSplitting: false },
        },
    },
});
