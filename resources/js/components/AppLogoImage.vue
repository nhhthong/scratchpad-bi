<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import type { HTMLAttributes } from 'vue';

// The logo has white lettering, so it must sit on a dark background.
defineProps<{
    class?: HTMLAttributes['class'];
}>();

const name = usePage().props.name as string;
</script>

<template>
    <img
        src="/images/logo.png"
        width="270"
        height="40"
        :alt="name"
        :class="['h-auto max-w-none', $props.class]"
    />
</template>
