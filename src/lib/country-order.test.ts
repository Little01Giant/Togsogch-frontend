import { describe, expect, it } from 'vitest';
import { byMongolianPriority, isMainCountry } from './country-order';

describe('byMongolianPriority', () => {
  it('тогтоосон дарааллаар, жагсаалтад байхгүй улс төгсгөлд анхны дарааллаараа', () => {
    const items = [{ slug: 'australia' }, { slug: 'zz-new' }, { slug: 'south-korea' }, { slug: 'usa' }, { slug: 'aa-new' }, { slug: 'germany' }, { slug: 'japan' }];
    expect(byMongolianPriority(items).map((c) => c.slug)).toEqual(['south-korea', 'japan', 'germany', 'usa', 'australia', 'zz-new', 'aa-new']);
  });
  it('isMainCountry: Итали хүртэл true, Монгол/Польш болон жагсаалтад байхгүй улс false', () => {
    expect(isMainCountry('south-korea')).toBe(true);
    expect(isMainCountry('italy')).toBe(true);
    expect(isMainCountry('mongolia')).toBe(false);
    expect(isMainCountry('poland')).toBe(false);
    expect(isMainCountry('unknown-country')).toBe(false);
  });
  it('оролтыг өөрчлөхгүй', () => {
    const items = [{ slug: 'usa' }, { slug: 'japan' }];
    byMongolianPriority(items);
    expect(items.map((c) => c.slug)).toEqual(['usa', 'japan']);
  });
});
