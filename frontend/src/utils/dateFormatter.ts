/**
 * Standard utility for formatting dates and times across the SmartDine application.
 */

/**
 * Formats a date string or Date object to DD/MM/YYYY format.
 * @param date - The date to format
 * @returns A string in DD/MM/YYYY format
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString("en-GB");
}

/**
 * Formats a date string or Date object to 12-hour time format with AM/PM.
 * @param date - The date to format
 * @returns A string like "01:34 PM"
 */
export function formatTime(date: string | Date | undefined): string {
  if (!date) return '';
  
  // Handle cases where date might be just a time string like "19:00"
  let dateObj: Date;
  if (typeof date === 'string' && date.includes(':') && !date.includes('-') && !date.includes('T')) {
    const [hours, minutes] = date.split(':');
    dateObj = new Date();
    dateObj.setHours(parseInt(hours, 10));
    dateObj.setMinutes(parseInt(minutes, 10));
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) return String(date);

  return dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}
