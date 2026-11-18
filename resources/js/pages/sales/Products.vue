<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { ArrowLeft } from '@lucide/vue';
import { useI18n } from 'vue-i18n';
import MonthlySalesTable from '@/components/tables/MonthlySalesTable.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import storeProducts from '@/mocks/store-products.json';
import { stores } from '@/routes/sales';
import type { SalesRow } from '@/types';

// Inertia passes shared props (errors, auth, locale…) that this page does not declare.
defineOptions({ inheritAttrs: false });

const { t } = useI18n();

const rows: SalesRow[] = storeProducts.rows.map((row, index) => ({
    key: `${row.type}-${row.spec}-${index}`,
    label: row.type,
    sub: row.spec,
    qty: row.qty,
    amount: row.amount,
    share: row.share,
    yoy: row.yoy,
    monthly: row.monthly,
}));

const total: SalesRow = {
    key: 'total',
    label: storeProducts.store,
    sub: '',
    qty: storeProducts.total.qty,
    amount: storeProducts.total.amount,
    share: 1,
    yoy: null,
    monthly: storeProducts.total.monthly,
};
</script>

<template>
    <Head :title="t('sales.products.title')" />

    <div class="mx-auto flex max-w-[1600px] flex-col gap-6">
        <div class="flex flex-col gap-2">
            <Button variant="ghost" size="sm" class="-ml-2 w-fit" as-child>
                <Link :href="stores()">
                    <ArrowLeft />
                    {{ t('sales.products.back') }}
                </Link>
            </Button>
            <div class="flex items-center gap-2">
                <h1 class="text-2xl font-semibold tracking-tight">
                    {{ t('sales.products.title') }}
                </h1>
                <Badge variant="secondary">{{ t('sales.mock') }}</Badge>
            </div>
            <p class="text-sm text-muted-foreground">
                {{
                    t('sales.products.subtitle', { store: storeProducts.store })
                }}
            </p>
        </div>

        <MonthlySalesTable
            :months="storeProducts.months"
            :rows="rows"
            :total="total"
            :label-header="t('sales.columns.type')"
            :sub-label-header="t('sales.columns.spec')"
        />
    </div>
</template>
