import { describe, expect, it } from 'vitest';
import { computeCost } from './cost';

const base = { tuitionAnnual: 10000, accommodationMonthly: 500, foodMonthly: 300, transportMonthly: 50, otherMonthly: 150, insuranceAnnual: 600, booksAnnual: 400, visaOnce: 200, flightPerTrip: 800, trips: 2, months: 24 };

describe('computeCost', () => {
  it('сар, жил, нийт зардлыг зөв тооцно (USD)', () => {
    const r = computeCost(base, 1, 3500);
    expect(r.monthlyLiving.cur).toBe(1000);
    expect(r.annualRecurring.cur).toBe(10000 + 600 + 400 + 12000);
    expect(r.oneTime.cur).toBe(200 + 1600);
    expect(r.total.cur).toBe(23000 * 2 + 1800);
    expect(r.monthlyAverage.cur).toBeCloseTo(r.total.cur / 24);
  });
  it('USD ба MNT рүү ханшаар хөрвүүлнэ', () => {
    const r = computeCost(base, 1, 3500);
    expect(r.total.usd).toBe(47800);
    expect(r.total.mnt).toBe(47800 * 3500);
  });
  it('MNT-ээр оруулбал USD болгож хөрвүүлнэ', () => {
    const r = computeCost({ ...base, tuitionAnnual: 3500000, accommodationMonthly: 0, foodMonthly: 0, transportMonthly: 0, otherMonthly: 0, insuranceAnnual: 0, booksAnnual: 0, visaOnce: 0, flightPerTrip: 0, months: 12 }, 1 / 3500, 3500);
    expect(r.total.usd).toBeCloseTo(1000);
    expect(r.total.mnt).toBeCloseTo(3500000);
  });
  it('ханш тохируулаагүй бол хөрвүүлэлт null (таамаглахгүй)', () => {
    const r = computeCost(base, null, null);
    expect(r.total.usd).toBeNull();
    expect(r.total.mnt).toBeNull();
    const usdOnly = computeCost(base, 1, null);
    expect(usdOnly.total.usd).not.toBeNull();
    expect(usdOnly.total.mnt).toBeNull();
  });
  it('сөрөг/хоосон утга, 0 сарыг аюулгүй боловсруулна', () => {
    const r = computeCost({ ...base, tuitionAnnual: -5, months: 0, trips: NaN as any }, 1, 3500);
    expect(Number.isFinite(r.total.cur)).toBe(true);
    expect(r.annualRecurring.cur).toBe(600 + 400 + 12000);
  });
});
