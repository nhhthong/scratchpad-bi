<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import TrendBadge from '@/components/shared/TrendBadge.vue';
import SalesViewToolbar from '@/components/tables/SalesViewToolbar.vue';
import TargetEditPopover from '@/components/tables/TargetEditPopover.vue';
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
import { achievementTone, toneBar, toneText } from '@/lib/semantic';
import type { ProductTargetRow } from '@/types';

const props = defineProps<{
    months: string[];
    total: ProductTargetRow;
    rows: ProductTargetRow[];
    // Roles without the "edit targets" capability get a read-only table.
    readonly?: boolean;
}>();

const { t } = useI18n();
const { int, amount, percent, month, negative } = useFormat();
const view = useSalesView();

// Manual target edits (mock: kept in memory). Amount = quantity x unit price; achievement = actual / target.
const edits = reactive<Record<string, number | null>>({});
const viewRows = computed(() =>
    props.rows.map((row) => {
        if (!(row.name in edits)) {
            return row;
        }

        const qty = edits[row.name];

        return {
            ...row,
            targetQty: qty,
            targetAmount:
                qty != null && row.unitPrice != null
                    ? qty * row.unitPrice
                    : null,
            achievement: qty ? (row.qty ?? 0) / qty : null,
        };
    }),
);
const all = () => [props.total, ...viewRows.value];
const isEdited = (row: ProductTargetRow) => row.name in edits;
const saveTarget = (row: ProductTargetRow, qty: number | null) => {
    edits[row.name] = qty;
};
const isTotal = (index: number) => index === 0;

// Sticky cells must be opaque (no /alpha), or rows scrolling underneath show through.
const head =
    'h-7 bg-muted px-2 text-xs font-medium whitespace-nowrap text-muted-foreground';
const cell = 'px-2 py-1 text-right tabular-nums group-hover:bg-muted/70';
</script>

