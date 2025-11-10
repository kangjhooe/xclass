import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format tanggal ke format Indonesia DD-MM-YYYY
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd-MM-yyyy', { locale: id });
  } catch (error) {
    return '-';
  }
}

/**
 * Format tanggal dengan waktu
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd-MM-yyyy HH:mm', { locale: id });
  } catch (error) {
    return '-';
  }
}

