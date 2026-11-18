export type MonthlyFigure = {
    qty: number | null;
    amount: number | null;
    share: number | null;
};

export type SalesRow = {
    key: string;
    label: string;
    sub?: string;
    qty: number | null;
    amount: number | null;
    share: number | null;
    yoy?: number | null;
    monthly: MonthlyFigure[];
};

export type OrderFigure = {
    qty: number | null;
    amount: number | null;
};

export type ProductTargetRow = {
    name: string;
    qty: number | null;
    amount: number | null;
    share: number | null;
    achievement: number | null;
    qty2025: number | null;
    amount2025: number | null;
    yoy: number | null;
    targetQty: number | null;
    targetAmount: number | null;
    unitPrice: number | null;
    ordersJanApr: number | null;
    orders: OrderFigure[];
};
