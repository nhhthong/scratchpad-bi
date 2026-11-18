export type MonthlyFigure = {
    qty: number;
    amount: number;
    share: number;
};

export type SalesRow = {
    key: string;
    label: string;
    sub?: string;
    qty: number;
    amount: number;
    share: number;
    yoy?: number | null;
    monthly: MonthlyFigure[];
};

export type ProductTargetRow = {
    name: string;
    qty: number;
    amount: number;
    share: number;
    achievement: number | null;
    qty2025: number;
    amount2025: number;
    yoy: number | null;
    targetQty: number | null;
    targetAmount: number | null;
    unitPrice: number | null;
};
