<script setup lang="ts">
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type Option = { value: string; label: string };

defineProps<{ options: Option[]; ariaLabel?: string }>();

const model = defineModel<string>({ required: true });

// A single-select group emits an empty value when the active item is clicked again: ignore it.
function update(value: unknown): void {
    if (typeof value === 'string' && value !== '') {
        model.value = value;
    }
}
</script>

<template>
    <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        :model-value="model"
        :aria-label="ariaLabel"
        @update:model-value="update"
    >
        <ToggleGroupItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            class="px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
            {{ option.label }}
        </ToggleGroupItem>
    </ToggleGroup>
</template>
