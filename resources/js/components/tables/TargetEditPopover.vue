<script setup lang="ts">
// small popover to enter a product target by hand.
// The user types the target quantity; the amount is calculated as quantity x unit price.
import { Pencil } from '@lucide/vue';
import {
    PopoverContent,
    PopoverPortal,
    PopoverRoot,
    PopoverTrigger,
} from 'reka-ui';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormat } from '@/composables/useFormat';
import type { ProductTargetRow } from '@/types';

const props = defineProps<{ row: ProductTargetRow }>();
const emit = defineEmits<{ save: [qty: number | null] }>();

const { t } = useI18n();
const { int, amount } = useFormat();

const open = ref(false);
const draft = ref('');

watch(open, (isOpen) => {
    if (isOpen) {
        draft.value =
            props.row.targetQty == null ? '' : String(props.row.targetQty);
    }
});

const parsed = computed<number | null | undefined>(() => {
    // A number input v-model yields a number, not a string.
    const text = String(draft.value ?? '').trim();
    if (text === '') return null;
    const n = Number(text);
    return Number.isInteger(n) && n >= 0 ? n : undefined;
});
const invalid = computed(() => parsed.value === undefined);
const previewAmount = computed(() =>
    typeof parsed.value === 'number' && props.row.unitPrice != null
        ? parsed.value * props.row.unitPrice
        : null,
);

function submit() {
    if (invalid.value) return;
    const qty = parsed.value as number | null;
    emit('save', qty);
    toast.success(qty == null ? t('bi.target.cleared') : t('bi.target.saved'));
    open.value = false;
}
</script>

<template>
    <PopoverRoot v-model:open="open">
        <PopoverTrigger as-child>
            <button
                type="button"
                data-test="target-edit"
                :aria-label="t('bi.target.edit')"
                class="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
                <Pencil class="size-3.5" />
            </button>
        </PopoverTrigger>

        <PopoverPortal>
            <PopoverContent
                align="end"
                :side-offset="6"
                class="z-50 w-72 rounded-md border bg-popover p-4 text-left text-popover-foreground shadow-md outline-none"
            >
                <form class="flex flex-col gap-3" @submit.prevent="submit">
                    <div class="min-w-0">
                        <p class="text-sm font-medium">
                            {{ t('bi.target.edit') }}
                        </p>
                        <p class="truncate text-xs text-muted-foreground">
                            {{ row.name }}
                        </p>
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <Label for="target-qty" class="text-xs">{{
                            t('bi.target.qty')
                        }}</Label>
                        <Input
                            id="target-qty"
                            v-model="draft"
                            v-focus
                            type="number"
                            inputmode="numeric"
                            min="0"
                            step="1"
                            class="text-right tabular-nums"
                            :aria-invalid="invalid"
                        />
                        <p v-if="invalid" class="text-xs text-destructive">
                            {{ t('bi.target.invalid') }}
                        </p>
                        <p v-else class="text-xs text-muted-foreground">
                            {{ t('bi.target.clearHint') }}
                        </p>
                    </div>

                    <dl
                        class="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 rounded-md bg-muted/60 px-3 py-2 text-xs"
                    >
                        <dt class="text-muted-foreground">
                            {{ t('bi.target.lastYear') }}
                        </dt>
                        <dd class="text-right tabular-nums">
                            {{ int(row.qty2025) || '—' }}
                        </dd>
                        <dt class="text-muted-foreground">
                            {{ t('bi.target.unitPrice') }}
                        </dt>
                        <dd class="text-right tabular-nums">
                            {{
                                row.unitPrice == null ? '—' : int(row.unitPrice)
                            }}
                        </dd>
                        <dt class="text-muted-foreground">
                            {{ t('bi.target.amount') }}
                            <span class="block text-[11px] opacity-80">{{
                                t('bi.target.amountHint')
                            }}</span>
                        </dt>
                        <dd
                            class="self-center text-right font-medium tabular-nums"
                        >
                            {{
                                previewAmount == null
                                    ? '—'
                                    : amount(previewAmount, 'yen')
                            }}
                        </dd>
                    </dl>
                    <p
                        v-if="row.unitPrice == null"
                        class="text-xs text-muted-foreground"
                    >
                        {{ t('bi.target.noPrice') }}
                    </p>

                    <div class="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            @click="open = false"
                        >
                            {{ t('bi.target.cancel') }}
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            :disabled="invalid"
                            data-test="target-save"
                        >
                            {{ t('bi.target.save') }}
                        </Button>
                    </div>
                </form>
            </PopoverContent>
        </PopoverPortal>
    </PopoverRoot>
</template>
