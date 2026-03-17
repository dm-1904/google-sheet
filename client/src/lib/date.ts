const ISO_DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const US_DATE_ONLY_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
const ISO_MIDNIGHT_UTC_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T00:00:00(?:\.\d+)?Z$/i;

const formatDateParts = (year: number, month: number, day: number): string => {
  const value = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(value.getTime()) ||
    value.getUTCFullYear() !== year ||
    value.getUTCMonth() !== month - 1 ||
    value.getUTCDate() !== day
  ) {
    return '';
  }

  return value.toLocaleDateString(undefined, { timeZone: 'UTC' });
};

export const formatCmsDate = (value?: string): string => {
  if (!value?.trim()) {
    return 'Unknown date';
  }

  const trimmed = value.trim();
  const isoDateOnlyMatch = ISO_DATE_ONLY_PATTERN.exec(trimmed);
  if (isoDateOnlyMatch) {
    return (
      formatDateParts(
        Number(isoDateOnlyMatch[1]),
        Number(isoDateOnlyMatch[2]),
        Number(isoDateOnlyMatch[3]),
      ) || trimmed
    );
  }

  const usDateOnlyMatch = US_DATE_ONLY_PATTERN.exec(trimmed);
  if (usDateOnlyMatch) {
    return (
      formatDateParts(
        Number(usDateOnlyMatch[3]),
        Number(usDateOnlyMatch[1]),
        Number(usDateOnlyMatch[2]),
      ) || trimmed
    );
  }

  const isoMidnightMatch = ISO_MIDNIGHT_UTC_PATTERN.exec(trimmed);
  if (isoMidnightMatch) {
    return (
      formatDateParts(
        Number(isoMidnightMatch[1]),
        Number(isoMidnightMatch[2]),
        Number(isoMidnightMatch[3]),
      ) || trimmed
    );
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? trimmed : parsed.toLocaleDateString();
};
