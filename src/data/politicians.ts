export interface Law {
  id: number;
  title: string;
  description: string;
  date: string;
  category: string;
  impact: 'positive' | 'negative' | 'neutral';
  votes: { up: number; down: number };
  comments: Comment[];
}

export interface Comment {
  id: number;
  author: string;
  avatar: string;
  text: string;
  date: string;
  likes: number;
}

export interface Politician {
  id: number;
  name: string;
  position: string;
  party: string;
  region: string;
  photo: string;
  approvalRating: number;
  totalVotes: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  lawsCount: number;
  achievementsCount: number;
  bio: string;
  tags: string[];
  stats: {
    lawsProposed: number;
    lawsPassed: number;
    attendance: number;
    yearsInOffice: number;
  };
  laws: Law[];
}

const PHOTO_1 = 'https://cdn.poehali.dev/projects/ef582e3d-d9c7-48f5-97b6-72b132ee2456/files/bab472ed-773d-4faf-bf4f-a6b9c6b28a40.jpg';
const PHOTO_2 = 'https://cdn.poehali.dev/projects/ef582e3d-d9c7-48f5-97b6-72b132ee2456/files/94118d8e-61a6-415d-a95c-fc40e9ae1120.jpg';
const PHOTO_3 = 'https://cdn.poehali.dev/projects/ef582e3d-d9c7-48f5-97b6-72b132ee2456/files/8aa0a864-2e1f-4386-8478-6a11869a2d83.jpg';

