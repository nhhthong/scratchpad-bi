<script setup lang="ts">
// Admin only: manage users with two separate settings, data scope and display levels.
import { Head } from '@inertiajs/vue3';
import { Check, Layers, Minus, Pencil, Plus, ShieldCheck } from '@lucide/vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMockSession } from '@/composables/useMockSession';
import { useAdminGuard } from '@/composables/useSalesFilters';
import { CHAINS as chains, STORES as stores } from '@/mocks/salesCube';
import type { Level, Scope } from '@/mocks/salesCube';
import { ROLE_PRESETS as presets } from '@/mocks/users';
import type { MockUser, Role } from '@/mocks/users';

// Inertia passes shared props (errors, auth, locale…) that this page does not declare.
defineOptions({ inheritAttrs: false });

useAdminGuard();

const { t } = useI18n();
const { users, scopeName, saveUser } = useMockSession();

const roles = Object.keys(presets) as Role[];
const scopeLabel = (user: MockUser) => scopeName(user, t('bi.scope.all'));

// ---- edit sheet
type Form = {
    name: string;
    email: string;
    role: Role;
    scopeType: Scope['type'];
    scopeId: string;
    levels: Level[];
    active: boolean;
};

const open = ref(false);
const editingId = ref<string | null>(null);
const form = ref<Form>({
    name: '',
    email: '',
    role: 'admin',
    scopeType: 'all',
    scopeId: '',
    levels: [1, 2, 3],
    active: true,
});

// Picking a role fills in its defaults; the admin can still adjust scope and levels for this user.
function applyPreset(role: Role) {
    const preset = presets[role];

    form.value.role = role;
    form.value.scopeType = preset.scopeType;
    form.value.scopeId = '';
    form.value.levels = [...preset.levels];
}

function startNew() {
    editingId.value = null;
    form.value = {
        name: '',
        email: '',
        role: 'chain',
        scopeType: 'chain',
        scopeId: '',
        levels: [1, 2, 3],
        active: true,
    };
    open.value = true;
}

function startEdit(user: MockUser) {
    editingId.value = user.id;
    form.value = {
        name: user.name,
        email: user.email,
        role: user.role,
        scopeType: user.scope.type,
        scopeId: user.scope.type === 'all' ? '' : user.scope.id,
        levels: [...user.levels],
        active: user.active,
    };
    open.value = true;
}

function toggleLevel(level: Level, on: boolean) {
    const set = new Set(form.value.levels);

    if (on) {
        set.add(level);
    } else {
        set.delete(level);
    }

    form.value.levels = [...set].sort();
}

function save() {
    const f = form.value;

    if (!f.name.trim() || !f.email.trim()) {
        toast.error(t('bi.admin.needName'));

        return;
    }

    if (f.scopeType !== 'all' && !f.scopeId) {
        toast.error(t('bi.admin.needScope'));

        return;
    }

    if (!f.levels.length) {
        toast.error(t('bi.admin.needLevel'));

        return;
    }

    const scope: Scope =
        f.scopeType === 'all'
            ? { type: 'all' }
            : { type: f.scopeType, id: f.scopeId };

    saveUser(
        {
            name: f.name.trim(),
            email: f.email.trim(),
            role: f.role,
            active: f.active,
            levels: f.levels,
            scope,
        },
        editingId.value ?? undefined,
    );
    toast.success(
        editingId.value ? t('bi.admin.updated') : t('bi.admin.created'),
    );
    open.value = false;
}
</script>

