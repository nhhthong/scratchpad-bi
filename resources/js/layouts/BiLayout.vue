<script setup lang="ts">
import { Link, router, usePage } from '@inertiajs/vue3';
import { BarChart3, LogOut, Menu, Package, Store } from '@lucide/vue';
import type { Component } from 'vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppLogoImage from '@/components/AppLogoImage.vue';
import LocaleSwitcher from '@/components/LocaleSwitcher.vue';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { dashboard, logout } from '@/routes';
import { products, stores } from '@/routes/sales';

const { t } = useI18n();
const page = usePage();

const user = computed(() => page.props.auth.user);

type Item = { key: string; href: string; icon: Component; label: string };

const items = computed<Item[]>(() => [
    {
        key: 'chains',
        href: dashboard().url,
        icon: BarChart3,
        label: t('nav.chains'),
    },
    {
        key: 'stores',
        href: stores().url,
        icon: Store,
        label: t('nav.stores'),
    },
    {
        key: 'products',
        href: products().url,
        icon: Package,
        label: t('nav.products'),
    },
]);

const current = computed(() =>
    page.url.startsWith('/settings')
        ? t('nav.settings')
        : items.value.find((item) => page.url.startsWith(item.href))?.label,
);
</script>

<template>
    <div class="flex min-h-svh flex-col bg-muted/40">
        <header
            class="sticky top-0 z-40 border-b-2 border-red-600 bg-zinc-950 text-white"
        >
            <div class="flex h-14 items-center gap-3 px-4">
                <Sheet>
                    <SheetTrigger as-child>
                        <Button
                            variant="ghost"
                            size="icon"
                            class="text-zinc-200 hover:bg-white/10 hover:text-white"
                            :aria-label="t('nav.menu')"
                            data-test="burger-button"
                        >
                            <Menu class="size-5" />
                        </Button>
                    </SheetTrigger>

                    <SheetContent
                        side="left"
                        class="flex w-72 flex-col gap-0 p-0"
                    >
                        <SheetHeader class="bg-zinc-950 p-4 text-left">
                            <SheetTitle class="sr-only">
                                {{ t('nav.menu') }}
                            </SheetTitle>
                            <SheetDescription class="sr-only">
                                {{ t('nav.menuDescription') }}
                            </SheetDescription>
                            <AppLogoImage class="w-40" />
                        </SheetHeader>
                        <div class="h-0.5 bg-red-600" />

                        <nav class="flex flex-1 flex-col gap-1 p-3">
                            <SheetClose
                                v-for="item in items"
                                :key="item.key"
                                as-child
                            >
                                <Link
                                    :href="item.href"
                                    class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                                    :class="
                                        current === item.label
                                            ? 'bg-accent text-accent-foreground'
                                            : 'text-muted-foreground'
                                    "
                                >
                                    <component :is="item.icon" class="size-4" />
                                    {{ item.label }}
                                </Link>
                            </SheetClose>
                        </nav>

                        <Separator />
                        <div class="flex flex-col gap-1 p-3">
                            <div class="px-3 py-2 text-sm">
                                <div class="truncate font-medium">
                                    {{ user.name }}
                                </div>
                                <div
                                    class="truncate text-xs text-muted-foreground"
                                >
                                    {{ user.email }}
                                </div>
                            </div>
                            <Link
                                :href="logout()"
                                as="button"
                                class="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent"
                                data-test="logout-button"
                                @click="router.flushAll()"
                            >
                                <LogOut class="size-4" />
                                {{ t('nav.logout') }}
                            </Link>
                        </div>
                    </SheetContent>
                </Sheet>

                <Link :href="dashboard()" class="flex items-center">
                    <AppLogoImage class="w-32" />
                </Link>

                <span
                    v-if="current"
                    class="ml-2 hidden border-l border-white/20 pl-4 text-sm text-zinc-300 sm:inline"
                >
                    {{ current }}
                </span>

                <div class="ml-auto">
                    <LocaleSwitcher
                        class="text-zinc-300 hover:bg-white/10 hover:text-white"
                    />
                </div>
            </div>
        </header>

        <main class="flex-1 p-4 md:p-6">
            <slot />
        </main>
    </div>
</template>
