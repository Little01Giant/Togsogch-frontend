import { t } from '@/i18n';

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'tags' | 'checkbox' | 'group' | 'json' | 'date' | 'ref';
export interface Field {
  name: string; label: string; type: FieldType; required?: boolean; options?: { value: string; label: string }[];
  fields?: Field[]; ref?: { resource: string; labelKey: string }; hint?: string; section?: string;
}
export interface ResourceConfig { key: string; title: string; columns: { key: string; label: string; render?: (row: any) => React.ReactNode }[]; fields: Field[]; hasStatus: boolean; defaults?: any }

const U = t.universities;
const opt = (m: Record<string, string>) => Object.entries(m).map(([value, label]) => ({ value, label }));
const VERIFY = opt({ unverified: 'Баталгаажаагүй', in_review: 'Хянаж байгаа', verified: 'Баталгаажсан', outdated: 'Хуучирсан' });
const RELIABILITY = opt({ primary: 'Анхдагч (албан ёсны)', secondary: 'Хоёрдогч', estimate: 'Тооцоолсон', unknown: 'Тодорхойгүй' });
const SOURCE_TYPES = opt({ official_university: 'Их сургуулийн албан ёсны сайт', official_admission: 'Албан ёсны элсэлтийн хуудас', ranking_provider: 'Рейтингийн байгууллага', government: 'Төрийн байгууллага', scholarship_org: 'Тэтгэлгийн байгууллага', exam_provider: 'Шалгалтын байгууллага', labor_research: 'Хөдөлмөрийн зах зээлийн судалгаа', other: 'Бусад' });

const SOURCE: Field[] = [
  { name: 'source.sourceName', label: 'Эх сурвалжийн нэр', type: 'text', section: 'Эх сурвалж' },
  { name: 'source.sourceUrl', label: 'Эх сурвалжийн холбоос (URL)', type: 'text', section: 'Эх сурвалж' },
  { name: 'source.sourceType', label: 'Эх сурвалжийн төрөл', type: 'select', options: SOURCE_TYPES, section: 'Эх сурвалж' },
  { name: 'source.academicYear', label: 'Хичээлийн жил / хэвлэл', type: 'text', section: 'Эх сурвалж' },
  { name: 'source.fetchedAt', label: 'Цуглуулсан огноо', type: 'date', section: 'Эх сурвалж' },
  { name: 'source.verifiedAt', label: 'Баталгаажуулсан огноо', type: 'date', section: 'Эх сурвалж' },
  { name: 'source.verificationStatus', label: 'Баталгаажуулалтын төлөв', type: 'select', options: VERIFY, section: 'Эх сурвалж' },
  { name: 'source.reliabilityStatus', label: 'Найдвартай байдал', type: 'select', options: RELIABILITY, section: 'Эх сурвалж' },
];

const status = { key: 'status', label: t.common.status, render: (r: any) => r.status };

