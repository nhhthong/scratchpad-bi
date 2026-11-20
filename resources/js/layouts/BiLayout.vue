<script setup lang="ts">
import { Link, router, usePage } from '@inertiajs/vue3';
import {
    BarChart3,
    LogOut,
    Menu,
    Package,
    ShieldCheck,
    Store,
    UserRound,
} from '@lucide/vue';
import type { Component } from 'vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppLogoImage from '@/components/AppLogoImage.vue';
import LocaleSwitcher from '@/components/LocaleSwitcher.vue';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { useMockSession } from '@/composables/useMockSession';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { dashboard, logout, mypage } from '@/routes';
import { permissions } from '@/routes/admin';
import { products, stores } from '@/routes/sales';

const { t } = useI18n();
const page = usePage();

const { current: user, access, scopeName } = useMockSession();
const year = new Date().getFullYear();

type Item = {
    key: string;
    href: string;
    icon: Component;
    label: string;
    level?: number;
};

// The menu follows the display levels (1 chain, 2 store, 3 product) and the capabilities of the user.
const items = computed<Item[]>(() =>
    [
        {
            level: 1,
            key: 'chains',
            href: dashboard().url,
            icon: BarChart3,
            label: t('nav.chains'),
        },
        {
            level: 2,
            key: 'stores',
            href: stores().url,
            icon: Store,
            label: t('nav.stores'),
        },
        {
            level: 3,
            key: 'products',
            href: products().url,
            icon: Package,
            label: t('nav.products'),
        },
    ].filter((item) => (user.value.levels as number[]).includes(item.level)),
);
const adminItem = computed<Item | null>(() =>
    access.value.canManageUsers
        ? {
              key: 'permissions',
              href: permissions().url,
              icon: ShieldCheck,
              label: t('bi.nav.permissions'),
          }
        : null,
);
const myPage = computed<Item>(() => ({
    key: 'mypage',
    href: mypage().url,
    icon: UserRound,
    label: t('bi.nav.mypage'),
}));
const menu = computed(() => [
    ...items.value,
    ...(adminItem.value ? [adminItem.value] : []),
]);

const current = computed(() =>
    page.url.startsWith('/settings')
        ? t('nav.settings')
        : [...menu.value, myPage.value].find((item) =>
              page.url.startsWith(item.href),
          )?.label,
);
// The logo opens the first screen this user may see (a store user has no chain screen).
const homeHref = computed(() => items.value[0]?.href ?? mypage().url);
const roleLabel = computed(() => t(`bi.role.${user.value.role}`));
const scopeText = computed(() => scopeName(user.value, t('bi.scope.all')));
</script>

<template>
    <div class="flex h-svh flex-col bg-muted/40">
        <header
            class="sticky top-0 z-40 border-b-2 border-red-600 bg-zinc-950 text-white"
        >
            <div class="flex h-11 items-center gap-3 px-3">
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
                                v-for="item in menu"
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
                                <div
                                    class="mt-1 truncate text-xs text-muted-foreground"
                                >
                                    {{ roleLabel }} · {{ scopeText }}
                                </div>
                            </div>
                            <SheetClose as-child>
                                <Link
                                    :href="myPage.href"
                                    class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                                    :class="
                                        current === myPage.label
                                            ? 'bg-accent text-accent-foreground'
                                            : 'text-muted-foreground'
                                    "
                                    data-test="nav-mypage"
                                >
                                    <component
                                        :is="myPage.icon"
                                        class="size-4"
                                    />
                                    {{ myPage.label }}
                                </Link>
                            </SheetClose>
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

                <Link :href="homeHref" class="flex items-center">
                    <AppLogoImage class="w-32" />
                </Link>

                <span
                    v-if="current"
                    class="ml-2 hidden border-l border-white/20 pl-4 text-sm text-zinc-300 sm:inline"
                >
                    {{ current }}
                </span>

                <div class="ml-auto flex items-center gap-2">
                    <Link
                        :href="myPage.href"
                        class="hidden items-center gap-2 rounded-md px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-white/10 hover:text-white md:flex"
                        data-test="user-chip"
                    >
                        <UserRound class="size-3.5" />
                        <span class="font-medium">{{ user.name }}</span>
                        <span class="text-zinc-400">
                            {{ roleLabel }} · {{ scopeText }}
                        </span>
                    </Link>
                    <LocaleSwitcher
                        class="text-zinc-300 hover:bg-white/10 hover:text-white"
                    />
                </div>
            </div>
        </header>

        <main class="min-h-0 flex-1 overflow-auto p-2">
            <slot />
        </main>

        <footer
            class="shrink-0 border-t bg-background px-3 py-1 text-[11px] text-muted-foreground"
        >
            © {{ year }} {{ page.props.name }}
        </footer>

        <Toaster />
    </div>
</template>
