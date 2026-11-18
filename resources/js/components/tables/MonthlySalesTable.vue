<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
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
import { toneText, yoyTone } from '@/lib/semantic';
import type { SalesRow } from '@/types';

const props = defineProps<{
    months: string[];
    rows: SalesRow[];
    total?: SalesRow;
    labelHeader: string;
    subLabelHeader?: string;
    rowHref?: (row: SalesRow) => string | null;
}>();

const { t } = useI18n();
const { int, amount, percent, month } = useFormat();
const view = useSalesView();

const hasSub = props.subLabelHeader !== undefined;
const showQty = () => view.value.metric !== 'amount';
const showAmount = () => view.value.metric !== 'qty';
const monthSpan = () => (view.value.metric === 'both' ? 2 : 1);
const unitLabel = () =>
    showAmount() ? ` (${t(`sales.view.units.${view.value.unit}`)})` : '';

const empty = (qty: number, value: number) => qty === 0 && value === 0;

// Cells share a hover color; sticky cells need an opaque background of their own.
const cell = 'px-3 py-2.5 text-right tabular-nums group-hover:bg-muted/70';
const labelCell =
    'sticky z-10 bg-card px-3 py-2.5 shadow-[1px_0_0_0_var(--border)] group-hover:bg-muted';
// Sticky cells must be opaque (no /alpha), or rows scrolling underneath show through.
const headAlt = 'bg-[color-mix(in_oklab,var(--muted),var(--foreground)_6%)]';
const head =
    'h-10 px-3 text-xs font-medium whitespace-nowrap text-muted-foreground';
</script>

