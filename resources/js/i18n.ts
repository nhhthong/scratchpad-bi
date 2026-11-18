import { router } from '@inertiajs/vue3';
import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';
import ja from '@/locales/ja.json';

export type Locale = 'ja' | 'en';

export const i18n = createI18n({
    legacy: false,
    locale: 'ja',
    fallbackLocale: 'en',
    messages: { ja, en },
});

export function setLocale(locale: string): void {
    i18n.global.locale.value = locale === 'en' ? 'en' : 'ja';
    if (typeof document !== 'undefined') {
        document.documentElement.lang = locale;
    }
}

// Keep the UI locale in sync with the `locale` prop the server shares on every visit.
// `success` fires after every visit (including same-URL ones such as the language switch);
// `navigate` also covers history back/forward.
export function initializeLocale(): void {
    const sync = (page: { props: Record<string, unknown> }) =>
        setLocale(
            typeof page.props.locale === 'string' ? page.props.locale : 'ja',
        );

    router.on('success', (event) => sync(event.detail.page));
    router.on('navigate', (event) => sync(event.detail.page));
}
