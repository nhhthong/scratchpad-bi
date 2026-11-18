import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

// Number, percent and month formatting that follows the active UI locale.
export function useFormat() {
    const { locale } = useI18n();
    const tag = computed(() => (locale.value === 'ja' ? 'ja-JP' : 'en-US'));

    const int = (value: number): string =>
        new Intl.NumberFormat(tag.value).format(value);

    // Amounts in yen, thousand yen or million yen (1 decimal).
    const amount = (
        value: number,
        unit: 'yen' | 'thousand' | 'million',
    ): string => {
        if (unit === 'thousand') {
            return int(Math.round(value / 1_000));
        }

        if (unit === 'million') {
            return new Intl.NumberFormat(tag.value, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
            }).format(value / 1_000_000);
        }

        return int(value);
    };

    const percent = (value?: number | null, digits = 1): string =>
        value == null
            ? '-'
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

    return { int, amount, percent, month };
}
