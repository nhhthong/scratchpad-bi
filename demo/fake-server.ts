// Runs the real frontend as one static HTML file, without Laravel. This is only the thin part the
// browser would normally get from the server: signing in, the language and which page to show.
// All BI data, filters, charts and the mock access control come from the app itself
// (resources/js/mocks, resources/js/composables), so the demo is the app.
import { http, router } from '@inertiajs/core';

const APP_NAME: string = import.meta.env.VITE_APP_NAME ?? 'BI';
const STORAGE_KEY = 'bi-demo-server-v1';
const FIRST_ACCOUNT = 'admin1@example.com';

type State = { email: string | null; locale: 'ja' | 'en' };

function load(): State {
    const fresh: State = { email: null, locale: 'ja' };

    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);

        return raw
            ? { ...fresh, ...(JSON.parse(raw) as Partial<State>) }
            : fresh;
    } catch {
        return fresh;
    }
}

const state = load();
const save = () => {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // storage unavailable: keep the state in memory only
    }
};

const PAGES: Record<string, string> = {
    '/login': 'auth/Login',
    '/forgot-password': 'auth/ForgotPassword',
    '/dashboard': 'sales/Chains',
    '/sales/stores': 'sales/Stores',
    '/sales/products': 'sales/Products',
    '/mypage': 'mypage/Index',
    '/admin/permissions': 'admin/Permissions',
};
const GUEST = new Set(['/login', '/forgot-password']);

let currentUrl = '/login';
let currentComponent = '';

function buildPage(rawUrl: string, errors: Record<string, string> = {}) {
    const url = new URL(
        rawUrl.replace(/^[a-z]+:\/\/[^/]*/i, '') || '/',
        'http://demo',
    );
    let path = url.pathname === '/' ? '/dashboard' : url.pathname;

    if (!(path in PAGES)) {
        path = '/dashboard';
    }

    if (!state.email && !GUEST.has(path)) {
        path = '/login';
    } else if (state.email && GUEST.has(path)) {
        path = '/dashboard';
    }

    const search = path === url.pathname ? url.search : '';

    currentUrl = path + search;
    currentComponent = PAGES[path];

    return {
        component: PAGES[path],
        url: currentUrl,
        version: null,
        props: {
            errors,
            name: APP_NAME,
            locale: state.locale,
            locales: ['ja', 'en'],
            auth: {
                user: state.email
                    ? {
                          id: 1,
                          name: state.email.split('@')[0],
                          email: state.email,
                          email_verified_at: '2026-01-01T00:00:00.000000Z',
                          two_factor_enabled: false,
                          created_at: '2026-01-01T00:00:00.000000Z',
                          updated_at: '2026-01-01T00:00:00.000000Z',
                      }
                    : null,
            },
            sidebarOpen: true,
        },
    };
}

function readData(data: unknown): Record<string, unknown> {
    if (data instanceof FormData) {
        return Object.fromEntries(data.entries());
    }

    if (typeof data === 'string') {
        try {
            return JSON.parse(data) as Record<string, unknown>;
        } catch {
            return Object.fromEntries(new URLSearchParams(data));
        }
    }

    return data && typeof data === 'object'
        ? (data as Record<string, unknown>)
        : {};
}

http.setClient({
    async request(config: {
        method: string;
        url: string;
        data?: unknown;
        params?: Record<string, unknown>;
    }) {
        await new Promise((resolve) => setTimeout(resolve, 80));

        const method = config.method.toUpperCase();
        const full = new URL(
            config.url.replace(/^[a-z]+:\/\/[^/]*/i, '') || '/',
            'http://demo',
        );

        for (const [key, value] of Object.entries(config.params ?? {})) {
            full.searchParams.set(key, String(value));
        }

        let target = full.pathname + full.search;

        if (method !== 'GET') {
            const body = readData(config.data);

            if (full.pathname === '/login') {
                // Any email signs in (no password check); the first account is the super admin.
                state.email =
                    (typeof body.email === 'string' ? body.email.trim() : '') ||
                    FIRST_ACCOUNT;
                target = '/dashboard';
            } else if (full.pathname === '/logout') {
                state.email = null;
                target = '/login';
            } else if (full.pathname === '/locale') {
                state.locale = body.locale === 'en' ? 'en' : 'ja';
                target = currentUrl;
            } else {
                target = currentUrl;
            }

            save();
        }

        return {
            status: 200,
            data: JSON.stringify(buildPage(target)),
            headers: {
                'x-inertia': 'true',
                'content-type': 'application/json',
                vary: 'X-Inertia',
            },
        };
    },
});

// file:// pages cannot pushState to "/dashboard", and a static host has no such path:
// keep the real location fixed and store the Inertia URL in the hash instead.
// Inertia passes either "/path" or an absolute URL such as "file:///path#hash".
function toHash(
    url: string | URL | null | undefined,
): string | URL | null | undefined {
    if (typeof url !== 'string' || url.startsWith('#')) {
        return url;
    }

    let path = url;

    if (!url.startsWith('/')) {
        try {
            const parsed = new URL(url);

            path = parsed.pathname + parsed.search;
        } catch {
            return url;
        }
    }

    // Inertia appends the current hash to the URL; drop it so the hash is not repeated.
    return `#${path.split('#')[0]}`;
}

for (const method of ['pushState', 'replaceState'] as const) {
    const original = history[method].bind(history);

    history[method] = (
        data: unknown,
        unused: string,
        url?: string | URL | null,
    ) => original(data, unused, toHash(url));
}

// Initial page, normally rendered by the server into the root view.
const initial = buildPage(location.hash.replace(/^#/, '') || '/');
const script = document.createElement('script');

script.type = 'application/json';
script.dataset.page = 'app';
script.textContent = JSON.stringify(initial);
document.body.prepend(script);
history.replaceState(null, '', `#${initial.url}`);

// One click signs in as the first account (super admin).
const enter = document.createElement('button');

enter.type = 'button';
enter.setAttribute('data-test', 'demo-login');
enter.style.cssText =
    'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;padding:10px 18px;' +
    'border:0;border-radius:9999px;background:#4f46e5;color:#fff;font:600 13px system-ui,sans-serif;' +
    'box-shadow:0 6px 20px rgba(79,70,229,.35);cursor:pointer;display:none';
enter.addEventListener('click', () => {
    router.post('/login', { email: FIRST_ACCOUNT });
});
document.body.append(enter);

const syncButton = () => {
    enter.textContent =
        state.locale === 'ja'
            ? 'デモに入る（自動ログイン）'
            : 'Enter demo (sign in automatically)';
    enter.style.display = currentComponent === 'auth/Login' ? 'block' : 'none';
};

router.on('navigate', syncButton);
syncButton();
setTimeout(syncButton, 400);

// Pre-fill the login form so it looks like a real session. Native setter + input event keep Vue in sync.
const fillLogin = () => {
    for (const [id, value] of Object.entries({
        email: FIRST_ACCOUNT,
        password: 'demo-password',
    })) {
        const input = document.getElementById(id) as HTMLInputElement | null;

        if (!input || input.dataset.demoFilled) {
            continue;
        }

        input.dataset.demoFilled = '1';
        Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value',
        )?.set?.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
};

new MutationObserver(fillLogin).observe(document.body, {
    childList: true,
    subtree: true,
});
fillLogin();

// Test hook: lets an automated browser open a screen without clicking through the menu.
window.addEventListener('demo-visit', (event) => {
    router.visit((event as CustomEvent<string>).detail);
});
