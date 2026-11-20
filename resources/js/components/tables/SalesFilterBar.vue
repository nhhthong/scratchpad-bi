<script setup lang="ts">
// filters shared by the three sales levels. Every change re-queries the "server".
import { RotateCcw, Search } from '@lucide/vue';
import { onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import SegmentedControl from '@/components/shared/SegmentedControl.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useFormat } from '@/composables/useFormat';

type Option = { id: string; name: string };

const props = defineProps<{
    filters: {
        year: number;
        from: number;
        to: number;
        q: string;
        lastMonth: number;
    };
    chains?: Option[];
    chain?: string | null;
    stores?: Option[];
    store?: string | null;
    searchPlaceholder?: string;
}>();
const emit = defineEmits<{
    change: [patch: Record<string, string | number | null>];
    reset: [];
}>();

const { t } = useI18n();
const { month } = useFormat();

const monthOptions = (year: number) =>
    Array.from({ length: props.filters.lastMonth }, (_, i) => ({
        value: String(i + 1),
        label: month(`${year}-${String(i + 1).padStart(2, '0')}`),
    }));

const q = ref(props.filters.q);
watch(
    () => props.filters.q,
    (v) => (q.value = v),
);
let timer: ReturnType<typeof setTimeout> | undefined;
function onSearch(value: string | number) {
    q.value = String(value);
    clearTimeout(timer);
    timer = setTimeout(() => emit('change', { q: q.value || null }), 300);
}
onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
    <div
        class="flex flex-wrap items-end gap-x-4 gap-y-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-sm"
        data-test="filter-bar"
    >
        <div v-if="chains && chains.length > 1" class="flex flex-col gap-1">
            <span class="text-xs text-muted-foreground">{{
                t('sales.columns.chain')
            }}</span>
            <Select
                :model-value="chain ?? undefined"
                @update:model-value="
                    (v) => emit('change', { chain: String(v), store: null })
                "
            >
                <SelectTrigger size="sm" class="w-48" data-test="filter-chain"
                    ><SelectValue
                /></SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="c in chains" :key="c.id" :value="c.id">{{
                        c.name
                    }}</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div v-if="stores && stores.length > 1" class="flex flex-col gap-1">
            <span class="text-xs text-muted-foreground">{{
                t('sales.columns.store')
            }}</span>
            <Select
                :model-value="store ?? undefined"
                @update:model-value="
                    (v) => emit('change', { store: String(v) })
                "
            >
                <SelectTrigger size="sm" class="w-56" data-test="filter-store"
                    ><SelectValue
                /></SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="s in stores" :key="s.id" :value="s.id">{{
                        s.name
                    }}</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div class="flex flex-col gap-1">
            <span class="text-xs text-muted-foreground">{{
                t('sales.chains.year')
            }}</span>
            <SegmentedControl
                :model-value="String(filters.year)"
                :aria-label="t('sales.chains.year')"
                :options="[
                    { value: '2026', label: '2026' },
                    { value: '2025', label: '2025' },
                ]"
                @update:model-value="
                    (v) => emit('change', { year: v, from: null, to: null })
                "
            />
        </div>

        <div class="flex flex-col gap-1">
            <span class="text-xs text-muted-foreground">{{
                t('bi.filter.period')
            }}</span>
            <div class="flex items-center gap-1.5">
                <Select
                    :model-value="String(filters.from)"
                    @update:model-value="
                        (v) => emit('change', { from: String(v) })
                    "
                >
                    <SelectTrigger
                        size="sm"
                        class="w-24"
                        data-test="filter-from"
                        ><SelectValue
                    /></SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="m in monthOptions(filters.year)"
                            :key="m.value"
                            :value="m.value"
                            >{{ m.label }}</SelectItem
                        >
                    </SelectContent>
                </Select>
                <span class="text-muted-foreground">〜</span>
                <Select
                    :model-value="String(filters.to)"
                    @update:model-value="
                        (v) => emit('change', { to: String(v) })
                    "
                >
                    <SelectTrigger size="sm" class="w-24" data-test="filter-to"
                        ><SelectValue
                    /></SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="m in monthOptions(filters.year)"
                            :key="m.value"
                            :value="m.value"
                            >{{ m.label }}</SelectItem
                        >
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div v-if="searchPlaceholder" class="flex flex-col gap-1">
            <span class="text-xs text-muted-foreground">{{
                t('bi.filter.search')
            }}</span>
            <div class="relative">
                <Search
                    class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    :model-value="q"
                    :placeholder="searchPlaceholder"
                    class="h-8 w-52 pl-8 text-sm"
                    data-test="filter-search"
                    @update:model-value="onSearch"
                />
            </div>
        </div>

        <Button
            variant="ghost"
            size="sm"
            class="ml-auto text-muted-foreground"
            data-test="filter-reset"
            @click="emit('reset')"
        >
            <RotateCcw class="size-3.5" />
            {{ t('bi.filter.reset') }}
        </Button>
    </div>
</template>
