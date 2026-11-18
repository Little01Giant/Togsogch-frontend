/** Суралцах нийт зардлын тооцоо (цэвэр функц). Бүх дүн сонгосон валютаар; USD/MNT руу ханшаар хөрвүүлнэ. */
export interface CostInput {
  tuitionAnnual: number; accommodationMonthly: number; foodMonthly: number; transportMonthly: number; otherMonthly: number;
  insuranceAnnual: number; booksAnnual: number; visaOnce: number; flightPerTrip: number; trips: number; months: number;
}
export interface Money { cur: number; usd: number | null; mnt: number | null }
export interface CostResult { monthlyLiving: Money; monthlyAverage: Money; annualRecurring: Money; oneTime: Money; total: Money }

const n = (v: number | undefined) => (Number.isFinite(v) && (v as number) > 0 ? (v as number) : 0);

/**
 * @param toUsd 1 нэгж сонгосон валют = хэдэн USD (USD бол 1; MNT бол 1/ханш)
 * @param usdToMnt 1 USD = хэдэн MNT (null бол ханш тохируулаагүй → хөрвүүлэлтгүй)
 */
export function computeCost(i: CostInput, toUsd: number | null, usdToMnt: number | null): CostResult {
  const months = Math.max(1, n(i.months));
  const monthlyLiving = n(i.accommodationMonthly) + n(i.foodMonthly) + n(i.transportMonthly) + n(i.otherMonthly);
  const annualRecurring = n(i.tuitionAnnual) + n(i.insuranceAnnual) + n(i.booksAnnual) + monthlyLiving * 12;
  const oneTime = n(i.visaOnce) + n(i.flightPerTrip) * n(i.trips);
  const total = annualRecurring * (months / 12) + oneTime;
  const conv = (cur: number): Money => {
    const usd = toUsd != null ? cur * toUsd : null;
    return { cur, usd, mnt: usd != null && usdToMnt != null ? usd * usdToMnt : null };
  };
  return { monthlyLiving: conv(monthlyLiving), monthlyAverage: conv(total / months), annualRecurring: conv(annualRecurring), oneTime: conv(oneTime), total: conv(total) };
}
