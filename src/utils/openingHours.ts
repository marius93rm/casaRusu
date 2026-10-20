import type { OpeningDay, SiteLocale } from '../data/site';

type OpeningHourGroup = {
  daysOfWeek: readonly OpeningDay[];
  opens: string;
  closes: string;
};

const weekdayLabels: Record<SiteLocale, Record<OpeningDay, string>> = {
  ro: {
    Monday: 'Luni',
    Tuesday: 'marți',
    Wednesday: 'miercuri',
    Thursday: 'joi',
    Friday: 'vineri',
    Saturday: 'Sâmbătă',
    Sunday: 'duminică',
  },
  en: {
    Monday: 'Monday',
    Tuesday: 'Tuesday',
    Wednesday: 'Wednesday',
    Thursday: 'Thursday',
    Friday: 'Friday',
    Saturday: 'Saturday',
    Sunday: 'Sunday',
  },
};

export function formatOpeningHours(groups: readonly OpeningHourGroup[], locale: SiteLocale): string[] {
  return groups.map(({ daysOfWeek, opens, closes }) => {
    const localizedDays = daysOfWeek.map((day) => weekdayLabels[locale][day]);
    const dayRange = localizedDays.length > 1
      ? `${localizedDays[0]}–${localizedDays[localizedDays.length - 1]}`
      : localizedDays[0];

    return `${dayRange} · ${opens}–${closes}`;
  });
}