export const RESOURCES: Record<string, ResourceConfig> = {
  countries: {
    key: 'countries', title: t.admin.countries, hasStatus: true,
    columns: [{ key: 'flag', label: '' }, { key: 'nameMn', label: t.common.name }, { key: 'nameEn', label: 'English' }, { key: 'code', label: 'Код' }, status],
    fields: [
      { name: 'nameMn', label: 'Монгол нэр', type: 'text', required: true }, { name: 'nameEn', label: 'Англи нэр', type: 'text', required: true },
      { name: 'code', label: 'Улсын код (ISO)', type: 'text', required: true }, { name: 'flag', label: 'Туг (emoji)', type: 'text' }, { name: 'region', label: 'Бүс нутаг', type: 'text' },
      { name: 'overview', label: t.countries.overview, type: 'textarea' }, { name: 'educationSystem', label: t.countries.education, type: 'textarea' },
      { name: 'universityCount', label: 'Их сургуулийн тоо', type: 'number' }, { name: 'bachelorDuration', label: t.countries.bachelor, type: 'text' }, { name: 'masterDuration', label: t.countries.master, type: 'text' },
      { name: 'languagePrepInfo', label: t.countries.languagePrep, type: 'textarea' }, { name: 'admissionGeneral', label: t.countries.admission, type: 'textarea' },
      { name: 'commonExams', label: t.countries.exams, type: 'tags', hint: 'IELTS, TOEFL…' }, { name: 'tuitionRange', label: t.countries.tuition, type: 'text' },
      { name: 'admissionRules', label: 'Улсын хэлний шаардлага, хууль журам (ТӨЛБӨРТЭЙ)', type: 'group', fields: [
        { name: 'text', label: 'Дүрэм (Монгол хэлээр)', type: 'textarea', required: true }, { name: 'sourceName', label: 'Эх сурвалжийн нэр', type: 'text' }, { name: 'sourceUrl', label: 'Эх сурвалжийн URL (https://…)', type: 'text' }, { name: 'verifiedAt', label: 'Баталгаажуулсан огноо', type: 'text' },
      ] },
      { name: 'livingCostMonthlyUsd.min', label: 'Амьдрах зардал сард, доод (USD)', type: 'number' }, { name: 'livingCostMonthlyUsd.max', label: 'Амьдрах зардал сард, дээд (USD)', type: 'number' },
      { name: 'scholarshipInfo', label: t.countries.scholarships, type: 'textarea' },
      { name: 'matchProfile', label: 'Тохирлын профайл (редакцийн JSON: languages[en,ko,ja,zh,de,fr,ru], climate cold|temperate|warm, cityLife big_city|balanced|quiet, costTier 1-3, safety 1-5, distance near|mid|far, culture near|mid|far, higherEd 1-3, workAbroad 1-3)', type: 'json' },
      { name: 'visaLinks', label: t.countries.visa, type: 'group', fields: [{ name: 'title', label: 'Нэр', type: 'text', required: true }, { name: 'url', label: 'URL', type: 'text', required: true }] },
      { name: 'pros', label: t.countries.pros, type: 'tags' }, { name: 'cons', label: t.countries.cons, type: 'tags' }, ...SOURCE,
    ],
  },
  universities: {
    key: 'universities', title: t.admin.universities, hasStatus: true,
    columns: [{ key: 'name', label: t.common.name }, { key: 'city', label: U.city }, { key: 'type', label: U.type }, status],
    fields: [
      { name: 'name', label: 'Албан ёсны нэр (эх хэлээр)', type: 'text', required: true }, { name: 'nameMn', label: 'Монгол нэр', type: 'text' },
      { name: 'countryId', label: U.country, type: 'ref', ref: { resource: 'countries', labelKey: 'nameMn' }, required: true }, { name: 'city', label: U.city, type: 'text' },
      { name: 'website', label: U.website, type: 'text' }, { name: 'foundedYear', label: U.founded, type: 'number' }, { name: 'type', label: U.type, type: 'select', options: opt(U.labelsType) },
      { name: 'description', label: 'Тайлбар', type: 'textarea' }, { name: 'logoUrl', label: 'Лого (URL)', type: 'text' }, { name: 'images', label: 'Кампусын зураг (URL)', type: 'tags' },
      { name: 'degreeLevels', label: U.degree, type: 'multiselect', options: opt(U.labelsDegree) }, { name: 'subjects', label: U.subject, type: 'multiselect', options: opt(U.labelsSubject) },
      { name: 'languagesOfInstruction', label: U.language, type: 'tags' }, { name: 'intakes', label: U.intake, type: 'multiselect', options: opt(U.labelsIntake) },
      { name: 'studyModes', label: U.mode, type: 'multiselect', options: opt(U.labelsMode) }, { name: 'acceptsInternational', label: U.international, type: 'checkbox' },
      { name: 'admissionTests', label: U.admission, type: 'multiselect', options: opt(U.labelsAdmission) },
      { name: 'scholarshipTypes', label: U.scholarship, type: 'multiselect', options: opt(Object.fromEntries(Object.entries(U.labelsScholarship).filter(([k]) => k !== 'none'))) },
      { name: 'rankings', label: U.rankings, type: 'group', fields: [
        { name: 'provider', label: 'Байгууллага', type: 'select', required: true, options: opt(U.labelsRanking) }, { name: 'subject', label: 'Мэргэжлийн чиглэл (хэрэв байвал)', type: 'text' },
        { name: 'rank', label: 'Байр', type: 'number' }, { name: 'rankText', label: 'Байр (мужаар, жнь 401-500)', type: 'text' },
        { name: 'edition', label: 'Хэвлэл (жнь QS World University Rankings 2025)', type: 'text' }, { name: 'year', label: 'Он', type: 'number', required: true }, { name: 'sourceUrl', label: 'Албан ёсны эх сурвалж (URL)', type: 'text' }, { name: 'verifiedAt', label: 'Баталгаажуулсан', type: 'date' },
      ] },
      { name: 'tuition', label: U.tuitionFees, type: 'group', fields: [
        { name: 'level', label: U.degree, type: 'select', required: true, options: opt(U.labelsDegree) }, { name: 'faculty', label: 'Факультет / мэргэжил', type: 'text' }, { name: 'academicYear', label: U.academicYear, type: 'text' },
        { name: 'currency', label: U.currency, type: 'text' }, { name: 'annualFee', label: U.annualFee, type: 'number' }, { name: 'semesterFee', label: U.semesterFee, type: 'number' },
        { name: 'annualFeeUsd', label: 'Жилийн төлбөр (USD-ээр, шүүлтүүрт)', type: 'number' }, { name: 'durationMonths', label: 'Хугацаа (сар)', type: 'number' },
        { name: 'feeType', label: U.feeType, type: 'select', options: opt(U.labelsFeeType) }, { name: 'otherFees', label: U.otherFees, type: 'text' }, { name: 'livingCostMonthlyUsd', label: U.livingCost + ' USD', type: 'number' },
        { name: 'isEstimate', label: 'Тооцоолсон дүн', type: 'checkbox' }, { name: 'sourceUrl', label: 'Эх сурвалж (URL)', type: 'text' }, { name: 'verifiedAt', label: 'Баталгаажуулсан', type: 'date' },
      ] },
      { name: 'scholarships', label: U.scholarshipsTitle, type: 'group', fields: [
        { name: 'name', label: 'Нэр', type: 'text', required: true }, { name: 'type', label: 'Төрөл', type: 'select', options: opt(Object.fromEntries(Object.entries(U.labelsScholarship).filter(([k]) => k !== 'none'))) },
        { name: 'coverage', label: U.coverage, type: 'text' }, { name: 'eligibility', label: U.eligibility, type: 'text' }, { name: 'deadline', label: U.deadline, type: 'text' }, { name: 'url', label: U.applyLink, type: 'text' },
      ] },
      { name: 'featured', label: 'Нүүр хуудсанд онцлох', type: 'checkbox' },
      { name: 'admission.englishTests', label: 'Хэлний шаардлага (англи болон орон нутгийн хэл) (ТӨЛБӨРТЭЙ)', type: 'group', fields: [
        { name: 'test', label: 'Шалгалт (IELTS, TOEFL, TestDaF, TOPIK, JLPT…)', type: 'text', required: true }, { name: 'minScore', label: 'Хамгийн бага оноо/түвшин', type: 'text' }, { name: 'note', label: 'Тэмдэглэл', type: 'text' },
      ] },
      { name: 'admission.procedure', label: 'Элсэлтийн явц, алхмууд (ТӨЛБӨРТЭЙ)', type: 'tags' },
      { name: 'admission.applicationLinks', label: 'Албан ёсны өргөдлийн холбоос (ТӨЛБӨРТЭЙ)', type: 'group', fields: [
        { name: 'title', label: 'Нэр', type: 'text', required: true }, { name: 'url', label: 'URL (https://…)', type: 'text', required: true },
      ] },
      { name: 'other.dormitory', label: U.dormitory, type: 'textarea' }, { name: 'other.internationalSupport', label: U.support, type: 'textarea' }, { name: 'other.facilities', label: U.facilities, type: 'textarea' },
      { name: 'other.contactEmail', label: 'Холбоо барих имэйл', type: 'text' }, { name: 'other.contactPhone', label: 'Утас', type: 'text' }, { name: 'other.mapUrl', label: 'Google Maps холбоос', type: 'text' }, ...SOURCE,
    ],
  },
  programs: {
    key: 'programs', title: t.admin.programs, hasStatus: true,
    columns: [{ key: 'name', label: t.common.name }, { key: 'level', label: U.degree, render: (r) => U.labelsDegree[r.level] ?? r.level }, status],
    fields: [
      { name: 'universityId', label: 'Их сургууль', type: 'ref', ref: { resource: 'universities', labelKey: 'name' }, required: true }, { name: 'name', label: 'Хөтөлбөрийн нэр', type: 'text', required: true },
      { name: 'level', label: U.degree, type: 'select', options: opt(U.labelsDegree), required: true },
      { name: 'masterType', label: 'Магистрын төрөл', type: 'select', options: opt({ coursework: 'Coursework', research: 'Research', professional: 'Professional', executive: 'Executive', other: 'Бусад' }) },
      { name: 'department', label: U.department, type: 'text' }, { name: 'subject', label: U.subject, type: 'text' }, { name: 'language', label: U.programLanguage, type: 'text' },
      { name: 'durationMonths', label: 'Хугацаа (сар)', type: 'number' }, { name: 'annualTuition', label: U.annualFee, type: 'number' }, { name: 'currency', label: U.currency, type: 'text' },
      { name: 'applicationPeriod', label: U.applicationPeriod, type: 'text' }, { name: 'intakes', label: U.intake, type: 'multiselect', options: opt(U.labelsIntake) },
      { name: 'requirements', label: U.admissionReq, type: 'group', hint: 'Зөвхөн албан ёсны эх сурвалжаас баталгаажсан шаардлагыг оруулна. Мэдээлэл байхгүй бол хоосон үлдээнэ.', fields: [
        { name: 'kind', label: 'Шаардлага (жнь IELTS, GPA, Portfolio)', type: 'text', required: true }, { name: 'minScore', label: U.minScore, type: 'number' }, { name: 'note', label: 'Тайлбар', type: 'text' }, { name: 'required', label: 'Заавал', type: 'checkbox' },
      ] }, ...SOURCE,
    ],
  },
  careers: {
    key: 'careers', title: t.admin.careers, hasStatus: true,
    columns: [{ key: 'nameMn', label: t.common.name }, { key: 'nameEn', label: 'English' }, status],
    fields: [
      { name: 'nameMn', label: 'Монгол нэр', type: 'text', required: true }, { name: 'nameEn', label: 'Англи нэр', type: 'text', required: true },
      { name: 'categoryId', label: t.careers.category, type: 'ref', ref: { resource: 'career-categories', labelKey: 'nameMn' } },
      { name: 'description', label: t.careers.description, type: 'textarea' }, { name: 'whyPromising', label: 'Яагаад ирээдүйтэй вэ', type: 'textarea' },
      { name: 'requiredSkills', label: t.careers.skills + ' (key)', type: 'tags', hint: 'logic, math, problem…' }, { name: 'schoolSubjects', label: t.careers.subjects + ' (key)', type: 'tags' },
      { name: 'universityMajors', label: t.careers.majors, type: 'tags' }, { name: 'recommendedCountries', label: t.careers.countries + ' (slug)', type: 'tags' }, { name: 'pathways', label: t.careers.pathways, type: 'tags' },
      { name: 'mongoliaOpportunity', label: t.careers.mongolia, type: 'textarea' }, { name: 'globalOpportunity', label: t.careers.global, type: 'textarea' }, { name: 'automationImpact', label: t.careers.automation, type: 'textarea' },
      { name: 'market.demand', label: t.careers.demand + ' (эх сурвалжтай)', type: 'text' }, { name: 'market.growth', label: t.careers.growth + ' (эх сурвалжтай)', type: 'text' }, { name: 'market.salary', label: t.careers.salary + ' (эх сурвалжтай)', type: 'text' },
      { name: 'profile', label: 'Тохирлын профайл (JSON: riasec, skills, workStyle, values, subjects)', type: 'json' },
      { name: 'future.scores.employmentGrowth', label: 'Топ-25: Ажил эрхлэлтийн өсөлт (0–100)', type: 'number', section: 'Эрэлттэй 25 мэргэжил' }, { name: 'future.scores.demand', label: 'Топ-25: Эрэлт (0–100)', type: 'number', section: 'Эрэлттэй 25 мэргэжил' }, { name: 'future.scores.salaryPotential', label: 'Топ-25: Цалингийн боломж (0–100)', type: 'number', section: 'Эрэлттэй 25 мэргэжил' }, { name: 'future.scores.skillScarcity', label: 'Топ-25: Ур чадварын хомсдол (0–100)', type: 'number', section: 'Эрэлттэй 25 мэргэжил' }, { name: 'future.scores.automationResilience', label: 'Топ-25: Автоматжуулалтад тэсвэртэй (0–100)', type: 'number', section: 'Эрэлттэй 25 мэргэжил' }, { name: 'future.scores.mongoliaRelevance', label: 'Топ-25: Монголд хамаарал (0–100)', type: 'number', section: 'Эрэлттэй 25 мэргэжил' }, { name: 'future.scores.globalOpportunities', label: 'Топ-25: Дэлхийн боломж (0–100)', type: 'number', section: 'Эрэлттэй 25 мэргэжил' },
      { name: 'future.year', label: 'Топ-25: оноо авсан судалгааны он', type: 'number', section: 'Эрэлттэй 25 мэргэжил' }, { name: 'future.sourceName', label: 'Топ-25: эх сурвалжийн нэр', type: 'text', section: 'Эрэлттэй 25 мэргэжил' }, { name: 'future.sourceUrl', label: 'Топ-25: эх сурвалжийн URL', type: 'text', section: 'Эрэлттэй 25 мэргэжил' }, { name: 'future.verifiedAt', label: 'Топ-25: баталгаажуулсан', type: 'date', section: 'Эрэлттэй 25 мэргэжил' }, { name: 'future.note', label: 'Топ-25: тэмдэглэл', type: 'textarea', section: 'Эрэлттэй 25 мэргэжил' }, ...SOURCE,
    ],
  },
  'master-fields': {
    key: 'master-fields', title: 'Магистрын чиглэлүүд', hasStatus: true,
    columns: [{ key: 'nameMn', label: t.common.name }, { key: 'type', label: 'Төрөл' }, { key: 'area', label: 'Чиглэл' }, status],
    fields: [
      { name: 'nameMn', label: 'Монгол нэр', type: 'text', required: true }, { name: 'nameEn', label: 'Англи нэр', type: 'text', required: true },
      { name: 'area', label: 'Чиглэл', type: 'select', required: true, options: opt(t.p2.areas) },
      { name: 'type', label: 'Төрөл', type: 'select', required: true, options: opt({ coursework: 'Coursework', research: 'Research', professional: 'Professional', executive: 'Executive' }) },
      { name: 'uniSubject', label: 'Их сургуулийн шүүлтүүрийн чиглэл', type: 'select', options: opt(U.labelsSubject) },
      { name: 'description', label: 'Тайлбар', type: 'textarea' },
      { name: 'research', label: 'Судалгааны шинж (0–100)', type: 'number' }, { name: 'leadership', label: 'Удирдлагын шинж (0–100)', type: 'number' }, { name: 'minExperience', label: 'Хүлээгддэг туршлага (жил)', type: 'number' },
      { name: 'goalFit', label: 'Зорилгын нийцэл (JSON: specialist, leadership, research, career_change, entrepreneur → 0–100)', type: 'json' },
      { name: 'adjacent', label: 'Зэргэлдээ чиглэлүүд (key)', type: 'tags' }, { name: 'prerequisites', label: t.p2.prerequisites, type: 'tags' },
      { name: 'competencies', label: t.p2.competencies, type: 'tags' }, { name: 'commonExams', label: t.p2.exams, type: 'tags' },
    ],
  },
  'payment-products': { key: 'payment-products', title: t.pay.adminProducts, hasStatus: false, columns: [{ key: 'key', label: 'Key' }, { key: 'title', label: t.common.name }, { key: 'priceMnt', label: t.pay.amount + ' (₮)' }, { key: 'active', label: 'Идэвхтэй', render: (r: any) => (r.active ? 'Тийм' : 'Үгүй') }],
    fields: [{ name: 'key', label: 'Key', type: 'text', required: true, hint: 'test_result | university_access | country_access' }, { name: 'title', label: 'Нэр', type: 'text', required: true }, { name: 'description', label: 'Тайлбар', type: 'textarea' }, { name: 'priceMnt', label: 'Үнэ (₮)', type: 'number', required: true }, { name: 'scope', label: 'Хамрах хүрээ', type: 'select', required: true, options: [{ value: 'attempt', label: 'Тухайн тестийн үр дүн' }, { value: 'university', label: 'Нэг сургуулийн төлбөртэй мэдээлэл' }, { value: 'country', label: 'Улсын бүх сургууль' }, { value: 'user', label: 'Бүх бүртгэл' }] }, { name: 'active', label: 'Идэвхтэй', type: 'checkbox' }] },
  'career-categories': { key: 'career-categories', title: t.admin.categories, hasStatus: false, columns: [{ key: 'nameMn', label: t.common.name }, { key: 'nameEn', label: 'English' }, { key: 'slug', label: 'Slug' }],
    fields: [{ name: 'nameMn', label: 'Монгол нэр', type: 'text', required: true }, { name: 'nameEn', label: 'Англи нэр', type: 'text' }, { name: 'slug', label: 'Slug (хоосон бол автоматаар)', type: 'text' }, { name: 'description', label: 'Тайлбар', type: 'textarea' }] },
  skills: { key: 'skills', title: t.admin.skills, hasStatus: false, columns: [{ key: 'key', label: 'Key' }, { key: 'nameMn', label: t.common.name }],
    fields: [{ name: 'key', label: 'Key', type: 'text', required: true }, { name: 'nameMn', label: 'Монгол нэр', type: 'text', required: true }, { name: 'nameEn', label: 'Англи нэр', type: 'text' }, { name: 'description', label: 'Тайлбар', type: 'textarea' }] },
  sources: { key: 'sources', title: t.admin.sources, hasStatus: false, columns: [{ key: 'name', label: t.common.name }, { key: 'url', label: 'URL' }, { key: 'reliabilityStatus', label: 'Найдвартай байдал' }],
    fields: [{ name: 'name', label: 'Нэр', type: 'text', required: true }, { name: 'url', label: 'URL', type: 'text', required: true }, { name: 'type', label: 'Төрөл', type: 'select', options: SOURCE_TYPES }, { name: 'reliabilityStatus', label: 'Найдвартай байдал', type: 'select', options: RELIABILITY }, { name: 'notes', label: 'Тэмдэглэл', type: 'textarea' }] },
};

