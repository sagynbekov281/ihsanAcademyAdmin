const LEVELS = [['beginner','Начальный'],['intermediate','Средний'],['advanced','Продвинутый']];
const ICONS = [['code','Код'],['react','React'],['database','База данных'],['brush','Дизайн'],['chart','Аналитика'],['shield','Безопасность'],['phone','Мобильная']];
// типы: text, textarea, number, date, select, checkbox, list (через запятую), lines (с новой строки)
export const SCHEMA = {
  courses: {
    one: 'курс', endpoint: '/api/admin/courses', key: 'courses', seed: 'courses',
    // пары [русское поле, кыргызское поле] для вкладки «Кыргызча» и кнопки «Перевести»
    translate: [
      ['title', 'titleKy'], ['description', 'descriptionKy'], ['about', 'aboutKy'],
      ['duration', 'durationKy'], ['topics', 'topicsKy'],
    ],
    fields: [
      ['title','Название','text'],['description','Короткое описание (в списке)','textarea'],
      ['about','Подробное описание (в окне курса)','textarea'],['duration','Длительность (например: 6 месяцев)','text'],
      ['levelKey','Уровень','select',LEVELS],['iconKey','Иконка','select',ICONS],
      ['price','Цена (сом)','number'],['discountPercent','Скидка, % (0 — нет)','number'],
      ['discountEndsAt','Скидка до (пусто — без срока)','date'],
      ['topics','Программа (каждая тема с новой строки)','lines'],['langs','Технологии (через запятую)','list'],
      ['students','Студентов','number'],['projects','Проектов','number'],
      // кыргызские поля (показываются только на вкладке «Кыргызча»)
      ['titleKy','Название','text'],['descriptionKy','Короткое описание (в списке)','textarea'],
      ['aboutKy','Подробное описание (в окне курса)','textarea'],['durationKy','Длительность','text'],
      ['topicsKy','Программа (каждая тема с новой строки)','lines'],
      ['order','Порядок (меньше — выше)','number'],['active','Показывать на сайте','checkbox'],
    ],
  },
  teachers: {
    one: 'учителя', endpoint: '/api/admin/teachers', key: 'teachers', seed: 'teachers',
    translate: [['role', 'roleKy'], ['experience', 'experienceKy'], ['bio', 'bioKy']],
    fields: [
      ['name','Имя и фамилия','text'],['role','Должность','text'],['experience','Опыт (например: 5+ лет)','text'],
      ['subjects','Предметы (через запятую)','list'],['bio','О себе','textarea'],
      // кыргызские поля
      ['roleKy','Должность','text'],['experienceKy','Опыт','text'],['bioKy','О себе','textarea'],
      ['order','Порядок (меньше — выше)','number'],['active','Показывать на сайте','checkbox'],
    ],
  },
};