<template>
    <Head :title="t('bi.admin.title')" />

    <div class="mx-auto flex w-full max-w-6xl flex-col gap-2.5">
        <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 class="text-xl font-semibold tracking-tight">
                    {{ t('bi.admin.title') }}
                </h1>
                <p class="text-sm text-muted-foreground">
                    {{ t('bi.admin.subtitle') }}
                </p>
            </div>
            <Button data-test="add-user" @click="startNew"
                ><Plus />{{ t('bi.admin.addUser') }}</Button
            >
        </div>

        <div class="grid gap-2 md:grid-cols-2">
            <Card class="gap-1 py-2">
                <CardHeader class="px-3">
                    <CardTitle class="flex items-center gap-2 text-sm"
                        ><ShieldCheck
                            class="size-4 text-indigo-600 dark:text-indigo-400"
                        />{{ t('bi.admin.conceptScopeTitle') }}</CardTitle
                    >
                    <CardDescription>{{
                        t('bi.admin.conceptScope')
                    }}</CardDescription>
                </CardHeader>
            </Card>
            <Card class="gap-1 py-2">
                <CardHeader class="px-3">
                    <CardTitle class="flex items-center gap-2 text-sm"
                        ><Layers
                            class="size-4 text-indigo-600 dark:text-indigo-400"
                        />{{ t('bi.admin.conceptLevelTitle') }}</CardTitle
                    >
                    <CardDescription>{{
                        t('bi.admin.conceptLevel')
                    }}</CardDescription>
                </CardHeader>
            </Card>
        </div>

        <Tabs default-value="users" class="gap-2.5">
            <TabsList class="self-start">
                <TabsTrigger value="users">{{
                    t('bi.admin.tabs.users')
                }}</TabsTrigger>
                <TabsTrigger value="roles" data-test="tab-roles">{{
                    t('bi.admin.tabs.roles')
                }}</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
                <div class="overflow-x-auto rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow class="bg-muted/50 hover:bg-muted/50">
                                <TableHead class="px-3">{{
                                    t('bi.admin.colUser')
                                }}</TableHead>
                                <TableHead>{{
                                    t('bi.admin.colOrg')
                                }}</TableHead>
                                <TableHead>{{
                                    t('bi.admin.colRole')
                                }}</TableHead>
                                <TableHead>{{
                                    t('bi.admin.colScope')
                                }}</TableHead>
                                <TableHead>{{
                                    t('bi.admin.colLevels')
                                }}</TableHead>
                                <TableHead>{{
                                    t('bi.admin.colStatus')
                                }}</TableHead>
                                <TableHead class="text-right">{{
                                    t('bi.admin.colActions')
                                }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow
                                v-for="u in users"
                                :key="u.id"
                                data-test="user-row"
                            >
                                <TableCell class="px-3">
                                    <div class="font-medium">{{ u.name }}</div>
                                    <div class="text-xs text-muted-foreground">
                                        {{ u.email }}
                                    </div>
                                </TableCell>
                                <TableCell class="text-sm">{{
                                    t(`bi.org.${u.org}`)
                                }}</TableCell>
                                <TableCell class="text-sm">{{
                                    t(`bi.role.${u.role}`)
                                }}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{{
                                        t(`bi.scope.${u.scope.type}`)
                                    }}</Badge>
                                    <div
                                        v-if="u.scope.type !== 'all'"
                                        class="mt-0.5 max-w-48 truncate text-xs text-muted-foreground"
                                    >
                                        {{ scopeLabel(u) }}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div class="flex gap-1">
                                        <Badge
                                            v-for="l in [1, 2, 3]"
                                            :key="l"
                                            :variant="
                                                u.levels.includes(l)
                                                    ? 'default'
                                                    : 'outline'
                                            "
                                            :class="
                                                u.levels.includes(l)
                                                    ? ''
                                                    : 'text-muted-foreground/60'
                                            "
                                            >{{
                                                t(`bi.level.short${l}`)
                                            }}</Badge
                                        >
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        :variant="
                                            u.active ? 'secondary' : 'outline'
                                        "
                                        :class="
                                            u.active
                                                ? ''
                                                : 'text-muted-foreground'
                                        "
                                    >
                                        {{
                                            u.active
                                                ? t('bi.admin.active')
                                                : t('bi.admin.inactive')
                                        }}
                                    </Badge>
                                </TableCell>
                                <TableCell class="text-right">
                                    <div class="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            data-test="edit-user"
                                            @click="startEdit(u)"
                                        >
                                            <Pencil />{{ t('bi.admin.edit') }}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </TabsContent>

            <TabsContent value="roles">
                <div class="overflow-x-auto rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow class="bg-muted/50 hover:bg-muted/50">
                                <TableHead class="px-3">{{
                                    t('bi.admin.matrixRole')
                                }}</TableHead>
                                <TableHead>{{
                                    t('bi.admin.matrixOrg')
                                }}</TableHead>
                                <TableHead>{{
                                    t('bi.admin.matrixScope')
                                }}</TableHead>
                                <TableHead
                                    v-for="l in [1, 2, 3]"
                                    :key="l"
                                    class="text-center"
                                    >{{ t(`bi.level.${l}`) }}</TableHead
                                >
                                <TableHead class="text-center">{{
                                    t('bi.admin.matrixTargets')
                                }}</TableHead>
                                <TableHead class="text-center">{{
                                    t('bi.admin.matrixUsers')
                                }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="r in roles" :key="r">
                                <TableCell class="px-3 font-medium">{{
                                    t(`bi.role.${r}`)
                                }}</TableCell>
                                <TableCell class="text-sm">{{
                                    t(`bi.org.${presets[r].org}`)
                                }}</TableCell>
                                <TableCell
                                    ><Badge variant="outline">{{
                                        t(`bi.scope.${presets[r].scopeType}`)
                                    }}</Badge></TableCell
                                >
                                <TableCell
                                    v-for="l in [1, 2, 3]"
                                    :key="l"
                                    class="text-center"
                                >
                                    <Check
                                        v-if="presets[r].levels.includes(l)"
                                        class="mx-auto size-4 text-emerald-600 dark:text-emerald-400"
                                    />
                                    <Minus
                                        v-else
                                        class="mx-auto size-4 text-muted-foreground/50"
                                    />
                                </TableCell>
                                <TableCell class="text-center">
                                    <Check
                                        v-if="presets[r].canEditTargets"
                                        class="mx-auto size-4 text-emerald-600 dark:text-emerald-400"
                                    />
                                    <Minus
                                        v-else
                                        class="mx-auto size-4 text-muted-foreground/50"
                                    />
                                </TableCell>
                                <TableCell class="text-center">
                                    <Check
                                        v-if="presets[r].canManageUsers"
                                        class="mx-auto size-4 text-emerald-600 dark:text-emerald-400"
                                    />
                                    <Minus
                                        v-else
                                        class="mx-auto size-4 text-muted-foreground/50"
                                    />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                <p class="mt-3 text-xs text-muted-foreground">
                    {{ t('bi.admin.matrixNote') }}
                </p>
            </TabsContent>
        </Tabs>

        <Sheet v-model:open="open">
            <SheetContent class="w-full gap-0 overflow-y-auto sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{{
                        editingId
                            ? t('bi.admin.sheetTitleEdit')
                            : t('bi.admin.sheetTitleNew')
                    }}</SheetTitle>
                    <SheetDescription>{{
                        t('bi.admin.sheetDescription')
                    }}</SheetDescription>
                </SheetHeader>

                <div class="flex flex-col gap-5 px-4 pb-4">
                    <div class="flex flex-col gap-1.5">
                        <Label for="pm-name">{{ t('bi.mypage.name') }}</Label>
                        <Input id="pm-name" v-model="form.name" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <Label for="pm-email">{{ t('bi.mypage.email') }}</Label>
                        <Input
                            id="pm-email"
                            v-model="form.email"
                            type="email"
                        />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <Label>{{ t('bi.admin.role') }}</Label>
                        <Select
                            :model-value="form.role"
                            @update:model-value="
                                (v) => applyPreset(String(v) as Role)
                            "
                        >
                            <SelectTrigger
                                class="w-full"
                                data-test="role-select"
                                ><SelectValue
                            /></SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    v-for="r in roles"
                                    :key="r"
                                    :value="r"
                                    >{{ t(`bi.role.${r}`) }}</SelectItem
                                >
                            </SelectContent>
                        </Select>
                    </div>

                    <section class="flex flex-col gap-2 rounded-lg border p-3">
                        <div>
                            <h3 class="text-sm font-medium">
                                {{ t('bi.admin.scopeSection') }}
                            </h3>
                            <p class="text-xs text-muted-foreground">
                                {{ t('bi.admin.scopeHint') }}
                            </p>
                        </div>
                        <Select
                            :model-value="form.scopeType"
                            @update:model-value="
                                (v) => {
                                    form.scopeType = String(v) as Scope['type'];
                                    form.scopeId = '';
                                }
                            "
                        >
                            <SelectTrigger class="w-full" data-test="scope-type"
                                ><SelectValue
                            /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{{
                                    t('bi.admin.scopeAll')
                                }}</SelectItem>
                                <SelectItem value="chain">{{
                                    t('bi.admin.scopeChain')
                                }}</SelectItem>
                                <SelectItem value="store">{{
                                    t('bi.admin.scopeStore')
                                }}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            v-if="form.scopeType === 'chain'"
                            v-model="form.scopeId"
                        >
                            <SelectTrigger
                                class="w-full"
                                data-test="scope-chain"
                                ><SelectValue
                                    :placeholder="t('bi.admin.pickChain')"
                            /></SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    v-for="c in chains"
                                    :key="c.id"
                                    :value="c.id"
                                    >{{ c.name }}</SelectItem
                                >
                            </SelectContent>
                        </Select>
                        <Select
                            v-else-if="form.scopeType === 'store'"
                            v-model="form.scopeId"
                        >
                            <SelectTrigger
                                class="w-full"
                                data-test="scope-store"
                                ><SelectValue
                                    :placeholder="t('bi.admin.pickStore')"
                            /></SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    v-for="s in stores"
                                    :key="s.id"
                                    :value="s.id"
                                    >{{ s.name }}</SelectItem
                                >
                            </SelectContent>
                        </Select>
                    </section>

                    <section class="flex flex-col gap-3 rounded-lg border p-3">
                        <div>
                            <h3 class="text-sm font-medium">
                                {{ t('bi.admin.levelSection') }}
                            </h3>
                            <p class="text-xs text-muted-foreground">
                                {{ t('bi.admin.levelHint') }}
                            </p>
                        </div>
                        <label
                            v-for="l in [1, 2, 3]"
                            :key="l"
                            class="flex cursor-pointer items-center justify-between gap-3 text-sm"
                        >
                            <span>{{ t(`bi.level.${l}`) }}</span>
                            <Switch
                                :model-value="form.levels.includes(l)"
                                :data-test="`level-${l}`"
                                @update:model-value="
                                    (v) => toggleLevel(l, Boolean(v))
                                "
                            />
                        </label>
                    </section>

                    <label
                        class="flex cursor-pointer items-center justify-between gap-3 text-sm"
                    >
                        <span
                            >{{ t('bi.admin.statusSection') }}:
                            {{
                                form.active
                                    ? t('bi.admin.active')
                                    : t('bi.admin.inactive')
                            }}</span
                        >
                        <Switch v-model="form.active" />
                    </label>
                </div>

                <SheetFooter class="flex-row justify-end gap-2">
                    <Button variant="outline" @click="open = false">{{
                        t('bi.admin.cancel')
                    }}</Button>
                    <Button data-test="save-user" @click="save">{{
                        editingId ? t('bi.admin.update') : t('bi.admin.create')
                    }}</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    </div>
</template>
