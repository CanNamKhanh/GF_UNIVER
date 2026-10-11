/** "2024-10-20" -> "20/10/2024" (no Date parsing, so no timezone/hydration surprises). */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}