<template>
    <div class="flex flex-col gap-3">
        <SalesViewToolbar />

        <ScrollArea
            class="rounded-lg border bg-card [&>[data-slot=scroll-area-viewport]]:max-h-[70vh]"
        >
            <table
                class="w-max min-w-full border-separate border-spacing-0 text-sm"
            >
                <TableHeader class="sticky top-0 z-20">
                    <TableRow class="hover:bg-transparent">
                        <TableHead
                            :rowspan="2"
                            class="sticky left-0 z-30 min-w-52 border-b bg-muted"
                            :class="head"
                        >
                            {{ labelHeader }}
                        </TableHead>
                        <TableHead
                            v-if="hasSub"
                            :rowspan="2"
                            class="sticky left-52 z-30 min-w-32 border-b bg-muted shadow-[1px_0_0_0_var(--border)]"
                            :class="head"
                        >
                            {{ subLabelHeader }}
                        </TableHead>
                        <TableHead
                            :colspan="
                                2 + Number(showQty()) + Number(showAmount())
                            "
                            class="border-b border-l bg-muted text-center"
                            :class="head"
                        >
                            {{ t('sales.columns.total') }}{{ unitLabel() }}
                        </TableHead>
                        <TableHead
                            v-for="(m, i) in months"
                            :key="m"
                            :colspan="monthSpan()"
                            class="border-b border-l text-center"
                            :class="[head, i % 2 ? 'bg-muted' : headAlt]"
                        >
                            {{ month(m) }}
                        </TableHead>
                    </TableRow>
                    <TableRow class="hover:bg-transparent">
                        <TableHead
                            v-if="showQty()"
                            class="border-b border-l bg-muted text-right"
                            :class="head"
                        >
                            {{ t('sales.columns.qty') }}
                        </TableHead>
                        <TableHead
                            v-if="showAmount()"
                            class="border-b bg-muted text-right"
                            :class="[head, showQty() ? '' : 'border-l']"
                        >
                            {{ t('sales.columns.amount') }}
                        </TableHead>
                        <TableHead
                            class="border-b bg-muted text-right"
                            :class="head"
                        >
                            {{ t('sales.columns.share') }}
                        </TableHead>
                        <TableHead
                            class="border-b bg-muted text-right"
                            :class="head"
                        >
                            {{ t('sales.columns.yoy') }}
                        </TableHead>
                        <template v-for="(m, i) in months" :key="m">
                            <TableHead
                                v-if="showQty()"
                                class="border-b border-l text-right"
                                :class="[head, i % 2 ? 'bg-muted' : headAlt]"
                            >
                                {{ t('sales.columns.qty') }}
                            </TableHead>
                            <TableHead
                                v-if="showAmount()"
                                class="border-b text-right"
                                :class="[
                                    head,
                                    i % 2 ? 'bg-muted' : headAlt,
                                    showQty() ? '' : 'border-l',
                                ]"
                            >
                                {{ t('sales.columns.amount') }}
                            </TableHead>
                        </template>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <template
                        v-for="(row, index) in total ? [total, ...rows] : rows"
                        :key="row.key"
                    >
                        <TableRow
                            class="group border-0 hover:bg-transparent"
                            :class="total && index === 0 ? 'font-semibold' : ''"
                        >
                            <TableCell
                                class="left-0 min-w-52 border-b"
                                :class="[
                                    labelCell,
                                    total && index === 0 ? '!bg-muted' : '',
                                ]"
                            >
                                <Link
                                    v-if="
                                        rowHref &&
                                        !(total && index === 0) &&
                                        rowHref(row)
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
                                    total && index === 0 ? '!bg-muted' : '',
                                ]"
                            >
                                {{ row.sub }}
                            </TableCell>

                            <TableCell
                                v-if="showQty()"
                                class="min-w-24 border-b border-l"
                                :class="[
                                    cell,
                                    total && index === 0 ? 'bg-muted/60' : '',
                                ]"
                            >
                                {{ int(row.qty) }}
                            </TableCell>
                            <TableCell
                                v-if="showAmount()"
                                class="min-w-28 border-b"
                                :class="[
                                    cell,
                                    total && index === 0 ? 'bg-muted/60' : '',
                                    showQty() ? '' : 'border-l',
                                ]"
                            >
                                {{ amount(row.amount, view.unit) }}
                            </TableCell>
                            <TableCell
                                class="min-w-20 border-b text-muted-foreground"
                                :class="[
                                    cell,
                                    total && index === 0 ? 'bg-muted/60' : '',
                                ]"
                            >
                                {{ percent(row.share) }}
                            </TableCell>
                            <TableCell
                                class="min-w-20 border-b"
                                :class="[
                                    cell,
                                    total && index === 0 ? 'bg-muted/60' : '',
                                    toneText[yoyTone(row.yoy)],
                                ]"
                            >
                                {{ percent(row.yoy) }}
                            </TableCell>

                            <template
                                v-for="(figure, i) in row.monthly"
                                :key="i"
                            >
                                <TableCell
                                    v-if="showQty()"
                                    class="min-w-20 border-b border-l"
                                    :class="[
                                        cell,
                                        i % 2 ? 'bg-muted/30' : '',
                                        empty(figure.qty, figure.amount)
                                            ? 'text-muted-foreground/40'
                                            : '',
                                    ]"
                                >
                                    {{
                                        empty(figure.qty, figure.amount)
                                            ? '-'
                                            : int(figure.qty)
                                    }}
                                </TableCell>
                                <TableCell
                                    v-if="showAmount()"
                                    class="min-w-24 border-b"
                                    :class="[
                                        cell,
                                        i % 2 ? 'bg-muted/30' : '',
                                        showQty() ? '' : 'border-l',
                                        empty(figure.qty, figure.amount)
                                            ? 'text-muted-foreground/40'
                                            : '',
                                    ]"
                                >
                                    {{
                                        empty(figure.qty, figure.amount)
                                            ? '-'
                                            : amount(figure.amount, view.unit)
                                    }}
                                </TableCell>
                            </template>
                        </TableRow>
                    </template>
                </TableBody>
            </table>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    </div>
</template>
