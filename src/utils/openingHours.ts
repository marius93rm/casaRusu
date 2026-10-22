import { siteData } from '../data/site';
import type { OpeningDay, SiteLocale } from '../data/site';

type OpeningHourGroup = {
  daysOfWeek: readonly OpeningDay[];
  opens: string;
  closes: string;
};

export function formatOpeningHours(groups: readonly OpeningHourGroup[], locale: SiteLocale): string[] {
  return groups.map(({ daysOfWeek, opens, closes }) => {
    const localizedDays = daysOfWeek.map((day) => siteData.copy[locale].visit.openingStatus.weekdays[day]);
    const dayRange = localizedDays.length > 1
      ? `${localizedDays[0]}–${localizedDays[localizedDays.length - 1]}`
      : localizedDays[0];

    return `${dayRange} · ${opens}–${closes}`;
  });
}
