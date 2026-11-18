<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import TrendBadge from '@/components/shared/TrendBadge.vue';
import SalesViewToolbar from '@/components/tables/SalesViewToolbar.vue';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useFormat } from '@/composables/useFormat';
import { useSalesView } from '@/composables/useSalesView';
import type { SalesRow } from '@/types';

const props = defineProps<{
    months: string[];
    rows: SalesRow[];
    total?: SalesRow;
    labelHeader: string;
    subLabelHeader?: string;
    rowHref?: (row: SalesRow) => string | null;
    // Decimals of the monthly share (the source workbook uses 0.00% on the chain screen).
    shareDigits?: number;
    // Year-over-year ratios shown above the column titles, as in the source workbook:
    // quantity and amount for the totals, amount for each month.
    yoyHeader?: {
        qty: number | null;
        amount: number | null;
        monthly: (number | null)[];
    };
}>();

const { t } = useI18n();
const { int, amount, percent, month, negative } = useFormat();
const view = useSalesView();

const hasSub = props.subLabelHeader !== undefined;
const showQty = () => view.value.metric !== 'amount';
const showAmount = () => view.value.metric !== 'qty';
const showShare = () => view.value.share;
const monthSpan = () =>
    Number(showQty()) + Number(showAmount()) + Number(showShare());
const unitLabel = () =>
    showAmount() ? ` (${t(`sales.view.units.${view.value.unit}`)})` : '';

const all = () => (props.total ? [props.total, ...props.rows] : props.rows);
const isTotal = (index: number) => props.total !== undefined && index === 0;

// Sticky cells must be opaque (no /alpha), or rows scrolling underneath show through.
const head =
    'h-10 bg-muted px-3 text-[13px] font-medium whitespace-nowrap text-foreground/70';
const cell = 'px-3 py-2.5 text-right tabular-nums group-hover:bg-muted/70';
const labelCell =
    'sticky z-10 bg-card px-3 py-2.5 shadow-[1px_0_0_0_var(--border)] group-hover:bg-muted';
</script>

