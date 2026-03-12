const DEFAULT_CATEGORY_LABEL = 'Uncategorized';

export const formatCategoryLabel = (value?: string): string => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return DEFAULT_CATEGORY_LABEL;
  }

  return trimmed
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
