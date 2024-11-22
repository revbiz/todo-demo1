export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour12: false,
  }).split(',')[0]; // Only take the date part, not the time
}