<template>
    <div class="flex min-h-0 flex-1 flex-col gap-3">
        <SalesViewToolbar unit-only />

        <ScrollArea
            class="min-h-72 flex-1 rounded-lg border bg-card [&>[data-slot=scroll-area-viewport]]:h-full"
        >
            <table
                class="w-max min-w-full border-separate border-spacing-0 text-sm"
            >
                <TableHeader class="sticky top-0 z-20">
                    <TableRow class="hover:bg-transparent">
                        <TableHead
                            :rowspan="2"
                            class="sticky left-0 z-30 min-w-64 border-b bg-muted shadow-[1px_0_0_0_var(--border)]"
                            :class="head"
                        >
                            {{ t('sales.columns.product') }}
                        </TableHead>
                        <TableHead
                            :colspan="4"
                            class="border-b border-l bg-muted text-center"
                            :class="head"
                        >
                            2026
                        </TableHead>
                        <TableHead
                            :colspan="3"
                            class="border-b border-l bg-muted text-center"
                            :class="head"
                        >
                            2025
                        </TableHead>
                        <TableHead
                            :colspan="3"
                            class="border-b border-l bg-muted text-center"
                            :class="head"
                        >
                            {{ t('sales.columns.target') }}
                        </TableHead>
                        <TableHead
                            :colspan="1"
                            class="border-b border-l bg-muted text-center"
                            :class="head"
                        >
                            {{ t('sales.columns.orders') }}
                        </TableHead>
                        <TableHead
                            v-for="(m, i) in months"
                            :key="m"
                            :colspan="2"
                            class="border-b border-l text-center"
                            :class="head"
                        >
                            {{ month(m) }}
                        </TableHead>
                    </TableRow>
                    <TableRow class="hover:bg-transparent">
                        <TableHead
                            class="border-b border-l bg-muted text-right"
                            :class="head"
                        >
                            {{ t('sales.columns.qty') }}
                        </TableHead>
                        <TableHead
                            class="border-b bg-muted text-right"
                            :class="head"
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
                            class="min-w-44 border-b bg-muted"
                            :class="head"
                        >
                            {{ t('sales.columns.achievement') }}
                        </TableHead>
                        <TableHead
                            class="border-b border-l bg-muted text-right"
                            :class="head"
                        >
                            {{ t('sales.columns.qty') }}
                        </TableHead>
                        <TableHead
                            class="border-b bg-muted text-right"
                            :class="head"
                        >
                            {{ t('sales.columns.amount') }}
                        </TableHead>
                        <TableHead
                            class="border-b bg-muted text-right"
                            :class="head"
                        >
                            {{ t('sales.columns.yoy') }}
                        </TableHead>
                        <TableHead
                            class="border-b border-l bg-muted text-right"
                            :class="head"
                        >
                            {{ t('sales.columns.qty') }}
                        </TableHead>
                        <TableHead
                            class="border-b bg-muted text-right"
                            :class="head"
                        >
                            {{ t('sales.columns.amount') }}
                        </TableHead>
                        <TableHead
                            class="border-b bg-muted text-right"
                            :class="head"
                        >
                            {{ t('sales.columns.unitPrice') }}
                        </TableHead>
                        <TableHead
                            class="border-b border-l bg-muted text-right"
                            :class="head"
                        >
                            {{ t('sales.columns.janApr') }}
                        </TableHead>
                        <template v-for="(m, i) in months" :key="m">
                            <TableHead
                                class="border-b border-l text-right"
                                :class="head"
                            >
                                {{ t('sales.columns.orderQty') }}
                            </TableHead>
                            <TableHead
                                class="border-b text-right"
                                :class="head"
                            >
                                {{ t('sales.columns.amount') }}
                            </TableHead>
                        </template>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <TableRow
                        v-for="(row, index) in all()"
                        :key="row.name"
                        class="group border-0 hover:bg-transparent"
                        :class="isTotal(index) ? 'font-semibold' : ''"
                    >
                        <TableCell
                            class="sticky left-0 z-10 min-w-64 border-b bg-card px-2 py-1 shadow-[1px_0_0_0_var(--border)] group-hover:bg-muted"
                            :class="isTotal(index) ? '!bg-muted' : ''"
                        >
                            {{ row.name }}
                        </TableCell>

                        <TableCell
                            class="border-b border-l"
                            :class="[
                                cell,
                                isTotal(index) ? 'bg-muted/60' : '',
                                negative(row.qty),
                            ]"
                        >
                            {{ int(row.qty) }}
                        </TableCell>
                        <TableCell
                            class="border-b"
                            :class="[
                                cell,
                                isTotal(index) ? 'bg-muted/60' : '',
                                negative(row.amount),
                            ]"
                        >
                            {{ amount(row.amount, view.unit) }}
                        </TableCell>
                        <TableCell
                            class="border-b text-muted-foreground"
                            :class="[cell, isTotal(index) ? 'bg-muted/60' : '']"
                        >
                            {{ percent(row.share) }}
                        </TableCell>
                        <TableCell
                            class="border-b px-2 py-1 group-hover:bg-muted/70"
                            :class="isTotal(index) ? 'bg-muted/60' : ''"
                        >
                            <div
                                v-if="row.achievement != null"
                                class="flex items-center gap-2"
                            >
                                <div
                                    class="h-2 w-24 overflow-hidden rounded-full bg-muted"
                                >
                                    <div
                                        class="h-full rounded-full"
                                        :class="
                                            toneBar[
                                                achievementTone(row.achievement)
                                            ]
                                        "
                                        :style="{
                                            width: `${Math.max(0, Math.min(100, row.achievement * 100))}%`,
                                        }"
                                    />
                                </div>
                                <span
                                    class="w-12 text-right tabular-nums"
                                    :class="
                                        toneText[
                                            achievementTone(row.achievement)
                                        ]
                                    "
                                >
                                    {{ percent(row.achievement) }}
                                </span>
                            </div>
                        </TableCell>

                        <TableCell
                            class="border-b border-l"
                            :class="[
                                cell,
                                isTotal(index) ? 'bg-muted/60' : '',
                                negative(row.qty2025),
                            ]"
                        >
                            {{ int(row.qty2025) }}
                        </TableCell>
                        <TableCell
                            class="border-b"
                            :class="[
                                cell,
                                isTotal(index) ? 'bg-muted/60' : '',
                                negative(row.amount2025),
                            ]"
                        >
                            {{ amount(row.amount2025, view.unit) }}
                        </TableCell>
                        <TableCell
                            class="min-w-24 border-b"
                            :class="[cell, isTotal(index) ? 'bg-muted/60' : '']"
                        >
                            <div class="flex justify-end">
                                <TrendBadge :value="row.yoy" />
                            </div>
                        </TableCell>

                        <TableCell
                            class="border-b border-l"
                            :class="[cell, isTotal(index) ? 'bg-muted/60' : '']"
                        >
                            <div class="flex items-center justify-end gap-1.5">
                                <span
                                    :class="
                                        isEdited(row)
                                            ? 'font-medium text-primary'
                                            : ''
                                    "
                                >
                                    {{ int(row.targetQty) }}
                                </span>
                                <TargetEditPopover
                                    v-if="!isTotal(index) && !readonly"
                                    :row="row"
                                    @save="(qty) => saveTarget(row, qty)"
                                />
                            </div>
                        </TableCell>
                        <TableCell
                            class="border-b"
                            :class="[cell, isTotal(index) ? 'bg-muted/60' : '']"
                        >
                            {{ amount(row.targetAmount, view.unit) }}
                        </TableCell>
                        <TableCell
                            class="border-b"
                            :class="[cell, isTotal(index) ? 'bg-muted/60' : '']"
                        >
                            {{ int(row.unitPrice) }}
                        </TableCell>

                        <TableCell
                            class="border-b border-l"
                            :class="[cell, isTotal(index) ? 'bg-muted/60' : '']"
                        >
                            {{ int(row.ordersJanApr) }}
                        </TableCell>

                        <template v-for="(order, i) in row.orders" :key="i">
                            <TableCell
                                class="border-b border-l"
                                :class="[cell, negative(order.qty)]"
                            >
                                {{ int(order.qty) }}
                            </TableCell>
                            <TableCell
                                class="border-b"
                                :class="[cell, negative(order.amount)]"
                            >
                                {{ amount(order.amount, view.unit) }}
                            </TableCell>
                        </template>
                    </TableRow>
                </TableBody>
            </table>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    </div>
</template>
