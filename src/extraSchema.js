// Новый раздел админки: «Отзывы».
// translate — пары полей [русское, кыргызское] для кнопок «Перевести».
const short = (s, n = 70) => (s && s.length > n ? s.slice(0, n) + '…' : s || '');

export const EXTRA = {
  testimonials: {
    one: 'отзыв',
    endpoint: '/api/admin/testimonials',
    key: 'testimonials',
    seed: 'testimonials',
    translate: [['text', 'textKy'], ['role', 'roleKy']],
    fields: [
      ['name', 'Имя', 'text'],
      ['role', 'Должность', 'text'],
      ['text', 'Отзыв', 'textarea'],
      ['rating', 'Оценка (1–5)', 'number'],
      ['roleKy', 'Должность', 'text'],
      ['textKy', 'Отзыв', 'textarea'],
      ['order', 'Порядок', 'number'],
      ['active', 'Показывать на сайте', 'checkbox'],
    ],
    columns: [
      ['Имя', (i) => i.name],
      ['Отзыв', (i) => short(i.text)],
      ['Оценка', (i) => '★'.repeat(Number(i.rating) || 5)],
      ['Кыргызча', (i) => (i.textKy ? 'есть' : '—')],
    ],
  },
};