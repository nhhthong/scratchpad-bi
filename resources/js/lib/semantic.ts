// Semantic colors used across the BI screens: positive, negative, warning, neutral.
export type Tone = 'positive' | 'negative' | 'warning' | 'neutral';

export const toneText: Record<Tone, string> = {
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    neutral: 'text-muted-foreground',
};

export const toneBar: Record<Tone, string> = {
    positive: 'bg-emerald-500',
    negative: 'bg-red-500',
    warning: 'bg-amber-500',
    neutral: 'bg-muted-foreground/40',
};

// Soft pill colors for badges (background + text + border).
export const toneBadge: Record<Tone, string> = {
    positive:
        'border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    negative: 'border-red-600/20 bg-red-500/10 text-red-700 dark:text-red-400',
    warning:
        'border-amber-600/25 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    neutral: 'border-border bg-muted text-muted-foreground',
};

// Year-over-year ratio: 1.0 = same as last year.
// Up is positive; a small dip (90-100%) is a warning, a drop below 90% is negative.
export function yoyTone(value?: number | null): Tone {
    if (value == null) {
        return 'neutral';
    }

    if (value >= 1) {
        return 'positive';
    }

    return value >= 0.9 ? 'warning' : 'negative';
}

// Achievement against target: 1.0 = target reached.
export function achievementTone(value?: number | null): Tone {
    if (value == null) {
        return 'neutral';
    }

    if (value >= 1) {
        return 'positive';
    }

    return value >= 0.6 ? 'warning' : 'negative';
}
