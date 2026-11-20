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
import { level3 } from '@/mocks/salesCube';
import { products, stores } from '@/routes/sales';

// Inertia passes shared props (errors, auth, locale…) that this page does not declare.
defineOptions({ inheritAttrs: false });

useLevelGuard(3);

const { t } = useI18n();
const { current } = useMockSession();
const { params, parsed, filters, period, change, reset } = useSalesFilters(
    products().url,
);

// Chain and store come from the URL; the data layer limits them to what the user may see.
const data = computed(() =>
    level3(
        current.value.scope,
        parsed.value,
        params.value.get('chain'),
        params.value.get('store'),
    ),
);
const chainId = computed(() => data.value.chain?.id);
const storeId = computed(() => data.value.store?.id);
const total = computed(() => ({
    ...data.value.total,
    label: data.value.store?.name ?? t('sales.columns.total'),
    sub: '',
}));
const back = computed(() =>
    current.value.levels.includes(2)
        ? `${stores().url}${query({ chain: chainId.value, ...period() })}`
        : null,
);
</script>

<template>
    <Head :title="t('sales.products.title')" />

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
                    {{ t('sales.products.back') }}
                </Link>
            </Button>
            <div class="flex items-center gap-2">
                <h1 class="text-xl font-semibold tracking-tight">
                    {{ t('sales.products.title') }}
                </h1>
                <Badge variant="secondary">{{ t('sales.mock') }}</Badge>
            </div>
            <p class="text-sm text-muted-foreground">
                {{
                    t('sales.products.subtitle', {
                        store: data.store?.name ?? '',
                    })
                }}
            </p>
        </div>

        <SalesFilterBar
            :filters="filters"
            :chains="data.chains"
            :chain="chainId"
            :stores="data.stores"
            :store="storeId"
            :search-placeholder="t('bi.filter.searchProduct')"
            @change="
                (patch) => change(patch, { chain: chainId, store: storeId })
            "
            @reset="
                reset({ chain: chainId, store: storeId, year: filters.year })
            "
        />
        <SalesInsights
            :kpi="data.kpi"
            :chart="data.chart"
            :year="filters.year"
            :share-title="t('bi.chart.shareProduct')"
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
                :label-header="t('sales.columns.type')"
                :sub-label-header="t('sales.columns.spec')"
                :yoy-header="data.yoyHeader"
            />
        </div>
    </div>
</template>
