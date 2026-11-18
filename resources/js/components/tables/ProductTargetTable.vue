<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useFormat } from '@/composables/useFormat';
import { achievementTone, toneBar, toneText, yoyTone } from '@/lib/semantic';
import type { ProductTargetRow } from '@/types';

defineProps<{ rows: ProductTargetRow[] }>();

const { t } = useI18n();
const { int, percent } = useFormat();
</script>

<template>
    <ScrollArea
        class="rounded-lg border bg-card [&>[data-slot=scroll-area-viewport]]:max-h-[60vh]"
    >
        <table
            class="w-max min-w-full border-separate border-spacing-0 text-sm"
        >
            <TableHeader
                class="sticky top-0 z-20 bg-muted [&_th]:h-10 [&_th]:px-3 [&_th]:text-xs [&_th]:font-medium [&_th]:text-muted-foreground"
            >
                <TableRow class="hover:bg-transparent">
                    <TableHead
                        class="sticky left-0 z-30 min-w-64 border-b bg-muted shadow-[1px_0_0_0_var(--border)]"
                    >
                        {{ t('sales.columns.product') }}
                    </TableHead>
                    <TableHead class="border-b text-right">
                        {{ t('sales.columns.qty') }}
                    </TableHead>
                    <TableHead class="border-b text-right">
                        {{ t('sales.columns.amount') }}
                    </TableHead>
                    <TableHead class="border-b text-right">
                        {{ t('sales.columns.share') }}
                    </TableHead>
                    <TableHead class="border-b text-right">
                        {{ t('sales.columns.targetQty') }}
                    </TableHead>
                    <TableHead class="min-w-44 border-b">
                        {{ t('sales.columns.achievement') }}
                    </TableHead>
                    <TableHead class="border-b text-right">
                        {{ t('sales.columns.prevQty') }}
                    </TableHead>
                    <TableHead class="border-b text-right">
                        {{ t('sales.columns.yoy') }}
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow
                    v-for="row in rows"
                    :key="row.name"
                    class="group hover:bg-transparent [&_td]:px-3 [&_td]:py-2.5 [&_td]:group-hover:bg-muted/70"
                >
                    <TableCell
                        class="sticky left-0 z-10 min-w-64 border-b bg-card shadow-[1px_0_0_0_var(--border)] group-hover:!bg-muted"
                    >
                        {{ row.name }}
                    </TableCell>
                    <TableCell class="border-b text-right tabular-nums">
                        {{ int(row.qty) }}
                    </TableCell>
                    <TableCell class="border-b text-right tabular-nums">
                        {{ int(row.amount) }}
                    </TableCell>
                    <TableCell class="border-b text-right tabular-nums">
                        {{ percent(row.share) }}
                    </TableCell>
                    <TableCell class="border-b text-right tabular-nums">
                        {{ row.targetQty == null ? '-' : int(row.targetQty) }}
                    </TableCell>
                    <TableCell class="border-b">
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
                                        width: `${Math.min(100, row.achievement * 100)}%`,
                                    }"
                                />
                            </div>
                            <span
                                class="w-14 text-right tabular-nums"
                                :class="
                                    toneText[achievementTone(row.achievement)]
                                "
                            >
                                {{ percent(row.achievement) }}
                            </span>
                        </div>
                        <span v-else class="text-muted-foreground/50">-</span>
                    </TableCell>
                    <TableCell class="border-b text-right tabular-nums">
                        {{ int(row.qty2025) }}
                    </TableCell>
                    <TableCell
                        class="border-b text-right tabular-nums"
                        :class="toneText[yoyTone(row.yoy)]"
                    >
                        {{ percent(row.yoy) }}
                    </TableCell>
                </TableRow>
            </TableBody>
        </table>
        <ScrollBar orientation="horizontal" />
    </ScrollArea>
</template>
