<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import type { Metric, Unit } from '@/composables/useSalesView';
import { useSalesView } from '@/composables/useSalesView';

const { t } = useI18n();
const view = useSalesView();

const metrics: Metric[] = ['amount', 'qty', 'both'];
const units: Unit[] = ['yen', 'thousand', 'million'];
</script>

<template>
    <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div class="flex items-center gap-2">
            <span class="text-muted-foreground">{{
                t('sales.view.metric')
            }}</span>
            <div class="flex gap-1">
                <Button
                    v-for="metric in metrics"
                    :key="metric"
                    size="sm"
                    :variant="view.metric === metric ? 'default' : 'outline'"
                    @click="view.metric = metric"
                >
                    {{ t(`sales.view.metrics.${metric}`) }}
                </Button>
            </div>
        </div>

        <div v-if="view.metric !== 'qty'" class="flex items-center gap-2">
            <span class="text-muted-foreground">{{
                t('sales.view.unit')
            }}</span>
            <div class="flex gap-1">
                <Button
                    v-for="unit in units"
                    :key="unit"
                    size="sm"
                    :variant="view.unit === unit ? 'default' : 'outline'"
                    @click="view.unit = unit"
                >
                    {{ t(`sales.view.units.${unit}`) }}
                </Button>
            </div>
        </div>
    </div>
</template>
