export const getBackgroundClass = (iconCode: string): string => {
  if (!iconCode) return 'bg-default';
  const isDay = iconCode.includes('d');
  const code = iconCode.slice(0, 2);

  if (['01', '02'].includes(code)) return isDay ? 'bg-clear-day' : 'bg-clear-night';
  if (['03', '04', '50'].includes(code)) return isDay ? 'bg-cloudy-day' : 'bg-cloudy-night';
  return isDay ? 'bg-rain-day' : 'bg-rain-night';
};

export const formatTime = (dt: number, timezoneOffset: number) => {
  const date = new Date((dt + timezoneOffset) * 1000);
  return date.toISOString().slice(11, 16);
};

export const formatDay = (dt: number, timezoneOffset: number): string => {
  const date = new Date((dt + timezoneOffset) * 1000);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(date);
};