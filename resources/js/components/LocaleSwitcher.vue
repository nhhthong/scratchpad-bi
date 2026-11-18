<script setup lang="ts">
import { router } from '@inertiajs/vue3';
import type { HTMLAttributes } from 'vue';
import { Languages } from '@lucide/vue';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Locale } from '@/i18n';
import { update } from '@/routes/locale';

defineProps<{ class?: HTMLAttributes['class'] }>();

const { t, locale } = useI18n();

const options: { value: Locale; label: string }[] = [
    { value: 'ja', label: '日本語' },
    { value: 'en', label: 'English' },
];

function change(value: unknown): void {
    const next = String(value);

    if (next !== locale.value) {
        router.post(update(), { locale: next }, { preserveScroll: true });
    }
}
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button
                variant="ghost"
                size="icon"
                :class="$props.class"
                :aria-label="t('common.language')"
            >
                <Languages />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
                :model-value="locale"
                @update:model-value="change"
            >
                <DropdownMenuRadioItem
                    v-for="option in options"
                    :key="option.value"
                    :value="option.value"
                >
                    {{ option.label }}
                </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
