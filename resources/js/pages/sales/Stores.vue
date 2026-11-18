<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { ArrowLeft } from '@lucide/vue';
import { useI18n } from 'vue-i18n';
import MonthlySalesTable from '@/components/tables/MonthlySalesTable.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import stores from '@/mocks/stores.json';
import { dashboard } from '@/routes';
import { products } from '@/routes/sales';
import type { SalesRow } from '@/types';

// Inertia passes shared props (errors, auth, locale…) that this page does not declare.
defineOptions({ inheritAttrs: false });

const { t } = useI18n();

const rows: SalesRow[] = stores.rows.map((row) => ({
    key: row.name ?? '',
    label: row.name ?? '',
    qty: row.qty,
    amount: row.amount,
    share: row.share,
    yoy: row.yoy,
    monthly: row.monthly,
}));

const total: SalesRow = {
    key: 'total',
    label: stores.total.name,
    qty: stores.total.qty,
    amount: stores.total.amount,
    share: stores.total.share,
    yoy: null,
    monthly: stores.total.monthly,
};

const href = () => products().url;
</script>

<template>
    <Head :title="t('sales.stores.title')" />

    <div class="flex h-full min-h-0 flex-col gap-4">
        <div class="flex flex-col gap-2">
            <Button variant="ghost" size="sm" class="-ml-2 w-fit" as-child>
                <Link :href="dashboard()">
                    <ArrowLeft />
                    {{ t('sales.stores.back') }}
                </Link>
            </Button>
            <div class="flex items-center gap-2">
                <h1 class="text-2xl font-semibold tracking-tight">
                    {{ t('sales.stores.title') }}
                </h1>
                <Badge variant="secondary">{{ t('sales.mock') }}</Badge>
            </div>
            <p class="text-sm text-muted-foreground">
                {{ t('sales.stores.subtitle', { chain: stores.chain }) }}
            </p>
        </div>

        <MonthlySalesTable
            :months="stores.months"
            :rows="rows"
            :total="total"
            :label-header="t('sales.columns.store')"
            :row-href="href"
        />
    </div>
</template>
