<script setup lang="ts">
// Share of amount by row: top rows plus "others" (shadcn donut chart), with a compact legend.
import { Donut } from '@unovis/ts';
import { VisDonut, VisSingleContainer } from '@unovis/vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    componentToString,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { useFormat } from '@/composables/useFormat';

// The parent re-creates this chart (`key`) when the data changes,
// because the tooltip template is built once from this config.
const props = defineProps<{ items: { label: string; value: number }[] }>();

const { t, locale } = useI18n();
const { percent } = useFormat();

const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
    'var(--muted-foreground)',
];

const total = props.items.reduce((sum, item) => sum + item.value, 0);
const slices = props.items.map((item, i) => ({
    id: `s${i}`,
    name: item.label === '' ? t('bi.chart.others') : item.label,
    value: item.value,
    fraction: total ? item.value / total : 0,
    color: COLORS[Math.min(i, COLORS.length - 1)],
}));

// One config entry per slice: the tooltip shows the slice name with its value.
const config: ChartConfig = Object.fromEntries(
    slices.map((s) => [s.id, { label: s.name, color: s.color }]),
);
const data = slices.map((s) => ({ [s.id]: s.value }));

const center = new Intl.NumberFormat(
    locale.value === 'ja' ? 'ja-JP' : 'en-US',
    {
        notation: 'compact',
        maximumFractionDigits: 1,
    },
).format(total);
const triggers = computed(() => ({
    [Donut.selectors.segment]: componentToString(config, ChartTooltipContent, {
        hideLabel: true,
    }),
}));
</script>

<template>
    <div class="flex items-center gap-3" data-test="chart-share">
        <ChartContainer
            id="share-donut"
            :config="config"
            class="aspect-square h-28 w-28 shrink-0"
        >
            <VisSingleContainer :data="data">
                <VisDonut
                    :value="(d: Record<string, number>) => Object.values(d)[0]"
                    :color="(_: unknown, i: number) => slices[i].color"
                    :arc-width="14"
                    :pad-angle="0.02"
                    :central-label="center"
                    :central-sub-label="t('sales.columns.total')"
                />
                <ChartTooltip :triggers="triggers" />
            </VisSingleContainer>
        </ChartContainer>

        <ul class="grid min-w-0 flex-1 gap-0.5 text-[11px]">
            <li
                v-for="s in slices"
                :key="s.id"
                class="flex items-center gap-1.5"
            >
                <span
                    class="size-2 shrink-0 rounded-sm"
                    :style="{ background: s.color }"
                />
                <span class="min-w-0 flex-1 truncate" :title="s.name">
                    {{ s.name }}
                </span>
                <span class="text-muted-foreground tabular-nums">
                    {{ percent(s.fraction) }}
                </span>
            </li>
        </ul>
    </div>
</template>
