<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { ArrowLeft } from '@lucide/vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import MonthlySalesTable from '@/components/tables/MonthlySalesTable.vue';
import SalesFilterBar from '@/components/tables/SalesFilterBar.vue';
import SalesInsights from '@/components/tables/SalesInsights.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMockSession } from '@/composables/useMockSession';
import {
    query,
    useLevelGuard,
    useSalesFilters,
} from '@/composables/useSalesFilters';
import { level2 } from '@/mocks/salesCube';
import { dashboard } from '@/routes';
import { products, stores } from '@/routes/sales';

// Inertia passes shared props (errors, auth, locale…) that this page does not declare.
defineOptions({ inheritAttrs: false });

useLevelGuard(2);

const { t } = useI18n();
const { current } = useMockSession();
const { params, parsed, filters, period, change, reset } = useSalesFilters(
    stores().url,
);

// The chain comes from the URL; the data layer limits it to the chains the user may see.
const data = computed(() =>
    level2(current.value.scope, parsed.value, params.value.get('chain')),
);
const chainId = computed(() => data.value.chain?.id);
const total = computed(() => ({
    ...data.value.total,
    label: data.value.chain?.name ?? t('sales.columns.total'),
}));

// Drill down to the products of a store, keeping the period; only for users allowed to open level 3.
const href = (row: { key: string }) =>
    current.value.levels.includes(3)
        ? `${products().url}${query({ chain: chainId.value, store: row.key, ...period() })}`
        : null;
const back = computed(() =>
    current.value.levels.includes(1)
        ? `${dashboard().url}${query(period())}`
        : null,
);
</script>

<template>
    <Head :title="t('sales.stores.title')" />

    <div class="flex min-h-full flex-col gap-2">
        <div class="flex flex-col gap-1">
            <Button
                v-if="back"
                variant="ghost"
                size="sm"
                class="-ml-2 w-fit"
                as-child
            >
                <Link :href="back">
                    <ArrowLeft />
                    {{ t('sales.stores.back') }}
                </Link>
            </Button>
            <div class="flex items-center gap-2">
                <h1 class="text-xl font-semibold tracking-tight">
                    {{ t('sales.stores.title') }}
                </h1>
                <Badge variant="secondary">{{ t('sales.mock') }}</Badge>
            </div>
            <p class="text-sm text-muted-foreground">
                {{
                    t('sales.stores.subtitle', {
                        chain: data.chain?.name ?? '',
                    })
                }}
            </p>
        </div>

        <SalesFilterBar
            :filters="filters"
            :chains="data.chains"
            :chain="chainId"
            :search-placeholder="t('bi.filter.searchStore')"
            @change="(patch) => change(patch, { chain: chainId })"
            @reset="reset({ chain: chainId, year: filters.year })"
        />
        <SalesInsights
            :kpi="data.kpi"
            :chart="data.chart"
            :year="filters.year"
            :share-title="t('bi.chart.shareStore')"
        />

        <p
            v-if="!data.rows.length"
            class="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground"
        >
            {{ t('bi.empty') }}
        </p>
        <div v-else class="flex h-[72vh] min-h-72 flex-col">
            <MonthlySalesTable
                :months="data.months"
                :rows="data.rows"
                :total="total"
                :label-header="t('sales.columns.store')"
                :row-href="href"
                :yoy-header="data.yoyHeader"
            />
        </div>
    </div>
</template>
