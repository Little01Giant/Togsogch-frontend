/** Backend-ийн seed/content.ts-тэй нийцсэн хичээлийн нэрс (үр дүн, мэргэжлийн хуудсанд ашиглана). */
export const SUBJECT_LABEL: Record<string, string> = {
  math: 'Математик', physics: 'Физик', chemistry: 'Хими', biology: 'Биологи', informatics: 'Мэдээлэл зүй', mongolian: 'Монгол хэл, уран зохиол',
  english: 'Англи хэл', history: 'Түүх', social: 'Нийгмийн ухаан', geography: 'Газарзүй', economics: 'Эдийн засаг', art: 'Дүрслэх урлаг',
  music: 'Хөгжим', pe: 'Биеийн тамир', technology: 'Технологи',
};

/** Сургалтын хэлний код → Монгол нэр */
export const LANGUAGE_LABEL: Record<string, string> = { en: 'Англи', ko: 'Солонгос', ja: 'Япон', zh: 'Хятад', de: 'Герман', fr: 'Франц', ru: 'Орос', it: 'Итали', es: 'Испани' };
