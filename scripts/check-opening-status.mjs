import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { calculateOpeningStatus } from '../src/utils/openingStatus.mjs';
import { prefixFor } from './i18n.mjs';
import { locales } from '../src/i18n/config.ts';

const openingHours = [
  { daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '11:00', closes: '22:30' },
  { daysOfWeek: ['Saturday', 'Sunday'], opens: '11:00', closes: '23:00' },
];
const openingStatusComponent = await readFile(new URL('../src/components/OpeningStatus.astro', import.meta.url), 'utf8');

assert.match(
  openingStatusComponent,
  /document\.addEventListener\('visibilitychange',[\s\S]*document\.visibilityState === 'visible'[\s\S]*updateStatus\(\)/,
  'opening status should refresh when a background tab returns to the foreground',
);
assert.match(
  openingStatusComponent,
  /window\.addEventListener\('pageshow', updateStatus\)/,
  'opening status should refresh when a page is restored from the back-forward cache',
);

assert.deepEqual(
  calculateOpeningStatus(openingHours, new Date('2026-10-26T08:59:00Z')),
  { state: 'closed', opensAt: '11:00', daysAhead: 0, weekday: 'Monday' },
  'a weekday before opening should show today’s opening time in Bucharest',
);
assert.deepEqual(
  calculateOpeningStatus(openingHours, new Date('2026-10-26T09:00:00Z')),
  { state: 'open', closesAt: '22:30' },
  'opening time should be inclusive',
);
assert.deepEqual(
  calculateOpeningStatus(openingHours, new Date('2026-10-26T20:30:00Z')),
  { state: 'closed', opensAt: '11:00', daysAhead: 1, weekday: 'Tuesday' },
  'closing time should be exclusive and point to the next weekday',
);
assert.deepEqual(
  calculateOpeningStatus(openingHours, new Date('2026-10-24T09:00:00Z')),
  { state: 'open', closesAt: '23:00' },
  'weekend hours should use the weekend closing time',
);
assert.deepEqual(
  calculateOpeningStatus(openingHours, new Date('2026-10-25T08:30:00Z')),
  { state: 'closed', opensAt: '11:00', daysAhead: 0, weekday: 'Sunday' },
  'the Bucharest timezone offset change should not shift Sunday opening hours',
);

for (const locale of locales) {
  for (const route of ['/', '/meniu/', '/preparate/snitel-cotlet-porc/']) {
    const html = await readFile(new URL(`../dist/${prefixFor(locale)}${route.slice(1)}index.html`, import.meta.url), 'utf8');
    const statuses = html.match(/<p\b(?=[^>]*\bdata-opening-status\b)[^>]*>/g) ?? [];
    assert.equal(statuses.length, 1, `${locale}${route}: opening status must appear once`);
    assert.match(statuses[0], /\bdata-opening-hours=/, `${locale}${route}: opening hours must be attached to the status`);
    assert.match(statuses[0], /\bdata-opening-copy=/, `${locale}${route}: opening status must use localized copy`);
  }
}

console.log('Controllo orari superato: stati aperto/chiuso, prossima apertura, weekend, cambio ora Bucharest, refresh al ritorno in primo piano e copertura sulle 18 pagine.');
