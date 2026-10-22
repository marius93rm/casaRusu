import assert from 'node:assert/strict';
import { calculateOpeningStatus } from '../src/utils/openingStatus.mjs';

const openingHours = [
  { daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '11:00', closes: '22:30' },
  { daysOfWeek: ['Saturday', 'Sunday'], opens: '11:00', closes: '23:00' },
];

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

console.log('Controllo orari superato: stati aperto/chiuso, prossima apertura, weekend e cambio ora Bucharest.');
