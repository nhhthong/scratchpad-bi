// Mock data: users, roles and the two separate permission axes.
//   1. Data scope    = WHICH data a user may see (all / one chain / one store).
//   2. Display level = HOW DEEP the user may drill (1 chain, 2 store, 3 product of a store).
// Three roles are enough to show the three permission levels. The first account to sign in
// (admin1) is the super admin; admin2 and admin3 are the seeded accounts used as the chain and
// the store user, matched by email.
import { CHAINS, STORES } from './salesCube';
import type { Level, Scope } from './salesCube';

export type Role = 'admin' | 'chain' | 'store';
export type Org = 'hq' | 'chain' | 'store';

export type MockUser = {
    id: string;
    name: string;
    email: string;
    role: Role;
    org: Org;
    scope: Scope;
    levels: Level[];
    active: boolean;
};

export type RolePreset = {
    org: Org;
    scopeType: Scope['type'];
    levels: Level[];
    canEditTargets: boolean;
    canManageUsers: boolean;
};

export const ROLE_PRESETS: Record<Role, RolePreset> = {
    admin: {
        org: 'hq',
        scopeType: 'all',
        levels: [1, 2, 3],
        canEditTargets: true,
        canManageUsers: true,
    },
    chain: {
        org: 'chain',
        scopeType: 'chain',
        levels: [1, 2, 3],
        canEditTargets: false,
        canManageUsers: false,
    },
    store: {
        org: 'store',
        scopeType: 'store',
        levels: [2, 3],
        canEditTargets: false,
        canManageUsers: false,
    },
};

export const capabilities = (user: MockUser) => ({
    canEditTargets: ROLE_PRESETS[user.role].canEditTargets,
    canManageUsers: ROLE_PRESETS[user.role].canManageUsers,
});

const chain = CHAINS[0].id;
const store = STORES.find((s) => s.chainId === CHAINS[1].id)!.id;

export function seedUsers(): MockUser[] {
    return [
        {
            id: 'u1',
            name: '管理 太郎',
            email: 'admin1@example.com',
            role: 'admin',
            org: 'hq',
            scope: { type: 'all' },
            levels: [1, 2, 3],
            active: true,
        },
        {
            id: 'u2',
            name: '田中 美咲',
            email: 'admin2@example.com',
            role: 'chain',
            org: 'chain',
            scope: { type: 'chain', id: chain },
            levels: [1, 2, 3],
            active: true,
        },
        {
            id: 'u3',
            name: '伊藤 直樹',
            email: 'admin3@example.com',
            role: 'store',
            org: 'store',
            scope: { type: 'store', id: store },
            levels: [2, 3],
            active: true,
        },
    ];
}

// First screen a user is allowed to open, from the shallowest allowed level.
export function homeFor(user: MockUser): string {
    if (user.levels.includes(1)) {
        return '/dashboard';
    }

    return user.levels.includes(2) ? '/sales/stores' : '/sales/products';
}
