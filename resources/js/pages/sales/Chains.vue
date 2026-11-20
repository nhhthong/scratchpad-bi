<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AnimatedNumber from '@/components/shared/AnimatedNumber.vue';
import MonthlySalesTable from '@/components/tables/MonthlySalesTable.vue';
import ProductTargetTable from '@/components/tables/ProductTargetTable.vue';
import SalesFilterBar from '@/components/tables/SalesFilterBar.vue';
import SalesInsights from '@/components/tables/SalesInsights.vue';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFormat } from '@/composables/useFormat';
import { useMockSession } from '@/composables/useMockSession';
import {
    query,
    useLevelGuard,
    useSalesFilters,
} from '@/composables/useSalesFilters';
import { achievementTone, toneText } from '@/lib/semantic';
import { level1 } from '@/mocks/salesCube';
import { dashboard } from '@/routes';
import { stores } from '@/routes/sales';

// Inertia passes shared props (errors, auth, locale…) that this page does not declare.
defineOptions({ inheritAttrs: false });

useLevelGuard(1);

const { t } = useI18n();
const { amount, percent } = useFormat();
const { current, access } = useMockSession();
const { parsed, filters, change, reset } = useSalesFilters(dashboard().url);

const tab = ref<'oem' | 'target'>('oem');
const data = computed(() => level1(current.value.scope, parsed.value));
const total = computed(() => ({
    ...data.value.total,
    label: t('sales.columns.total'),
}));
const targetTotal = computed(() => ({
    ...data.value.targets.total,
    name: t('sales.columns.total'),
}));
const months2026 = Array.from(
    { length: 12 },
    (_, i) => `2026-${String(i + 1).padStart(2, '0')}`,
);

// Drill down to the stores of a chain, keeping the period; only for users allowed to open level 2.
const href = (row: { key: string }) =>
    current.value.levels.includes(2)
        ? `${stores().url}${query({
              chain: row.key,
              year: filters.value.year,
              from: filters.value.from,
              to: filters.value.to,
          })}`
        : null;

const summary = computed(() => {
    const s = data.value.targets.summary;

    return [
        {
            label: t('bi.target.summaryTarget'),
            value: s.targetAmount,
            format: (n: number) => amount(n, 'yen'),
            tone: undefined,
        },
        {
            label: t('bi.target.summaryActual'),
            value: s.actualAmount,
            format: (n: number) => amount(n, 'yen'),
            tone: undefined,
        },
        {
            label: t('bi.target.summaryAchievement'),
            value: s.achievement ?? 0,
            format: (n: number) => percent(n),
            tone: achievementTone(s.achievement),
        },
    ];
});
</script>

<template>
    <Head :title="t('sales.chains.title')" />

    <div class="flex min-h-full flex-col gap-2">
        <div>
            <div class="flex items-center gap-2">
                <h1 class="text-xl font-semibold tracking-tight">
                    {{ t('sales.chains.title') }}
                </h1>
                <Badge variant="secondary">{{ t('sales.mock') }}</Badge>
            </div>
            <p class="text-sm text-muted-foreground">
                {{ t('sales.chains.subtitle') }}
            </p>
        </div>

        <Tabs v-model="tab" class="gap-2">
            <TabsList class="h-auto self-start">
                <TabsTrigger value="oem" class="px-4 py-2">
                    <span class="flex flex-col items-start leading-tight">
                        <span>{{ t('sales.tabs.oem') }}</span>
                        <span
                            class="text-[11px] font-normal text-muted-foreground"
                        >
                            {{ t('sales.tabs.oemHint') }}
                        </span>
                    </span>
                </TabsTrigger>
                <TabsTrigger value="target" class="px-4 py-2">
                    <span class="flex flex-col items-start leading-tight">
                        <span>{{ t('sales.tabs.target') }}</span>
                        <span
                            class="text-[11px] font-normal text-muted-foreground"
                        >
                            {{ t('sales.tabs.targetHint') }}
                        </span>
                    </span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="oem" class="flex flex-col gap-2">
                <SalesFilterBar
                    :filters="filters"
                    :search-placeholder="t('bi.filter.searchChain')"
                    @change="(patch) => change(patch)"
                    @reset="reset({ year: filters.year })"
                />
                <SalesInsights
                    :kpi="data.kpi"
                    :chart="data.chart"
                    :year="filters.year"
                    :share-title="t('bi.chart.shareChain')"
                />

                <section class="flex flex-col gap-1.5">
                    <h2 class="text-sm font-medium">
                        {{ t('sales.chains.chainsSection') }} ({{
                            filters.year
                        }})
                    </h2>
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
                            :label-header="t('sales.columns.chain')"
                            :row-href="href"
                            :share-digits="2"
                            :yoy-header="data.yoyHeader"
                        />
                    </div>
                </section>
            </TabsContent>

            <TabsContent value="target" class="flex flex-col gap-2">
                <div class="grid gap-2 sm:grid-cols-3">
                    <Card
                        v-for="s in summary"
                        :key="s.label"
                        class="gap-2 py-4"
                    >
                        <CardHeader class="px-3">
                            <CardTitle
                                class="text-[11px] font-normal text-muted-foreground"
                            >
                                {{ s.label }}
                            </CardTitle>
                        </CardHeader>
                        <CardContent class="px-3">
                            <div
                                class="text-lg leading-tight font-semibold tabular-nums"
                                :class="s.tone ? toneText[s.tone] : undefined"
                            >
                                <AnimatedNumber
                                    :value="s.value"
                                    :format="s.format"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <h2 class="text-sm font-medium">
                    {{ t('sales.chains.targetSection') }}
                </h2>
                <p
                    v-if="!access.canEditTargets"
                    class="text-xs text-muted-foreground"
                >
                    {{ t('bi.target.readOnly') }}
                </p>
                <div class="flex h-[72vh] min-h-72 flex-col">
                    <ProductTargetTable
                        :months="months2026"
                        :total="targetTotal"
                        :rows="data.targets.rows"
                        :readonly="!access.canEditTargets"
                    />
                </div>
            </TabsContent>
        </Tabs>
    </div>
</template>
