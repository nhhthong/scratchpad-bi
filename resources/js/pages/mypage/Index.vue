<script setup lang="ts">
// My page = personal settings (profile, display defaults, password) + a read-only view of the user's access.
import { Head, router } from '@inertiajs/vue3';
import { Check, Minus } from '@lucide/vue';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SegmentedControl from '@/components/shared/SegmentedControl.vue';
import SalesViewToolbar from '@/components/tables/SalesViewToolbar.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'vue-sonner';
import { useAppearance } from '@/composables/useAppearance';
import { useMockSession } from '@/composables/useMockSession';
import { update as updateLocale } from '@/routes/locale';

defineOptions({ inheritAttrs: false });

const { t, locale } = useI18n();
const { appearance, updateAppearance } = useAppearance();
const { current, access, prefs, scopeName, updateProfile, setDefaultYear } =
    useMockSession();

const name = ref(current.value.name);
const email = ref(current.value.email);
const scope = computed(() => scopeName(current.value, t('bi.scope.all')));

const saveProfile = () => {
    updateProfile(name.value, email.value);
    toast.success(t('bi.mypage.saved'));
};
const setYear = (value: string) => {
    setDefaultYear(Number(value) === 2025 ? 2025 : 2026);
    toast.success(t('bi.mypage.saved'));
};
const setLocale = (value: string) => {
    if (value !== locale.value) {
        router.post(
            updateLocale(),
            { locale: value },
            { preserveScroll: true },
        );
    }
};

const currentPassword = ref('');
const next = ref('');
const confirm = ref('');
const changePassword = () => {
    toast.success(t('bi.mypage.passwordChanged'));
    currentPassword.value = next.value = confirm.value = '';
};
</script>

