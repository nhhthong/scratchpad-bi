<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import SegmentedControl from '@/components/shared/SegmentedControl.vue';
import { Switch } from '@/components/ui/switch';
import { useSalesView } from '@/composables/useSalesView';
import type { Metric, Unit } from '@/composables/useSalesView';

defineProps<{ unitOnly?: boolean }>();

const { t } = useI18n();
const view = useSalesView();

const metrics: Metric[] = ['amount', 'qty', 'both'];
const units: Unit[] = ['yen', 'thousand', 'million'];
</script>

<template>
    <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <div v-if="!unitOnly" class="flex items-center gap-2">
            <span class="text-muted-foreground">{{
                t('sales.view.metric')
            }}</span>
            <SegmentedControl
                v-model="view.metric"
                :aria-label="t('sales.view.metric')"
                :options="
                    metrics.map((m) => ({
                        value: m,
                        label: t(`sales.view.metrics.${m}`),
                    }))
                "
            />
        </div>

        <div
            v-if="unitOnly || view.metric !== 'qty'"
            class="flex items-center gap-2"
        >
            <span class="text-muted-foreground">{{
                t('sales.view.unit')
            }}</span>
            <SegmentedControl
                v-model="view.unit"
                :aria-label="t('sales.view.unit')"
                :options="
                    units.map((u) => ({
                        value: u,
                        label: t(`sales.view.units.${u}`),
                    }))
                "
            />
        </div>

        <label v-if="!unitOnly" class="flex cursor-pointer items-center gap-2">
            <Switch v-model="view.share" />
            <span class="text-muted-foreground">{{
                t('sales.view.share')
            }}</span>
        </label>
    </div>
</template>
