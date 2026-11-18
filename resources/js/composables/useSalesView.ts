import { onMounted, ref, watch } from 'vue';

export type Metric = 'amount' | 'qty' | 'both';
export type Unit = 'yen' | 'thousand' | 'million';

type View = { metric: Metric; unit: Unit };

const KEY = 'sales-view';
const defaults: View = { metric: 'amount', unit: 'thousand' };

// Shared by all sales tables so the choice sticks while moving between screens.
// It starts at the defaults on server and client alike: reading localStorage while
// the module loads would make the first client render differ from the server HTML
// (hydration mismatch). The saved choice is applied once the page has mounted.
const view = ref<View>({ ...defaults });
let restored = false;

function restore(): void {
    restored = true;

    try {
        const raw = localStorage.getItem(KEY);

        if (raw) {
            view.value = { ...defaults, ...(JSON.parse(raw) as Partial<View>) };
        }
    } catch {
        // storage unavailable or invalid: keep the defaults
    }
}

watch(
    view,
    (value) => {
        if (!restored) {
            return;
        }

        try {
            localStorage.setItem(KEY, JSON.stringify(value));
        } catch {
            // storage unavailable: keep the choice in memory only
        }
    },
    { deep: true },
);

export function useSalesView() {
    onMounted(() => {
        if (!restored) {
            restore();
        }
    });

    return view;
}