export const ADMIN_NAV = [
  { href: '/admin', label: t.admin.overview }, { href: '/admin/countries', label: t.admin.countries }, { href: '/admin/universities', label: t.admin.universities },
  { href: '/admin/programs', label: t.admin.programs }, { href: '/admin/careers', label: t.admin.careers }, { href: '/admin/career-categories', label: t.admin.categories }, { href: '/admin/master-fields', label: 'Магистрын чиглэлүүд' },
  { href: '/admin/skills', label: t.admin.skills }, { href: '/admin/assessments', label: t.admin.assessments }, { href: '/admin/sources', label: t.admin.sources }, { href: '/admin/payments', label: t.pay.adminPayments }, { href: '/admin/payment-products', label: t.pay.adminProducts },
  { href: '/admin/import', label: t.p4.importTitle }, { href: '/admin/data-quality', label: t.p4.dataQuality }, { href: '/admin/analytics', label: t.p4.analytics }, { href: '/admin/future', label: t.p4.futureAdmin + ' / ' + t.p4.rateAdmin }, { href: '/admin/users', label: t.admin.users }, { href: '/admin/audit', label: t.admin.audit },
];

/* dotted-path helpers */
export const getPath = (o: any, p: string) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
export const setPath = (o: any, p: string, v: any) => {
  const ks = p.split('.'); const root = { ...o }; let cur = root;
  ks.forEach((k, i) => { if (i === ks.length - 1) cur[k] = v; else { cur[k] = { ...(cur[k] ?? {}) }; cur = cur[k]; } });
  return root;
};
