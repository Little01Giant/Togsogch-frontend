import { describe, expect, it } from 'vitest';
import { fmtDate, fmtUsd, t } from './index';

function walk(o: unknown, path = ''): [string, string][] {
  if (typeof o === 'string') return [[path, o]];
  if (Array.isArray(o)) return o.flatMap((v, i) => walk(v, `${path}[${i}]`));
  if (o && typeof o === 'object') return Object.entries(o).flatMap(([k, v]) => walk(v, path ? `${path}.${k}` : k));
  return [];
}

describe('Монгол орчуулгын толь', () => {
  const strings = walk(t);
  it('хоосон утга байхгүй', () => {
    expect(strings.filter(([, v]) => !v.trim())).toEqual([]);
  });
  it('үндсэн UI текст кирилл үсэг агуулсан (англи placeholder биш)', () => {
    const ALLOWED_LATIN = /^(IELTS|TOEFL|SAT|ACT|GRE|GMAT|QS World|QS Asia|THE|ARWU|Foundation|English|THE World|THE Asia|Coursework|Research|Professional|Executive|Holland|RIASEC|PhD|Dev|dev|Google|QPay|Temuul)/;
    const bad = strings.filter(([p, v]) => !/[Ѐ-ӿ]/.test(v) && !ALLOWED_LATIN.test(v) && !/^[\d\s–,.$+/%:()-]+$/.test(v) && !p.endsWith('.emoji') && !p.includes('labelsRanking') && !p.includes('tuitionRanges') && !p.includes('labelsAdmission'));
    expect(bad).toEqual([]);
  });
  it('мэдээлэл байхгүй гэсэн мессеж тогтмол', () => {
    expect(t.common.noData).toBe('Мэдээлэл байхгүй');
  });
});

describe('форматлагч', () => {
  it('огноо YYYY-MM-DD (Улаанбаатарын цагаар)', () => {
    expect(fmtDate('2026-03-05T10:00:00Z')).toBe('2026-03-05');
    expect(fmtDate(null)).toBeNull();
  });
  it('USD дүн таслалтай', () => {
    expect(fmtUsd(12500)).toBe('12,500 USD');
  });
});
