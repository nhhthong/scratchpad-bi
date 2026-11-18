<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{ text: string; speed?: number }>();

// Full text first (server rendering, reduced motion); typed out once mounted.
const shown = ref(props.text);
const typing = ref(false);
const motion = usePreferredReducedMotion();
let timer = 0;

function run(text: string): void {
    window.clearInterval(timer);

    if (motion.value === 'reduce') {
        shown.value = text;
        typing.value = false;

        return;
    }

    shown.value = '';
    typing.value = true;
    let length = 0;

    timer = window.setInterval(() => {
        length += 1;
        shown.value = text.slice(0, length);

        if (length >= text.length) {
            window.clearInterval(timer);
            typing.value = false;
        }
    }, props.speed ?? 45);
}

onMounted(() => run(props.text));
watch(() => props.text, run);
onBeforeUnmount(() => window.clearInterval(timer));
</script>

<template>
    <span :aria-label="text">
        <span aria-hidden="true">{{ shown }}</span>
        <span v-if="typing" class="typewriter-caret" aria-hidden="true" />
    </span>
</template>

<style scoped>
.typewriter-caret {
    display: inline-block;
    width: 2px;
    height: 1em;
    margin-left: 2px;
    vertical-align: -0.12em;
    background: currentColor;
    animation: typewriter-blink 0.9s steps(1) infinite;
}

@keyframes typewriter-blink {
    50% {
        opacity: 0;
    }
}
</style>