<template>
    <div class="flex min-h-0 flex-1 flex-col gap-3">
        <SalesViewToolbar />

        <ScrollArea
            class="min-h-72 flex-1 rounded-lg border bg-card [&>[data-slot=scroll-area-viewport]]:h-full"
        >
            <table
                class="w-max min-w-full border-separate border-spacing-0 text-sm"
            >
                <TableHeader class="sticky top-0 z-20">
                    <TableRow v-if="yoyHeader" class="hover:bg-transparent">
                        <TableHead
                            :colspan="hasSub ? 2 : 1"
                            class="sticky left-0 z-30 border-b text-sm shadow-[1px_0_0_0_var(--border)]"
                            :class="head"
                        >
                            {{ t('sales.columns.yoy') }}
                        </TableHead>
                        <TableHead
                            v-if="showQty()"
                            class="border-b border-l text-right"
                            :class="head"
                        >
                            <div class="flex justify-end">
                                <TrendBadge :value="yoyHeader.qty" />
                            </div>
                        </TableHead>
                        <TableHead
                            v-if="showAmount()"
                            class="border-b text-right"
                            :class="[head, showQty() ? '' : 'border-l']"
                        >
                            <div class="flex justify-end">
                                <TrendBadge :value="yoyHeader.amount" />
                            </div>
                        </TableHead>
                        <TableHead
                            :colspan="2"
                            class="border-b"
                            :class="head"
                        />
                        <TableHead
                            v-for="(m, i) in months"
                            :key="m"
                            :colspan="monthSpan()"
                            :title="t('sales.columns.yoyAmount')"
                            class="border-b border-l text-center"
                            :class="head"
                        >
                            <div class="flex justify-center">
                                <TrendBadge :value="yoyHeader.monthly[i]" />
                            </div>
                        </TableHead>
                    </TableRow>
                    <TableRow class="hover:bg-transparent">
                        <TableHead
                            :rowspan="2"
                            class="sticky left-0 z-30 min-w-52 border-b"
                            :class="head"
                        >
                            {{ labelHeader }}
                        </TableHead>
                        <TableHead
                            v-if="hasSub"
                            :rowspan="2"
                            class="sticky left-52 z-30 min-w-32 border-b shadow-[1px_0_0_0_var(--border)]"
                            :class="head"
                        >
                            {{ subLabelHeader }}
                        </TableHead>
                        <TableHead
                            :colspan="
                                2 + Number(showQty()) + Number(showAmount())
                            "
                            class="border-b border-l text-center"
                            :class="head"
                        >
                            {{ t('sales.columns.total') }}{{ unitLabel() }}
                        </TableHead>
                        <TableHead
                            v-for="m in months"
                            :key="m"
                            :colspan="monthSpan()"
                            class="border-b border-l text-center text-foreground"
                            :class="head"
                        >
                            {{ month(m) }}
                        </TableHead>
                    </TableRow>
                    <TableRow class="hover:bg-transparent">
                        <TableHead
                            v-if="showQty()"
                            class="border-b border-l text-right"
                            :class="head"
                        >
                            {{ t('sales.columns.qty') }}
                        </TableHead>
                        <TableHead
                            v-if="showAmount()"
                            class="border-b text-right"
                            :class="[head, showQty() ? '' : 'border-l']"
                        >
                            {{ t('sales.columns.amount') }}
                        </TableHead>
                        <TableHead class="border-b text-right" :class="head">
                            {{ t('sales.columns.share') }}
                        </TableHead>
                        <TableHead class="border-b text-right" :class="head">
                            {{ t('sales.columns.yoy') }}
                        </TableHead>
                        <template v-for="m in months" :key="m">
                            <TableHead
                                v-if="showQty()"
                                class="border-b border-l text-right"
                                :class="head"
                            >
                                {{ t('sales.columns.qty') }}
                            </TableHead>
                            <TableHead
                                v-if="showAmount()"
                                class="border-b text-right"
                                :class="[head, showQty() ? '' : 'border-l']"
                            >
                                {{ t('sales.columns.amount') }}
                            </TableHead>
                            <TableHead
                                v-if="showShare()"
                                class="border-b text-right"
                                :class="[
                                    head,
                                    showQty() || showAmount() ? '' : 'border-l',
                                ]"
                            >
                                {{ t('sales.columns.share') }}
                            </TableHead>
                        </template>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <TableRow
                        v-for="(row, index) in all()"
                        :key="row.key"
                        class="group border-0 hover:bg-transparent"
                        :class="isTotal(index) ? 'font-semibold' : ''"
                    >
                        <TableCell
                            class="left-0 min-w-52 border-b"
                            :class="[
                                labelCell,
                                isTotal(index) ? '!bg-muted' : '',
                            ]"
                        >
                            <Link
                                v-if="
                                    rowHref && !isTotal(index) && rowHref(row)
                                "
                                :href="rowHref(row)!"
                                class="underline-offset-4 hover:underline"
                            >
                                {{ row.label }}
                            </Link>
                            <template v-else>{{ row.label }}</template>
                        </TableCell>
                        <TableCell
                            v-if="hasSub"
                            class="left-52 min-w-32 border-b text-muted-foreground"
                            :class="[
                                labelCell,
                                isTotal(index) ? '!bg-muted' : '',
                            ]"
                        >
                            {{ row.sub }}
                        </TableCell>

                        <TableCell
                            v-if="showQty()"
                            class="min-w-24 border-b border-l"
                            :class="[
                                cell,
                                isTotal(index) ? 'bg-muted/60' : '',
                                negative(row.qty),
                            ]"
                        >
                            {{ int(row.qty) }}
                        </TableCell>
                        <TableCell
                            v-if="showAmount()"
                            class="min-w-28 border-b"
                            :class="[
                                cell,
                                isTotal(index) ? 'bg-muted/60' : '',
                                showQty() ? '' : 'border-l',
                                negative(row.amount),
                            ]"
                        >
                            {{ amount(row.amount, view.unit) }}
                        </TableCell>
                        <TableCell
                            class="min-w-20 border-b text-muted-foreground"
                            :class="[cell, isTotal(index) ? 'bg-muted/60' : '']"
                        >
                            {{ percent(row.share) }}
                        </TableCell>
                        <TableCell
                            class="min-w-24 border-b"
                            :class="[cell, isTotal(index) ? 'bg-muted/60' : '']"
                        >
                            <div class="flex justify-end">
                                <TrendBadge :value="row.yoy" />
                            </div>
                        </TableCell>

                        <template v-for="(figure, i) in row.monthly" :key="i">
                            <TableCell
                                v-if="showQty()"
                                class="min-w-20 border-b border-l"
                                :class="[cell, negative(figure.qty)]"
                            >
                                {{ int(figure.qty) }}
                            </TableCell>
                            <TableCell
                                v-if="showAmount()"
                                class="min-w-24 border-b"
                                :class="[
                                    cell,
                                    showQty() ? '' : 'border-l',
                                    negative(figure.amount),
                                ]"
                            >
                                {{ amount(figure.amount, view.unit) }}
                            </TableCell>
                            <TableCell
                                v-if="showShare()"
                                class="min-w-16 border-b text-muted-foreground"
                                :class="[
                                    cell,
                                    showQty() || showAmount() ? '' : 'border-l',
                                ]"
                            >
                                {{ percent(figure.share, shareDigits ?? 0) }}
                            </TableCell>
                        </template>
                    </TableRow>
                </TableBody>
            </table>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    </div>
</template>
