export const nowIso = (): string => new Date().toISOString();

export const formatDateTime = (iso: string): string =>
  new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
