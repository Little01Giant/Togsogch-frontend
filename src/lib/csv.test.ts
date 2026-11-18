import { describe, expect, it } from 'vitest';
import { parseCsv } from './csv';

describe('parseCsv', () => {
  it('толгой мөр, хоосон утгыг хасна', () => {
    expect(parseCsv('name,city\nA,Tokyo\nB,')).toEqual([{ name: 'A', city: 'Tokyo' }, { name: 'B' }]);
  });
  it('хашилттай талбар дахь таслал, давхар хашилт, шинэ мөр', () => {
    const r = parseCsv('name,description\n"Uni, The ""Best""","line1\nline2"\n');
    expect(r).toEqual([{ name: 'Uni, The "Best"', description: 'line1\nline2' }]);
  });
  it('CRLF, BOM, хоосон мөр', () => {
    expect(parseCsv('﻿a,b\r\n1,2\r\n\r\n3,4')).toEqual([{ a: '1', b: '2' }, { a: '3', b: '4' }]);
  });
  it('хоосон оролт', () => { expect(parseCsv('')).toEqual([]); });
});
