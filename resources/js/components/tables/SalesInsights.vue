<script setup lang="ts">
// KPI strip and three compact charts shared by the three sales levels.
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import MonthlyBarChart from '@/components/charts/MonthlyBarChart.vue';
import ShareDonutChart from '@/components/charts/ShareDonutChart.vue';
import YoyLineChart from '@/components/charts/YoyLineChart.vue';
import AnimatedNumber from '@/components/shared/AnimatedNumber.vue';
import { Card } from '@/components/ui/card';
import { useFormat } from '@/composables/useFormat';
import { toneText, yoyTone } from '@/lib/semantic';
import type { Tone } from '@/lib/semantic';

const props = defineProps<{
    kpi: {
        qty: number;
        amount: number;
        yoyQty: number | null;
        yoyAmount: number | null;
    };
    chart: {
        months: string[];
        current: (number | null)[];
        previous: (number | null)[];
        donut: { label: string; value: number }[];
    };
    year: number;
    shareTitle: string;
}>();

const { t } = useI18n();
const { int, percent } = useFormat();

type Kpi = {
    label: string;
    value: number | null;
    format: (n: number) => string;
    tone?: Tone;
};

const kpis = computed<Kpi[]>(() => [
    {
        label: t('sales.kpi.qty'),
        value: props.kpi.qty,
        format: (n) => int(Math.round(n)),
    },
    {
        label: t('sales.kpi.amount'),
        value: props.kpi.amount,
        format: (n) => `${int(Math.round(n))} ${t('sales.kpi.yenSuffix')}`,
    },
    {
        label: t('sales.kpi.yoyQty'),
        value: props.kpi.yoyQty,
        format: (n) => percent(n),
        tone: yoyTone(props.kpi.yoyQty),
    },
    {
        label: t('sales.kpi.yoyAmount'),
        value: props.kpi.yoyAmount,
        format: (n) => percent(n),
        tone: yoyTone(props.kpi.yoyAmount),
    },
]);

// Charts build their tooltip once, so they are re-created when the data they show changes.
const chartKey = computed(
    () => `${props.year}-${props.chart.months[0]}-${props.chart.months.length}`,
);
const donutKey = computed(() =>
    props.chart.donut.map((d) => `${d.label}:${Math.round(d.value)}`).join('|'),
);
</script>

<template>
    <div class="flex flex-col gap-2">
        <Card
            class="grid grid-cols-2 gap-0 divide-x divide-y py-0 lg:grid-cols-4 lg:divide-y-0"
        >
            <div v-for="k in kpis" :key="k.label" class="px-3 py-1.5">
                <div class="text-[11px] text-muted-foreground">
                    {{ k.label }}
                </div>
                <div
                    class="text-lg leading-tight font-semibold tabular-nums"
                    :class="k.tone ? toneText[k.tone] : undefined"
                >
                    <AnimatedNumber
                        v-if="k.value != null"
                        :value="k.value"
                        :format="k.format"
                    />
                    <span v-else class="text-muted-foreground">—</span>
                </div>
            </div>
        </Card>

        <div
            class="grid gap-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.4fr)]"
        >
            <Card class="gap-1 px-3 py-2">
                <div class="text-xs font-medium">
                    {{ t('bi.chart.monthly') }}
                </div>
                <MonthlyBarChart
                    :key="chartKey"
                    :months="chart.months"
                    :current="chart.current"
                    :previous="chart.previous"
                    :year="year"
                />
            </Card>
            <Card class="gap-1 px-3 py-2">
                <div class="text-xs font-medium">{{ t('bi.chart.yoy') }}</div>
                <YoyLineChart
                    :key="chartKey"
                    :months="chart.months"
                    :current="chart.current"
                    :previous="chart.previous"
                />
            </Card>
            <Card class="gap-1 px-3 py-2">
                <div class="text-xs font-medium">{{ shareTitle }}</div>
                <ShareDonutChart :key="donutKey" :items="chart.donut" />
            </Card>
        </div>
    </div>
</template>
