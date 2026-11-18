<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AnimatedNumber from '@/components/shared/AnimatedNumber.vue';
import TypewriterText from '@/components/shared/TypewriterText.vue';
import MonthlySalesTable from '@/components/tables/MonthlySalesTable.vue';
import ProductTargetTable from '@/components/tables/ProductTargetTable.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormat } from '@/composables/useFormat';
import { toneText, yoyTone } from '@/lib/semantic';
import chainProducts from '@/mocks/chain-products.json';
import chains from '@/mocks/chains.json';
import { stores } from '@/routes/sales';
import type { MonthlyFigure, ProductTargetRow, SalesRow } from '@/types';

// Inertia passes shared props (errors, auth, locale…) that this page does not declare.
defineOptions({ inheritAttrs: false });

const { t } = useI18n();
const { int, percent } = useFormat();

const years = ['2026', '2025'] as const;
const year = ref<(typeof years)[number]>('2026');
const block = computed(() => chains.years[year.value]);

type ChainRow = {
    name: string;
    qty: number;
    amount: number;
    share: number;
    yoy: number | null;
    monthly: MonthlyFigure[];
};

const toRow = (row: ChainRow): SalesRow => ({
    key: row.name,
    label: row.name,
    qty: row.qty,
    amount: row.amount,
    share: row.share,
    yoy: row.yoy,
    monthly: row.monthly,
});

const rows = computed(() => block.value.rows.map(toRow));
const total = computed<SalesRow>(() => ({
    key: 'total',
    label: block.value.total.name ?? '',
    qty: block.value.total.qty,
    amount: block.value.total.amount,
    share: block.value.total.share,
    yoy: null,
    monthly: block.value.total.monthly,
}));

const kpis = computed(() => [
    {
        label: t('sales.kpi.qty'),
        value: block.value.total.qty,
        format: (n: number) => int(Math.round(n)),
    },
    {
        label: t('sales.kpi.amount'),
        value: block.value.total.amount,
        format: (n: number) =>
            `${int(Math.round(n))} ${t('sales.kpi.yenSuffix')}`,
    },
    {
        label: t('sales.kpi.yoyQty'),
        value: block.value.yoy.qty,
        format: (n: number) => percent(n),
        tone: yoyTone(block.value.yoy.qty),
    },
    {
        label: t('sales.kpi.yoyAmount'),
        value: block.value.yoy.amount,
        format: (n: number) => percent(n),
        tone: yoyTone(block.value.yoy.amount),
    },
]);

const products = chainProducts.rows as ProductTargetRow[];
const href = () => stores().url;
</script>

<template>
    <Head :title="t('sales.chains.title')" />

    <div class="mx-auto flex max-w-[1600px] flex-col gap-6">
        <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
                <div class="flex items-center gap-2">
                    <h1 class="text-2xl font-semibold tracking-tight">
                        <TypewriterText :text="t('sales.chains.title')" />
                    </h1>
                    <Badge variant="secondary">{{ t('sales.mock') }}</Badge>
                </div>
                <p class="text-sm text-muted-foreground">
                    {{ t('sales.chains.subtitle') }}
                </p>
            </div>

            <div class="flex items-center gap-2">
                <span class="text-sm text-muted-foreground">
                    {{ t('sales.chains.year') }}
                </span>
                <Button
                    v-for="y in years"
                    :key="y"
                    size="sm"
                    :variant="year === y ? 'default' : 'outline'"
                    @click="year = y"
                >
                    {{ y }}
                </Button>
            </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card v-for="kpi in kpis" :key="kpi.label" class="gap-2 py-4">
                <CardHeader class="px-5">
                    <CardTitle
                        class="text-sm font-medium text-muted-foreground"
                    >
                        {{ kpi.label }}
                    </CardTitle>
                </CardHeader>
                <CardContent class="px-5">
                    <div
                        class="text-2xl font-semibold tabular-nums"
                        :class="kpi.tone ? toneText[kpi.tone] : undefined"
                    >
                        <AnimatedNumber
                            :value="kpi.value"
                            :format="kpi.format"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>

        <section class="flex flex-col gap-3">
            <h2 class="text-lg font-medium">
                {{ t('sales.chains.chainsSection') }} ({{ year }})
            </h2>
            <MonthlySalesTable
                :months="chains.months"
                :rows="rows"
                :total="total"
                :label-header="t('sales.columns.chain')"
                :row-href="href"
            />
        </section>

        <section class="flex flex-col gap-3">
            <h2 class="text-lg font-medium">
                {{ t('sales.chains.targetSection') }}
            </h2>
            <ProductTargetTable :rows="products" />
        </section>
    </div>
</template>
