export interface SpecialCategoryConfig {
  id: string;
  label: string;
  shortLabel: string;
}

export const SPECIAL_CATEGORIES_CONFIG: SpecialCategoryConfig[] = [
  { id: 'music', label: '音乐特辑', shortLabel: 'MUSIC' },
  { id: 'horror', label: '恐怖特辑', shortLabel: 'HORROR' },
];

export const getSpecialCategoryConfig = (id: string): SpecialCategoryConfig => (
  SPECIAL_CATEGORIES_CONFIG.find((category) => category.id === id) || {
    id,
    label: id,
    shortLabel: 'SP',
  }
);
