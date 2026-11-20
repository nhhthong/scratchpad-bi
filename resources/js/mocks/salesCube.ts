// Mock data: a seeded, hypothetical sales cube (chain > store > product x spec) and the queries
// the three sales screens need. Totals reconcile at every level because everything is
// aggregated from the same store x SKU x month records.
import chainProducts from './chain-products.json';
import chainsMock from './chains.json';
import storeProducts from './store-products.json';

export type Level = 1 | 2 | 3;
export type Scope =
    | { type: 'all' }
    | { type: 'chain'; id: string }
    | { type: 'store'; id: string };
export type Chain = { id: string; name: string };
export type Store = { id: string; chainId: string; name: string };
type Sku = {
    id: string;
    type: string;
    spec: string;
    price: Record<number, number>;
};
type Rec = {
    store: string;
    sku: string;
    y25: number[];
    y26: number[];
    o26: number[];
};

// Latest month with actuals (0-based): October 2026. Later months are blank, like the workbook.
export const LAST_MONTH = 9;
const pad = (n: number) => String(n).padStart(2, '0');
export const monthKey = (year: number, m: number) => `${year}-${pad(m + 1)}`;

function mulberry32(seed: number) {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const AREAS = [
    '東京',
    '横浜',
    '大阪',
    '名古屋',
    '札幌',
    '仙台',
    '福岡',
    '神戸',
    '京都',
    '広島',
    '新潟',
    '静岡',
    '熊本',
    '岡山',
    '金沢',
    '千葉',
    'さいたま',
    '川崎',
    '浜松',
    '松山',
    '長野',
    '宇都宮',
    '高松',
    '那覇',
    '鹿児島',
    '岐阜',
    '奈良',
    '津',
    '富山',
    '福井',
];
const SEASON = [
    0.8, 0.85, 1.1, 1.25, 1.2, 0.95, 0.9, 0.9, 1.05, 1.15, 1.0, 0.85,
];
const STORE_COUNTS = [7, 6, 6, 5, 5, 4, 4, 4, 3, 3, 2, 2, 1, 2, 1];

const rnd = mulberry32(20261120);

export const CHAINS: Chain[] = (
    chainsMock.years['2026'].rows as { name: string }[]
).map((r, i) => ({
    id: `c${i + 1}`,
    name: r.name,
}));

export const STORES: Store[] = CHAINS.flatMap((chain, ci) =>
    Array.from({ length: STORE_COUNTS[ci] ?? 2 }, (_, k) => ({
        id: `s${ci + 1}-${k + 1}`,
        chainId: chain.id,
        name: `${chain.name} ${AREAS[(ci * 5 + k * 3) % AREAS.length]}店`,
    })),
);

const TYPES = (chainProducts.rows as { name: string }[])
    .map((r) => r.name)
    .filter((n) => n && !n.startsWith('#'))
    .slice(0, 24);
const SPECS = [
    ...new Set((storeProducts.rows as { spec: string }[]).map((r) => r.spec)),
];

export const SKUS: Sku[] = TYPES.flatMap((type, t) =>
    Array.from({ length: 2 + (t % 2) }, (_, k) => {
        const base = 700 + Math.floor(rnd() * 3800);
        return {
            id: `p${t + 1}-${k + 1}`,
            type,
            spec: SPECS[(t * 2 + k) % SPECS.length],
            price: { 2025: base, 2026: Math.round(base * 1.03) },
        };
    }),
);
const SKU_BY_ID = new Map(SKUS.map((s) => [s.id, s]));
const SKU_WEIGHT = new Map(SKUS.map((s) => [s.id, 0.3 + rnd() ** 2 * 2]));
const SKU_TARGET_FACTOR = new Map(SKUS.map((s) => [s.id, 0.97 + rnd() * 0.25]));
const SKU_HAS_TARGET = new Map(SKUS.map((s) => [s.id, rnd() > 0.14]));

const CHAIN_GROWTH = new Map(CHAINS.map((c) => [c.id, 0.78 + rnd() * 0.5]));
const CHAIN_WEIGHT = new Map(
    CHAINS.map((c, i) => [c.id, 1 / (1 + 0.35 * i) + 0.15]),
);

const RECS: Rec[] = [];
for (const store of STORES) {
    const storeWeight = 0.5 + rnd() * 1.5;
    const growth = CHAIN_GROWTH.get(store.chainId)!;
    for (const sku of SKUS) {
        if (rnd() > 0.42) continue;
        const q0 =
            8 +
            160 *
                SKU_WEIGHT.get(sku.id)! *
                storeWeight *
                CHAIN_WEIGHT.get(store.chainId)! *
                (0.5 + rnd());
        const y25: number[] = [];
        const y26: number[] = [];
        const o26: number[] = [];
        for (let m = 0; m < 12; m++) {
            const a = Math.round(q0 * SEASON[m] * (0.85 + rnd() * 0.3));
            const b =
                m <= LAST_MONTH
                    ? Math.round(a * growth * (0.88 + rnd() * 0.24))
                    : 0;
            y25.push(a);
            y26.push(b);
            const future = m - LAST_MONTH;
            o26.push(
                future <= 0
                    ? Math.round(b * (0.9 + rnd() * 0.25))
                    : future === 1
                      ? Math.round(q0 * SEASON[m] * growth * 0.55)
                      : future === 2
                        ? Math.round(q0 * SEASON[m] * growth * 0.3)
                        : 0,
            );
        }
        RECS.push({ store: store.id, sku: sku.id, y25, y26, o26 });
    }
}

// ---------------------------------------------------------------- scope

export function storesInScope(scope: Scope): Store[] {
    if (scope.type === 'all') return STORES;
    if (scope.type === 'chain')
        return STORES.filter((s) => s.chainId === scope.id);
    return STORES.filter((s) => s.id === scope.id);
}

export function chainsInScope(scope: Scope): Chain[] {
    const ids = new Set(storesInScope(scope).map((s) => s.chainId));
    return CHAINS.filter((c) => ids.has(c.id));
}

export function scopeLabel(scope: Scope, all: string): string {
    if (scope.type === 'all') return all;
    if (scope.type === 'chain')
        return CHAINS.find((c) => c.id === scope.id)?.name ?? '';
    return STORES.find((s) => s.id === scope.id)?.name ?? '';
}

// ---------------------------------------------------------------- aggregation

type Agg = { qty: number[]; amount: number[] };
const zero = (): Agg => ({ qty: Array(12).fill(0), amount: Array(12).fill(0) });

function aggregate(
    recs: Rec[],
    key: (r: Rec) => string,
    year: 2025 | 2026,
): Map<string, Agg> {
    const out = new Map<string, Agg>();
    for (const r of recs) {
        const k = key(r);
        const agg = out.get(k) ?? zero();
        const price = SKU_BY_ID.get(r.sku)!.price[year];
        const qty = year === 2025 ? r.y25 : r.y26;
        for (let m = 0; m < 12; m++) {
            agg.qty[m] += qty[m];
            agg.amount[m] += qty[m] * price;
        }
        out.set(k, agg);
    }
    return out;
}

export type Filters = {
    year: 2025 | 2026;
    from: number;
    to: number;
    q: string;
};

export function normalizeFilters(
    params: URLSearchParams,
    defaultYear: 2025 | 2026,
): Filters {
    const year = (
        Number(params.get('year')) === 2025
            ? 2025
            : Number(params.get('year')) === 2026
              ? 2026
              : defaultYear
    ) as 2025 | 2026;
    const max = year === 2026 ? LAST_MONTH : 11;
    const clamp = (v: number, d: number) =>
        Number.isFinite(v) ? Math.min(Math.max(Math.trunc(v), 0), 11) : d;
    let from = clamp(Number(params.get('from') ?? 1) - 1, 0);
    let to = clamp(Number(params.get('to') ?? max + 1) - 1, max);
    if (to < from) [from, to] = [to, from];
    return { year, from, to, q: (params.get('q') ?? '').trim() };
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const ratio = (a: number, b: number) => (b > 0 ? a / b : null);

type RowSpec = { key: string; label: string; sub?: string };
export type TableData = ReturnType<typeof buildTable>;

function buildTable(
    cur: Map<string, Agg>,
    prev: Map<string, Agg> | null,
    rows: RowSpec[],
    f: Filters,
) {
    const range: number[] = [];
    for (let m = f.from; m <= f.to; m++) range.push(m);
    const hasData = (m: number) => f.year === 2025 || m <= LAST_MONTH;
    const live = range.filter(hasData);
    const prevOf = (key: string) => prev?.get(key) ?? zero();

    const totals = zero();
    const prevTotals = zero();
    const body = rows.map((spec) => {
        const c = cur.get(spec.key) ?? zero();
        const p = prevOf(spec.key);
        for (const m of range) {
            totals.qty[m] += c.qty[m];
            totals.amount[m] += c.amount[m];
            prevTotals.qty[m] += p.qty[m];
            prevTotals.amount[m] += p.amount[m];
        }
        return { spec, c, p };
    });

    const totalAmount = sum(live.map((m) => totals.amount[m]));
    const figure = (c: Agg, m: number) =>
        hasData(m)
            ? {
                  qty: c.qty[m],
                  amount: c.amount[m],
                  share: ratio(c.amount[m], totals.amount[m]),
              }
            : { qty: null, amount: null, share: null };
    const toRow = (spec: RowSpec, c: Agg, p: Agg, share: number | null) => {
        const amount = sum(live.map((m) => c.amount[m]));
        return {
            key: spec.key,
            label: spec.label,
            sub: spec.sub,
            qty: sum(live.map((m) => c.qty[m])),
            amount,
            share,
            yoy: prev ? ratio(amount, sum(live.map((m) => p.amount[m]))) : null,
            monthly: range.map((m) => figure(c, m)),
        };
    };

    const tableRows = body
        .map(({ spec, c, p }) =>
            toRow(
                spec,
                c,
                p,
                ratio(sum(live.map((m) => c.amount[m])), totalAmount),
            ),
        )
        .filter((r) => (r.amount ?? 0) > 0 || (r.qty ?? 0) > 0)
        .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));

    const totalQty = sum(live.map((m) => totals.qty[m]));
    const prevQty = sum(live.map((m) => prevTotals.qty[m]));
    const prevAmount = sum(live.map((m) => prevTotals.amount[m]));

    // charts: monthly current vs previous year, and the share by row
    const top = tableRows.slice(0, 5);
    const rest = tableRows.slice(5);
    const donut = top.map((r) => ({ label: r.label, value: r.amount ?? 0 }));
    if (rest.length)
        donut.push({ label: '', value: sum(rest.map((r) => r.amount ?? 0)) });

    return {
        months: range.map((m) => monthKey(f.year, m)),
        rows: tableRows,
        total: {
            key: 'total',
            qty: totalQty,
            amount: totalAmount,
            share: 1,
            yoy: null,
            monthly: range.map((m) => figure(totals, m)),
        },
        yoyHeader: {
            qty: prev ? ratio(totalQty, prevQty) : null,
            amount: prev ? ratio(totalAmount, prevAmount) : null,
            monthly: range.map((m) =>
                prev && hasData(m)
                    ? ratio(totals.amount[m], prevTotals.amount[m])
                    : null,
            ),
        },
        kpi: {
            qty: totalQty,
            amount: totalAmount,
            yoyQty: prev ? ratio(totalQty, prevQty) : null,
            yoyAmount: prev ? ratio(totalAmount, prevAmount) : null,
        },
        chart: {
            months: range.map((m) => monthKey(f.year, m)),
            current: range.map((m) => (hasData(m) ? totals.amount[m] : null)),
            previous: prev
                ? range.map((m) => prevTotals.amount[m])
                : range.map(() => null),
            donut,
        },
    };
}

