// The two kinds of 講道. `admin` is the label on the publish form's buttons,
// `public` the label on 聖道回顧's filter and on each card.
export const SERMON_CATEGORIES = {
  worship: { admin: '崇拜', public: '崇拜錄音', icon: '⛪' },
  seminar: { admin: '專題講座', public: '專題講座', icon: '🎓' },
} as const;

export type SermonCategory = keyof typeof SERMON_CATEGORIES;

export function isSermonCategory(value: unknown): value is SermonCategory {
  return value === 'worship' || value === 'seminar';
}
