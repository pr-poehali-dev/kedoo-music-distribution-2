export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  balance: number;
  created_at: string;
}

export interface Release {
  id: number;
  user_id: number;
  title: string;
  upc?: string;
  genre?: string;
  cover_url?: string;
  old_release_date?: string;
  new_release_date?: string;
  status: 'draft' | 'moderation' | 'approved' | 'rejected' | 'deleted';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: number;
  release_id: number;
  title: string;
  audio_url?: string;
  tiktok_moment?: string;
  music_author?: string;
  lyrics_author?: string;
  has_explicit: boolean;
  performers?: string;
  producers?: string;
  isrc?: string;
  language?: string;
  track_order: number;
  lyrics?: string;
  is_instrumental: boolean;
  created_at: string;
}

export interface Ticket {
  id: number;
  user_id: number;
  subject: string;
  message: string;
  status: 'open' | 'answered' | 'closed';
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

export const GENRES = [
  'Поп',
  'Рок',
  'Хип-хоп',
  'Рэп',
  'Электронная музыка',
  'Джаз',
  'Блюз',
  'R&B',
  'Кантри',
  'Фолк',
  'Классика',
  'Регги',
  'Метал',
  'Панк',
  'Инди',
  'Альтернатива',
  'Танцевальная',
  'Хаус',
  'Техно',
  'Драм-н-бейс',
  'Дабстеп',
  'Трэп',
  'Соул',
  'Фанк',
  'Диско',
  'Другое'
];

export const LANGUAGES = [
  'Русский',
  'Английский',
  'Испанский',
  'Французский',
  'Немецкий',
  'Итальянский',
  'Португальский',
  'Китайский',
  'Японский',
  'Корейский',
  'Арабский',
  'Хинди',
  'Инструментальная',
  'Другой'
];