function recsFor(storeIds: Set<string>, skuId?: string) {
    return RECS.filter(
        (r) => storeIds.has(r.store) && (!skuId || r.sku === skuId),
    );
}

const matches = (text: string, q: string) =>
    !q || text.toLowerCase().includes(q.toLowerCase());

// ---------------------------------------------------------------- screens

export function level1(scope: Scope, f: Filters) {
    const ids = new Set(storesInScope(scope).map((s) => s.id));
    const recs = recsFor(ids);
    const chainOf = new Map(STORES.map((s) => [s.id, s.chainId]));
    const key = (r: Rec) => chainOf.get(r.store)!;
    const cur = aggregate(recs, key, f.year);
    const prev = f.year === 2026 ? aggregate(recs, key, 2025) : null;
    const rows = chainsInScope(scope)
        .filter((c) => matches(c.name, f.q))
        .map((c) => ({ key: c.id, label: c.name }));
    return { ...buildTable(cur, prev, rows, f), targets: targets(recs) };
}

export function level2(scope: Scope, f: Filters, chainId: string | null) {
    const chains = chainsInScope(scope);
    const chain = chains.find((c) => c.id === chainId) ?? chains[0];
    const stores = storesInScope(scope).filter((s) => s.chainId === chain?.id);
    const recs = recsFor(new Set(stores.map((s) => s.id)));
    const cur = aggregate(recs, (r) => r.store, f.year);
    const prev = f.year === 2026 ? aggregate(recs, (r) => r.store, 2025) : null;
    const rows = stores
        .filter((s) => matches(s.name, f.q))
        .map((s) => ({ key: s.id, label: s.name }));
    return { ...buildTable(cur, prev, rows, f), chain, chains };
}

