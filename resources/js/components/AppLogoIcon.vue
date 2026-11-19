<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

defineOptions({
    inheritAttrs: false,
});

type Props = {
    className?: HTMLAttributes['class'];
};

defineProps<Props>();
</script>

<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        :class="className"
        v-bind="$attrs"
    >
        <g fill="currentColor">
            <rect x="14" y="34" width="9" height="16" rx="2" />
            <rect x="27.5" y="22" width="9" height="28" rx="2" />
            <rect x="41" y="12" width="9" height="38" rx="2" />
        </g>
    </svg>
</template>
