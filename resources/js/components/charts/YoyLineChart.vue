<script setup lang="ts">
// Year-over-year ratio per month, in percent (shadcn line chart). The dashed line is 100%.
import { VisAxis, VisLine, VisXYContainer } from '@unovis/vue';
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

const props = defineProps<{
    months: string[];
    current: (number | null)[];
    previous: (number | null)[];
}>();

type Datum = { month: string; yoy: number | undefined };

const { t } = useI18n();
const { month } = useFormat();

const config = {
    yoy: { label: `${t('sales.columns.yoy')} %`, color: 'var(--chart-2)' },
} satisfies ChartConfig;

const data = computed<Datum[]>(() =>
    props.months.map((m, i) => {
        const cur = props.current[i];
        const prev = props.previous[i];

        return {
            month: m,
            yoy:
                cur != null && prev
                    ? Math.round((cur / prev) * 1000) / 10
                    : undefined,
        };
    }),
);
const domain = computed<[number, number]>(() => {
    const values = data.value
        .map((d) => d.yoy)
        .filter((v): v is number => v !== undefined);

    return [
        Math.min(90, Math.floor((Math.min(...values, 100) - 4) / 10) * 10),
        Math.max(110, Math.ceil((Math.max(...values, 100) + 4) / 10) * 10),
    ];
});

const label = (index: number) => month(props.months[Math.round(index)] ?? '');
const template = componentToString(config, ChartTooltipContent, {
    labelFormatter: (x) => label(Number(x)),
});
</script>

<template>
    <ChartContainer
        id="yoy-line"
        :config="config"
        class="aspect-auto h-32 w-full"
        data-test="chart-yoy"
    >
        <VisXYContainer
            :data="data"
            :margin="{ top: 4, right: 4, bottom: 0, left: 0 }"
            :y-domain="domain"
        >
            <VisLine
                :x="(_: Datum, i: number) => i"
                :y="() => 100"
                color="var(--border)"
                :line-width="1"
                :line-dash-array="[3, 3]"
            />
            <VisLine
                :x="(_: Datum, i: number) => i"
                :y="(d: Datum) => d.yoy"
                :color="config.yoy.color"
                :line-width="2"
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
                :tick-format="(v: number) => `${v}%`"
                :num-ticks="3"
                :tick-line="false"
                :domain-line="false"
            />
            <ChartTooltip />
            <ChartCrosshair :template="template" :color="config.yoy.color" />
        </VisXYContainer>
    </ChartContainer>
</template>