<template>
    <Head :title="t('bi.mypage.title')" />

    <div class="mx-auto flex w-full max-w-4xl flex-col gap-2.5">
        <div>
            <h1 class="text-xl font-semibold tracking-tight">
                {{ t('bi.mypage.title') }}
            </h1>
            <p class="text-sm text-muted-foreground">
                {{ t('bi.mypage.subtitle') }}
            </p>
        </div>

        <Tabs default-value="profile" class="gap-2.5">
            <TabsList class="self-start">
                <TabsTrigger value="profile">{{
                    t('bi.mypage.tabs.profile')
                }}</TabsTrigger>
                <TabsTrigger value="display">{{
                    t('bi.mypage.tabs.display')
                }}</TabsTrigger>
                <TabsTrigger value="security">{{
                    t('bi.mypage.tabs.security')
                }}</TabsTrigger>
                <TabsTrigger value="access" data-test="tab-access">{{
                    t('bi.mypage.tabs.access')
                }}</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
                <Card>
                    <CardContent class="flex max-w-md flex-col gap-4">
                        <div class="flex flex-col gap-1.5">
                            <Label for="mp-name">{{
                                t('bi.mypage.name')
                            }}</Label>
                            <Input id="mp-name" v-model="name" />
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <Label for="mp-email">{{
                                t('bi.mypage.email')
                            }}</Label>
                            <Input id="mp-email" v-model="email" type="email" />
                        </div>
                        <Button
                            class="w-fit"
                            data-test="profile-save"
                            @click="saveProfile"
                            >{{ t('bi.mypage.save') }}</Button
                        >
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="display">
                <Card>
                    <CardHeader>
                        <CardTitle class="text-base">{{
                            t('bi.mypage.displayTitle')
                        }}</CardTitle>
                        <CardDescription>{{
                            t('bi.mypage.displayHint')
                        }}</CardDescription>
                    </CardHeader>
                    <CardContent class="flex flex-col gap-5">
                        <div class="flex flex-wrap items-center gap-3">
                            <span class="w-32 text-sm text-muted-foreground">{{
                                t('bi.mypage.defaultYear')
                            }}</span>
                            <SegmentedControl
                                :model-value="String(prefs.defaultYear)"
                                :options="[
                                    { value: '2026', label: '2026' },
                                    { value: '2025', label: '2025' },
                                ]"
                                @update:model-value="setYear"
                            />
                        </div>
                        <SalesViewToolbar />
                        <div class="flex flex-wrap items-center gap-3">
                            <span class="w-32 text-sm text-muted-foreground">{{
                                t('bi.mypage.language')
                            }}</span>
                            <SegmentedControl
                                :model-value="locale"
                                :options="[
                                    { value: 'ja', label: '日本語' },
                                    { value: 'en', label: 'English' },
                                ]"
                                @update:model-value="setLocale"
                            />
                        </div>
                        <div class="flex flex-wrap items-center gap-3">
                            <span class="w-32 text-sm text-muted-foreground">{{
                                t('bi.mypage.theme')
                            }}</span>
                            <SegmentedControl
                                :model-value="appearance"
                                :options="[
                                    {
                                        value: 'light',
                                        label: t('bi.mypage.light'),
                                    },
                                    {
                                        value: 'dark',
                                        label: t('bi.mypage.dark'),
                                    },
                                    {
                                        value: 'system',
                                        label: t('bi.mypage.system'),
                                    },
                                ]"
                                @update:model-value="
                                    (v) =>
                                        updateAppearance(
                                            v as 'light' | 'dark' | 'system',
                                        )
                                "
                            />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="security">
                <Card>
                    <CardContent class="flex max-w-md flex-col gap-4">
                        <div class="flex flex-col gap-1.5">
                            <Label for="mp-cur">{{
                                t('bi.mypage.currentPassword')
                            }}</Label>
                            <Input
                                id="mp-cur"
                                v-model="currentPassword"
                                type="password"
                                autocomplete="current-password"
                            />
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <Label for="mp-new">{{
                                t('bi.mypage.newPassword')
                            }}</Label>
                            <Input
                                id="mp-new"
                                v-model="next"
                                type="password"
                                autocomplete="new-password"
                            />
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <Label for="mp-conf">{{
                                t('bi.mypage.confirmPassword')
                            }}</Label>
                            <Input
                                id="mp-conf"
                                v-model="confirm"
                                type="password"
                                autocomplete="new-password"
                            />
                        </div>
                        <Button class="w-fit" @click="changePassword">{{
                            t('bi.mypage.changePassword')
                        }}</Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="access">
                <Card>
                    <CardHeader>
                        <CardTitle class="text-base">{{
                            t('bi.mypage.accessTitle')
                        }}</CardTitle>
                        <CardDescription>{{
                            t('bi.mypage.accessHint')
                        }}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl
                            class="grid max-w-2xl grid-cols-[10rem_1fr] items-center gap-x-4 gap-y-3 text-sm"
                        >
                            <dt class="text-muted-foreground">
                                {{ t('bi.mypage.organization') }}
                            </dt>
                            <dd>{{ t(`bi.org.${current.org}`) }}</dd>
                            <dt class="text-muted-foreground">
                                {{ t('bi.mypage.role') }}
                            </dt>
                            <dd>{{ t(`bi.role.${current.role}`) }}</dd>
                            <dt class="text-muted-foreground">
                                {{ t('bi.mypage.dataScope') }}
                            </dt>
                            <dd class="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">{{
                                    t(`bi.scope.${current.scope.type}`)
                                }}</Badge>
                                <span v-if="current.scope.type !== 'all'">{{
                                    scope
                                }}</span>
                            </dd>
                            <dt class="text-muted-foreground">
                                {{ t('bi.mypage.levels') }}
                            </dt>
                            <dd class="flex flex-wrap gap-2">
                                <Badge
                                    v-for="l in [1, 2, 3]"
                                    :key="l"
                                    :variant="
                                        current.levels.includes(l)
                                            ? 'default'
                                            : 'outline'
                                    "
                                    :class="
                                        current.levels.includes(l)
                                            ? ''
                                            : 'text-muted-foreground'
                                    "
                                >
                                    <Check v-if="current.levels.includes(l)" />
                                    <Minus v-else />
                                    {{ t(`bi.level.${l}`) }}
                                </Badge>
                            </dd>
                            <dt class="text-muted-foreground">
                                {{ t('bi.mypage.editTargets') }}
                            </dt>
                            <dd>
                                {{
                                    access.canEditTargets
                                        ? t('bi.mypage.yes')
                                        : t('bi.mypage.no')
                                }}
                            </dd>
                        </dl>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
</template>