export const politicians: Politician[] = [
  {
    id: 1,
    name: 'Александр Новиков',
    position: 'Министр экономики',
    party: 'Народная партия',
    region: 'Москва',
    photo: PHOTO_1,
    approvalRating: 78,
    totalVotes: 124500,
    trend: 'up',
    trendValue: 5,
    lawsCount: 24,
    achievementsCount: 12,
    bio: 'Более 15 лет в государственном управлении. Автор программы цифровизации экономики и реформы налоговой системы.',
    tags: ['Экономика', 'Цифровизация', 'Налоги'],
    stats: { lawsProposed: 24, lawsPassed: 19, attendance: 94, yearsInOffice: 8 },
    laws: [
      {
        id: 1,
        title: 'Закон о цифровой экономике',
        description: 'Создание инфраструктуры для развития цифровых технологий и поддержки стартапов в ключевых отраслях.',
        date: '15 марта 2024',
        category: 'Экономика',
        impact: 'positive',
        votes: { up: 8420, down: 1230 },
        comments: [
          { id: 1, author: 'Дмитрий К.', avatar: '👨‍💼', text: 'Отличный закон, наконец-то поддержали IT-сектор!', date: '16 марта 2024', likes: 234 },
          { id: 2, author: 'Ольга М.', avatar: '👩‍💻', text: 'Важный шаг для развития инноваций в стране.', date: '17 марта 2024', likes: 189 },
        ]
      },
      {
        id: 2,
        title: 'Реформа налогообложения малого бизнеса',
        description: 'Снижение налоговой нагрузки для предпринимателей с оборотом до 50 млн рублей в год.',
        date: '2 сентября 2023',
        category: 'Налоги',
        impact: 'positive',
        votes: { up: 12300, down: 890 },
        comments: [
          { id: 3, author: 'Игорь С.', avatar: '🧑‍🔧', text: 'Наконец-то услышали малый бизнес! Моя компания сэкономит около 400 тысяч в год.', date: '3 сентября 2023', likes: 567 },
        ]
      },
      {
        id: 3,
        title: 'Программа поддержки экспорта',
        description: 'Субсидии и льготные кредиты для компаний, выходящих на международные рынки.',
        date: '18 января 2024',
        category: 'Экспорт',
        impact: 'neutral',
        votes: { up: 4200, down: 3100 },
        comments: [
          { id: 4, author: 'Наталья В.', avatar: '👩‍💼', text: 'Идея хорошая, но механизм реализации пока непонятен.', date: '19 января 2024', likes: 145 },
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Елена Соколова',
    position: 'Министр образования',
    party: 'Реформы и прогресс',
    region: 'Санкт-Петербург',
    photo: PHOTO_2,
    approvalRating: 65,
    totalVotes: 98200,
    trend: 'up',
    trendValue: 3,
    lawsCount: 31,
    achievementsCount: 18,
    bio: 'Доктор педагогических наук. Инициатор реформы среднего образования и программы цифровых школ.',
    tags: ['Образование', 'Наука', 'Молодёжь'],
    stats: { lawsProposed: 31, lawsPassed: 24, attendance: 97, yearsInOffice: 5 },
    laws: [
      {
        id: 4,
        title: 'Закон о цифровых учебниках',
        description: 'Переход на электронные учебники в средних школах с обеспечением планшетами учеников из малоимущих семей.',
        date: '10 февраля 2024',
        category: 'Образование',
        impact: 'positive',
        votes: { up: 9800, down: 4200 },
        comments: [
          { id: 5, author: 'Марина Т.', avatar: '👩‍🏫', text: 'Очень нужная реформа! Дети из бедных семей наконец получат равный доступ к знаниям.', date: '11 февраля 2024', likes: 890 },
          { id: 6, author: 'Пётр Л.', avatar: '👨‍🎓', text: 'Беспокоит нагрузка на зрение детей. Нужны ограничения по времени экрана.', date: '12 февраля 2024', likes: 345 },
        ]
      },
      {
        id: 5,
        title: 'Стипендиальная программа для одарённых детей',
        description: 'Ежемесячные выплаты победителям олимпиад и грантовая поддержка научных проектов школьников.',
        date: '5 мая 2023',
        category: 'Наука',
        impact: 'positive',
        votes: { up: 15400, down: 620 },
        comments: [
          { id: 7, author: 'Андрей Ф.', avatar: '👨‍🔬', text: 'Замечательная инициатива! Мой сын-олимпиадник теперь получает достойную поддержку.', date: '6 мая 2023', likes: 1200 },
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Виктор Громов',
    position: 'Губернатор',
    party: 'Единство',
    region: 'Уральский округ',
    photo: PHOTO_3,
    approvalRating: 42,
    totalVotes: 75800,
    trend: 'down',
    trendValue: -8,
    lawsCount: 18,
    achievementsCount: 7,
    bio: 'Руководит регионом 12 лет. Автор программы развития промышленной инфраструктуры и модернизации ЖКХ.',
    tags: ['Промышленность', 'ЖКХ', 'Инфраструктура'],
    stats: { lawsProposed: 18, lawsPassed: 11, attendance: 78, yearsInOffice: 12 },
    laws: [
      {
        id: 6,
        title: 'Программа реновации промышленных зон',
        description: 'Преобразование заброшенных заводских территорий в технопарки и жилые кварталы.',
        date: '20 апреля 2024',
        category: 'Инфраструктура',
        impact: 'neutral',
        votes: { up: 5100, down: 4900 },
        comments: [
          { id: 8, author: 'Сергей Б.', avatar: '👷', text: 'Хорошая идея, но стоимость реализации вызывает вопросы. Откуда деньги?', date: '21 апреля 2024', likes: 234 },
          { id: 9, author: 'Людмила Г.', avatar: '👩‍⚕️', text: 'Жители старых промзон ждут этого десятилетиями!', date: '22 апреля 2024', likes: 456 },
        ]
      },
      {
        id: 7,
        title: 'Закон о повышении тарифов ЖКХ',
        description: 'Увеличение коммунальных тарифов на 18% для финансирования модернизации сетей.',
        date: '1 декабря 2023',
        category: 'ЖКХ',
        impact: 'negative',
        votes: { up: 1200, down: 18900 },
        comments: [
          { id: 10, author: 'Татьяна П.', avatar: '👩', text: 'Недопустимо! Пенсионеры и так еле сводят концы с концами.', date: '2 декабря 2023', likes: 2300 },
          { id: 11, author: 'Максим Д.', avatar: '👨', text: 'Голосую против. Сначала объясните куда ушли прошлые деньги на ЖКХ!', date: '3 декабря 2023', likes: 1890 },
        ]
      }
    ]
  }
];
