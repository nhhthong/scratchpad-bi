<script setup lang="ts">
// Monthly amount, this year against the same month last year (shadcn grouped bar chart).
import { VisAxis, VisGroupedBar, VisXYContainer } from '@unovis/vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
    ChartContainer,
    ChartCrosshair,
    ChartTooltip,
    ChartTooltipContent,
    componentToString,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { useFormat } from '@/composables/useFormat';

// The parent re-creates this chart (`key`) when the year or the period changes,
// because the tooltip template is built once from this config.
const props = defineProps<{
    months: string[];
    current: (number | null)[];
    previous: (number | null)[];
    year: number;
}>();

type Datum = { month: string; current: number; previous: number };

const { locale } = useI18n();
const { month } = useFormat();

const hasPrevious = props.previous.some((v) => v != null);
const config = {
    previous: {
        label: String(props.year - 1),
        color: 'var(--muted-foreground)',
    },
    current: { label: String(props.year), color: 'var(--chart-1)' },
} satisfies ChartConfig;

const data = computed<Datum[]>(() =>
    props.months.map((m, i) => ({
        month: m,
        current: props.current[i] ?? 0,
        previous: props.previous[i] ?? 0,
    })),
);
const keys = hasPrevious
    ? [(d: Datum) => d.previous, (d: Datum) => d.current]
    : [(d: Datum) => d.current];
const colors = hasPrevious
    ? [config.previous.color, config.current.color]
    : [config.current.color];

const compact = (value: number) =>
    new Intl.NumberFormat(locale.value === 'ja' ? 'ja-JP' : 'en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
const label = (index: number) => month(props.months[Math.round(index)] ?? '');

const template = componentToString(config, ChartTooltipContent, {
    labelFormatter: (x) => label(Number(x)),
});
</script>

<template>
    <ChartContainer
        id="monthly-bar"
        :config="config"
        class="aspect-auto h-32 w-full"
        data-test="chart-monthly"
    >
        <VisXYContainer
            :data="data"
            :margin="{ top: 4, right: 0, bottom: 0, left: 0 }"
            :y-domain="[0, undefined]"
        >
            <VisGroupedBar
                :x="(_: Datum, i: number) => i"
                :y="keys"
                :color="colors"
                :rounded-corners="2"
                :bar-padding="0.2"
                :group-padding="0.02"
            />
            <VisAxis
                type="x"
                :x="(_: Datum, i: number) => i"
                :tick-format="label"
                :num-ticks="data.length"
                :tick-line="false"
                :domain-line="false"
                :grid-line="false"
            />
            <VisAxis
                type="y"
                :tick-format="compact"
                :num-ticks="3"
                :tick-line="false"
                :domain-line="false"
            />
            <ChartTooltip />
            <ChartCrosshair :template="template" :color="colors" />
        </VisXYContainer>
    </ChartContainer>
</template>
