import { t } from '@/i18n';

interface Credit { sourceUrl: string; license: string; licenseUrl?: string; author?: string }
interface DescriptionCredit { sourceName: string; sourceUrl: string; license: string; translatedByAi?: boolean }
export interface UniversityMediaInfo { logo?: Credit; cover?: Credit; description?: DescriptionCredit }

const L = t.s.uni.credits;
const ext = 'underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm';

function Img({ label, c }: { label: string; c: Credit }) {
  return (
    <span>{label}: <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className={ext}>{L.commons}</a>
      {' · '}{c.licenseUrl ? <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer nofollow" className={ext}>{c.license}</a> : c.license}
      {c.author ? ` · ${c.author}` : ''}
    </span>
  );
}

/** Лого, зураг, танилцуулгын эх сурвалж, лиценз, зохиогч (CC BY / CC BY-SA нөхцөлийн дагуу заавал харуулна). */
export function MediaCredits({ media }: { media?: UniversityMediaInfo | null }) {
  if (!media || (!media.logo && !media.cover && !media.description)) return null;
  return (
    <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-caption text-muted-foreground">
      {media.cover && <Img label={L.photo} c={media.cover} />}
      {media.logo && <Img label={L.logo} c={media.logo} />}
      {media.description && (
        <span>{L.text}: <a href={media.description.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className={ext}>{media.description.sourceName}</a> · {media.description.license}{media.description.translatedByAi ? ` · ${L.aiTranslated}` : ''}</span>
      )}
    </p>
  );
}
