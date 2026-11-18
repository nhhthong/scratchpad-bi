<script setup lang="ts">
import { Form, Head } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import AppLogoImage from '@/components/AppLogoImage.vue';
import InputError from '@/components/InputError.vue';
import LocaleSwitcher from '@/components/LocaleSwitcher.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import TextLink from '@/components/TextLink.vue';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

defineProps<{
    status?: string;
    canResetPassword: boolean;
}>();

// Inertia passes shared props (errors, auth, locale…) that this page does not declare.
defineOptions({ inheritAttrs: false });

const { t } = useI18n();
</script>

<template>
    <Head :title="t('auth.login.submit')" />

    <div class="flex min-h-svh flex-col bg-muted">
        <header class="border-b-2 border-red-600 bg-zinc-950">
            <div
                class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6"
            >
                <AppLogoImage class="w-36" />
                <LocaleSwitcher
                    class="text-zinc-300 hover:bg-white/10 hover:text-white"
                />
            </div>
        </header>

        <main class="flex flex-1 items-center justify-center p-6 md:p-10">
            <Card class="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle class="text-2xl">
                        {{ t('auth.login.title') }}
                    </CardTitle>
                    <CardDescription>
                        {{ t('auth.login.description') }}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        v-if="status"
                        class="mb-4 text-center text-sm font-medium text-green-600"
                    >
                        {{ status }}
                    </div>

                    <Form
                        v-bind="store.form()"
                        :reset-on-success="['password']"
                        v-slot="{ errors, processing }"
                    >
                        <FieldGroup>
                            <Field>
                                <FieldLabel for="email">
                                    {{ t('auth.login.email') }}
                                </FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    v-focus
                                    :tabindex="1"
                                    autocomplete="email"
                                    :placeholder="
                                        t('auth.login.emailPlaceholder')
                                    "
                                />
                                <InputError :message="errors.email" />
                            </Field>

                            <Field>
                                <div class="flex items-center">
                                    <FieldLabel for="password">
                                        {{ t('auth.login.password') }}
                                    </FieldLabel>
                                    <TextLink
                                        v-if="canResetPassword"
                                        :href="request()"
                                        class="ml-auto text-sm"
                                        :tabindex="5"
                                    >
                                        {{ t('auth.login.forgotPassword') }}
                                    </TextLink>
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    :tabindex="2"
                                    autocomplete="current-password"
                                />
                                <InputError :message="errors.password" />
                            </Field>

                            <Field orientation="horizontal">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    :tabindex="3"
                                />
                                <FieldLabel for="remember" class="font-normal">
                                    {{ t('auth.login.remember') }}
                                </FieldLabel>
                            </Field>

                            <Field>
                                <Button
                                    type="submit"
                                    :tabindex="4"
                                    :disabled="processing"
                                    data-test="login-button"
                                >
                                    <Spinner v-if="processing" />
                                    {{ t('auth.login.submit') }}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </Form>
                </CardContent>
            </Card>
        </main>
    </div>
</template>
