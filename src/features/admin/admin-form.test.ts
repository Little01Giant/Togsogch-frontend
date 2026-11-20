import { describe, expect, it } from 'vitest';
import { getPath, RESOURCES, setPath } from './config';
import { validate } from './validate';

describe('dotted path helpers', () => {
  it('getPath / setPath nested утга', () => {
    const o = setPath({ a: 1 }, 'source.sourceName', 'QS');
    expect(getPath(o, 'source.sourceName')).toBe('QS');
    expect(o).toEqual({ a: 1, source: { sourceName: 'QS' } });
  });
  it('setPath анхны объектыг өөрчлөхгүй (immutable)', () => {
    const orig = { x: { y: 1 } };
    const next = setPath(orig, 'x.y', 2);
    expect(orig.x.y).toBe(1);
    expect((next.x as { y: number }).y).toBe(2);
  });
});

describe('admin form validation', () => {
  const uni = RESOURCES.universities.fields;
  it('заавал бөглөх талбар хоосон бол алдаа', () => {
    const e = validate(uni, {});
    expect(Object.keys(e)).toContain('name');
    expect(Object.keys(e)).toContain('countryId');
  });
  it('зөв өгөгдөлд алдаа байхгүй', () => {
    expect(validate(uni, { name: 'Test', countryId: 'abc' })).toEqual({});
  });
  it('рейтингийн мөрийн заавал талбарыг (байгууллага, он) шалгана', () => {
    const e = validate(uni, { name: 'Test', countryId: 'abc', rankings: [{ rank: 5 }] });
    expect(e['rankings.0.provider']).toBeTruthy();
    expect(e['rankings.0.year']).toBeTruthy();
  });
  it('нөөц бүрт талбарын тохиргоо байна', () => {
    for (const cfg of Object.values(RESOURCES)) expect(cfg.fields.length).toBeGreaterThan(0);
  });
});
