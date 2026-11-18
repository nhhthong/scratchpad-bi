<script setup lang="ts">
import { ArrowDown, ArrowUp, Minus } from '@lucide/vue';
import { computed } from 'vue';
import { Badge } from '@/components/ui/badge';
import { useFormat } from '@/composables/useFormat';
import { toneBadge, yoyTone } from '@/lib/semantic';

// `value` is a ratio against the comparison period (1.0 = unchanged).
// The arrow shows the direction of the change, the color shows how serious it is.
const props = defineProps<{ value?: number | null; digits?: number }>();

const { percent } = useFormat();

const tone = computed(() => yoyTone(props.value));
const icon = computed(() => {
    if (props.value == null) {
        return null;
    }

    if (props.value > 1) {
        return ArrowUp;
    }

    return props.value < 1 ? ArrowDown : Minus;
});
</script>

<template>
    <Badge
        v-if="value != null"
        variant="outline"
        class="px-1.5 py-0 tabular-nums"
        :class="toneBadge[tone]"
    >
        <component :is="icon" v-if="icon" aria-hidden="true" />
        {{ percent(value, digits ?? 0) }}
    </Badge>
</template>
