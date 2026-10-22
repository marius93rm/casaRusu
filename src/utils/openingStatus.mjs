const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const weekdayFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Bucharest',
  weekday: 'long',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function minutesAfterMidnight(value) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Calculate the current and next opening window in the restaurant's time zone.
 * @param {ReadonlyArray<{readonly daysOfWeek: readonly string[]; readonly opens: string; readonly closes: string}>} openingHours
 * @param {Date} [now]
 */
export function calculateOpeningStatus(openingHours, now = new Date()) {
  if (!Array.isArray(openingHours) || Number.isNaN(now.getTime())) return null;

  const parts = Object.fromEntries(weekdayFormatter.formatToParts(now).map(({ type, value }) => [type, value]));
  const weekday = parts.weekday;
  const dayIndex = weekdays.indexOf(weekday);
  if (dayIndex === -1) return null;

  const currentMinutes = Number(parts.hour) * 60 + Number(parts.minute);
  const todaySchedules = openingHours
    .filter((schedule) => schedule.daysOfWeek.includes(weekday))
    .sort((a, b) => minutesAfterMidnight(a.opens) - minutesAfterMidnight(b.opens));

  for (const schedule of todaySchedules) {
    if (currentMinutes >= minutesAfterMidnight(schedule.opens) && currentMinutes < minutesAfterMidnight(schedule.closes)) {
      return { state: 'open', closesAt: schedule.closes };
    }
  }

  const year = Number(parts.year);
  const month = Number(parts.month);
  const dayOfMonth = Number(parts.day);
  for (let daysAhead = 0; daysAhead <= 7; daysAhead += 1) {
    const candidateDate = new Date(Date.UTC(year, month - 1, dayOfMonth + daysAhead, 12));
    const candidateWeekday = weekdays[candidateDate.getUTCDay()];
    const schedules = openingHours
      .filter((schedule) => schedule.daysOfWeek.includes(candidateWeekday))
      .sort((a, b) => minutesAfterMidnight(a.opens) - minutesAfterMidnight(b.opens));

    for (const schedule of schedules) {
      if (daysAhead === 0 && currentMinutes >= minutesAfterMidnight(schedule.opens)) continue;
      return {
        state: 'closed',
        opensAt: schedule.opens,
        daysAhead,
        weekday: candidateWeekday,
      };
    }
  }

  return { state: 'closed', opensAt: null, daysAhead: null, weekday: null };
}
