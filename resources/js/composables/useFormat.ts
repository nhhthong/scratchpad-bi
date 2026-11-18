import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export type AmountUnit = 'yen' | 'thousand' | 'million';

// Number, percent and month formatting that follows the active UI locale.
// Follows the source workbook: blank stays blank, 0 shows as "0", negatives show as (1,234).
export function useFormat() {
    const { locale } = useI18n();
    const tag = computed(() => (locale.value === 'ja' ? 'ja-JP' : 'en-US'));

    const group = (value: number, digits = 0): string =>
        new Intl.NumberFormat(tag.value, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        }).format(Math.abs(value));

    const signed = (value: number, text: string): string =>
        value < 0 ? `(${text})` : text;

    const int = (value?: number | null): string =>
        value == null ? '' : signed(value, group(value));

    // Amounts in yen, thousand yen or million yen (1 decimal).
    const amount = (
        value?: number | null,
        unit: AmountUnit = 'yen',
    ): string => {
        if (value == null) {
            return '';
        }

        if (unit === 'thousand') {
            return signed(value, group(Math.round(value / 1_000)));
        }

        if (unit === 'million') {
            return signed(value, group(value / 1_000_000, 1));
        }

        return int(value);
    };

    const percent = (value?: number | null, digits = 0): string =>
        value == null
            ? ''
            : new Intl.NumberFormat(tag.value, {
                  style: 'percent',
                  minimumFractionDigits: digits,
                  maximumFractionDigits: digits,
              }).format(value);

    // "2026-03" -> "3月" (ja) / "Mar" (en)
    const month = (iso: string): string => {
        const [year, m] = iso.split('-').map(Number);

        return new Intl.DateTimeFormat(tag.value, { month: 'short' }).format(
            new Date(year, m - 1, 1),
        );
    };

    // Red for negatives, as in the source workbook.
    const negative = (value?: number | null): string =>
        value != null && value < 0 ? 'text-red-600 dark:text-red-400' : '';

    return { int, amount, percent, month, negative };
}
