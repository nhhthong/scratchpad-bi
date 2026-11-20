import { usePage } from '@inertiajs/vue3';
import { computed, onMounted, reactive, watch } from 'vue';
import { scopeLabel } from '@/mocks/salesCube';
import { ROLE_PRESETS, capabilities, homeFor, seedUsers } from '@/mocks/users';
import type { MockUser } from '@/mocks/users';

// Mock access control for the BI screens, until a real backend provides roles.
// Who is signed in comes from Fortify (the real session); the mock role, data scope and display
// levels come from a list of mock users matched by email. An account that is not in the list
// (or an inactive one) is treated as the super admin.
// Edits to users and preferences live in this browser (localStorage) only. The saved copy is
// applied after mount: server-rendered HTML and the first client render must both use the seed.
type Persisted = {
    users: MockUser[];
    prefs: { defaultYear: 2025 | 2026 };
};

const KEY = 'bi-mock-session-v2';

const state = reactive<Persisted>({
    users: seedUsers(),
    prefs: { defaultYear: 2026 },
});

let restored = false;

function restore(): void {
    restored = true;

    try {
        const raw = localStorage.getItem(KEY);
        const saved = raw ? (JSON.parse(raw) as Partial<Persisted>) : null;

        if (saved?.users?.length) {
            state.users = saved.users;
        }

        if (saved?.prefs) {
            Object.assign(state.prefs, saved.prefs);
        }
    } catch {
        // storage unavailable or invalid: keep the seed
    }
}

watch(
    state,
    (value) => {
        if (!restored) {
            return;
        }

        try {
            localStorage.setItem(KEY, JSON.stringify(value));
        } catch {
            // storage unavailable: keep the changes in memory only
        }
    },
    { deep: true },
);

export function useMockSession() {
    onMounted(() => {
        if (!restored) {
            restore();
        }
    });

    const page = usePage();
    const email = computed(() => page.props.auth.user?.email ?? '');

    const current = computed<MockUser>(
        () =>
            state.users.find((u) => u.email === email.value && u.active) ??
            state.users.find((u) => u.role === 'admin' && u.active) ??
            state.users[0],
    );

    const access = computed(() => ({
        ...capabilities(current.value),
        home: homeFor(current.value),
    }));

    return {
        users: computed(() => state.users),
        prefs: state.prefs,
        current,
        access,
        scopeName: (user: MockUser, all: string) => scopeLabel(user.scope, all),
        saveUser(patch: Omit<MockUser, 'id' | 'org'>, id?: string) {
            const existing = id
                ? state.users.find((u) => u.id === id)
                : undefined;
            const org = ROLE_PRESETS[patch.role].org;

            if (existing) {
                Object.assign(existing, patch, { org });
            } else {
                state.users.push({ id: `u${Date.now()}`, ...patch, org });
            }
        },
        updateProfile(name: string, address: string) {
            current.value.name = name.trim() || current.value.name;
            current.value.email = address.trim() || current.value.email;
        },
        setDefaultYear(year: 2025 | 2026) {
            state.prefs.defaultYear = year;
        },
    };
}
