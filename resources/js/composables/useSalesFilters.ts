import { router, usePage } from '@inertiajs/vue3';
import { computed, onMounted, watchEffect } from 'vue';
import { useMockSession } from '@/composables/useMockSession';
import { LAST_MONTH, normalizeFilters } from '@/mocks/salesCube';
import type { Level } from '@/mocks/salesCube';

type Params = Record<string, string | number | null | undefined>;

export function query(params: Params): string {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined && value !== '') {
            search.set(key, String(value));
        }
    }

    const text = search.toString();

    return text ? `?${text}` : '';
}

// Filters live in the query string, so reload and back/forward keep them.
// Months are 1-based in the URL and in the UI, 0-based inside the mock data.
export function useSalesFilters(path: string) {
    const page = usePage();
    const { prefs } = useMockSession();

    const params = computed(
        () => new URLSearchParams(page.url.split('?')[1] ?? ''),
    );
    const parsed = computed(() =>
        normalizeFilters(params.value, prefs.defaultYear),
    );
    const filters = computed(() => ({
        year: parsed.value.year,
        from: parsed.value.from + 1,
        to: parsed.value.to + 1,
        q: parsed.value.q,
        lastMonth: (parsed.value.year === 2026 ? LAST_MONTH : 11) + 1,
    }));

    const go = (next: Params) =>
        router.get(
            path,
            Object.fromEntries(
                Object.entries(next).filter(
                    ([, value]) =>
                        value !== null && value !== undefined && value !== '',
                ),
            ),
            { preserveState: true, preserveScroll: true, replace: true },
        );

    const period = () => ({
        year: filters.value.year,
        from: filters.value.from,
        to: filters.value.to,
    });

    return {
        params,
        parsed,
        filters,
        period,
        change: (patch: Params, base: Params = {}) =>
            go({ ...base, ...period(), q: filters.value.q, ...patch }),
        reset: (keep: Params) => go(keep),
    };
}

// Send the user to their own first screen when the display level is not allowed for them.
// Runs after mount, in the browser only.
export function useLevelGuard(level: Level) {
    const { current, access } = useMockSession();

    onMounted(() => {
        watchEffect(() => {
            if (!current.value.levels.includes(level)) {
                router.visit(access.value.home, { replace: true });
            }
        });
    });
}

export function useAdminGuard() {
    const { access } = useMockSession();

    onMounted(() => {
        watchEffect(() => {
            if (!access.value.canManageUsers) {
                router.visit(access.value.home, { replace: true });
            }
        });
    });
}
