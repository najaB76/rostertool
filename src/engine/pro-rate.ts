export function calculateProratedHours(
  weekStartDate: string,
  weekEndDate: string,
  arrivalDate: string,
  departureDate: string,
  targetWeeklyHours: number
): number {
  const start = new Date(weekStartDate).getTime();
  const end = new Date(weekEndDate).getTime();
  const arr = new Date(arrivalDate).getTime();
  const dep = new Date(departureDate).getTime();

  // If outside bounds entirely
  if (dep < start || arr > end) return 0;

  const actualStart = Math.max(start, arr);
  const actualEnd = Math.min(end, dep);

  const daysAvailable = Math.round((actualEnd - actualStart) / (1000 * 60 * 60 * 24)) + 1;
  
  if (daysAvailable >= 7) return targetWeeklyHours;
  if (daysAvailable <= 0) return 0;

  return Math.round((daysAvailable / 7) * targetWeeklyHours);
}