export function level3(
    scope: Scope,
    f: Filters,
    chainId: string | null,
    storeId: string | null,
) {
    const chains = chainsInScope(scope);
    const chain =
        chains.find((c) => c.id === chainId) ??
        chains.find(
            (c) => c.id === STORES.find((s) => s.id === storeId)?.chainId,
        ) ??
        chains[0];
    const stores = storesInScope(scope).filter((s) => s.chainId === chain?.id);
    const store = stores.find((s) => s.id === storeId) ?? stores[0];
    const recs = recsFor(new Set(store ? [store.id] : []));
    const cur = aggregate(recs, (r) => r.sku, f.year);
    const prev = f.year === 2026 ? aggregate(recs, (r) => r.sku, 2025) : null;
    const rows = SKUS.filter((s) => matches(`${s.type} ${s.spec}`, f.q)).map(
        (s) => ({ key: s.id, label: s.type, sub: s.spec }),
    );
    return { ...buildTable(cur, prev, rows, f), chain, chains, store, stores };
}

// Yearly targets by product x spec (all stores in scope): qty rounded to 100, amount = qty x unit price.
function targets(recs: Rec[]) {
    const cur = aggregate(recs, (r) => r.sku, 2026);
    const prev = aggregate(recs, (r) => r.sku, 2025);
    const orders = new Map<string, Agg>();
    for (const r of recs) {
        const agg = orders.get(r.sku) ?? zero();
        for (let m = 0; m < 12; m++) {
            agg.qty[m] += r.o26[m];
            agg.amount[m] += r.o26[m] * SKU_BY_ID.get(r.sku)!.price[2026];
        }
        orders.set(r.sku, agg);
    }
    const live = Array.from({ length: LAST_MONTH + 1 }, (_, m) => m);
    const raw = SKUS.filter((s) => cur.has(s.id)).map((s) => {
        const c = cur.get(s.id)!;
        const p = prev.get(s.id)!;
        const o = orders.get(s.id) ?? zero();
        const qty = sum(live.map((m) => c.qty[m]));
        const qty2025 = sum(live.map((m) => p.qty[m]));
        const fullYear2025 = sum(p.qty);
        const targetQty = SKU_HAS_TARGET.get(s.id)
            ? Math.max(
                  100,
                  Math.round(
                      (fullYear2025 * SKU_TARGET_FACTOR.get(s.id)!) / 100,
                  ) * 100,
              )
            : null;
        return {
            name: s.spec ? `${s.type} (${s.spec})` : s.type,
            qty,
            amount: sum(live.map((m) => c.amount[m])),
            qty2025,
            amount2025: sum(live.map((m) => p.amount[m])),
            targetQty,
            targetAmount: targetQty == null ? null : targetQty * s.price[2026],
            unitPrice: s.price[2026],
            ordersJanApr: sum(o.qty.slice(0, 4)),
            orders: o.qty.map((q, m) => ({ qty: q, amount: o.amount[m] })),
        };
    });
    const totalAmount = sum(raw.map((r) => r.amount));
    const rows = raw
        .map((r) => ({
            ...r,
            share: ratio(r.amount, totalAmount),
            yoy: ratio(r.qty, r.qty2025),
            achievement: r.targetQty ? r.qty / r.targetQty : null,
        }))
        .sort((a, b) => b.qty - a.qty);
    const totalOrders = Array.from({ length: 12 }, (_, m) => ({
        qty: sum(raw.map((r) => r.orders[m].qty)),
        amount: sum(raw.map((r) => r.orders[m].amount)),
    }));
    const tq = sum(raw.map((r) => r.targetQty ?? 0));
    const ta = sum(raw.map((r) => r.targetAmount ?? 0));
    const targeted = raw.filter((r) => r.targetQty);
    return {
        rows,
        total: {
            name: '',
            qty: sum(raw.map((r) => r.qty)),
            amount: totalAmount,
            share: 1,
            achievement: null,
            qty2025: sum(raw.map((r) => r.qty2025)),
            amount2025: sum(raw.map((r) => r.amount2025)),
            yoy: null,
            targetQty: null,
            targetAmount: null,
            unitPrice: null,
            ordersJanApr: sum(raw.map((r) => r.ordersJanApr)),
            orders: totalOrders,
        },
        summary: {
            targetAmount: ta,
            actualAmount: sum(targeted.map((r) => r.amount)),
            achievement: ratio(sum(targeted.map((r) => r.qty)), tq),
        },
    };
}
