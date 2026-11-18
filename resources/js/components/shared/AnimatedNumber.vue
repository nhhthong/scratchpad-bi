<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
    value: number;
    format: (value: number) => string;
    duration?: number;
}>();

// Starts at the final value so server rendering and reduced-motion users see the number at once.
const shown = ref(props.value);
const motion = usePreferredReducedMotion();
let frame = 0;

function animate(from: number, to: number): void {
    cancelAnimationFrame(frame);

    if (motion.value === 'reduce' || from === to) {
        shown.value = to;

        return;
    }

    const duration = props.duration ?? 900;
    const start = performance.now();

    const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);

        shown.value = from + (to - from) * (1 - Math.pow(1 - progress, 3));

        if (progress < 1) {
            frame = requestAnimationFrame(tick);
        } else {
            shown.value = to;
        }
    };

    frame = requestAnimationFrame(tick);
}

onMounted(() => animate(0, props.value));
watch(
    () => props.value,
    (to, from) => animate(from, to),
);
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<template>
    <span class="tabular-nums">{{ format(shown) }}</span>
</template>
