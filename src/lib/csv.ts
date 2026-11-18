/** RFC 4180-тэй ойролцоо CSV задлагч (хашилттай талбар, таслал, шинэ мөр). Толгой мөрийг түлхүүр болгоно. */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], cur = '', q = false;
  const src = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"') { if (src[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && src[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some((x) => x.trim() !== '')) rows.push(row); row = []; }
    else cur += c;
  }
  row.push(cur);
  if (row.some((x) => x.trim() !== '')) rows.push(row);
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()]).filter(([, v]) => v !== '')));
}

export const IMPORT_TEMPLATE = 'name,countrySlug,city,type,degreeLevels,subjects,sourceUrl,sourceName,academicYear,rankProvider,rank,rankYear,rankEdition,rankSourceUrl,tuitionLevel,tuitionAnnualUsd,tuitionAcademicYear,tuitionSourceUrl\n';
