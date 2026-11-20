/**
 * Улсуудыг Монгол сурагчид ач холбогдолтой дарааллаар харуулна (редакцийн дараалал, өгөгдөл биш):
 * Монголчуудын хамгийн их сонирхдог чиглэлүүд эхэнд; Монгол (дотоодын сургууль) Польшийн өмнө; үлдсэн нь нэрээр нь.
 * Жагсаалтад байхгүй улс төгсгөлд, өөрсдийн дарааллаараа (нэрээр) орно.
 */
const PRIORITY = [
  'south-korea', 'japan', 'germany', 'usa', 'uk', 'australia', 'china', 'russia', 'canada', 'hungary', 'czech-republic',
  'france', 'singapore', 'new-zealand', 'spain', 'italy', 'mongolia', 'poland', 'finland', 'sweden', 'denmark', 'austria', 'switzerland', 'belgium', 'ireland', 'india',
];
const RANK = new Map(PRIORITY.map((slug, i) => [slug, i]));

/** Нүүр хуудсанд анхнаасаа харуулах улсууд: Итали хүртэл (үлдсэнийг «Бүгдийг харах»-аар нээнэ). */
const MAIN_END = PRIORITY.indexOf('italy');
export const isMainCountry = (slug: string) => (RANK.get(slug) ?? Infinity) <= MAIN_END;

/** Тогтвортой эрэмбэ: жагсаалтад байгаа улсууд тогтоосон дарааллаар, бусад нь анхны дарааллаа хадгалж төгсгөлд. */
export function byMongolianPriority<T extends { slug: string }>(items: readonly T[]): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => (RANK.get(a.item.slug) ?? 1e6) - (RANK.get(b.item.slug) ?? 1e6) || a.index - b.index)
    .map((x) => x.item);
}
