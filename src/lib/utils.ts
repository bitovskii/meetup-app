/**
 * Common utility functions
 */

/**
 * Formats a number with proper pluralization
 */
export function formatCount(count: number, singular: string, plural?: string): string {
  const pluralForm = plural || `${singular}s`;
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

/**
 * Formats a date string for display
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString; // Return original if parsing fails
  }
}

/**
 * Converts various date formats to DD.MM.YYYY format
 * Handles both "January 15, 2025" and "15.01.2025" formats
 */
export function formatDateToDDMMYYYY(dateString: string): string {
  if (!dateString) return dateString;
  
  // If already in DD.MM.YYYY format, return as is
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  try {
    // Try to parse the date (handles formats like "January 15, 2025" or "2025-01-15")
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  } catch {
    return dateString; // Return original if parsing fails
  }
}

/**
 * Converts various time formats to HH:MM (24-hour) format
 * Handles both "9:00 AM" and "09:00" formats
 */
export function formatTimeTo24Hour(timeString: string): string {
  if (!timeString) return timeString;
  
  // If already in HH:MM format (24-hour), return as is
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  try {
    // Handle AM/PM format (e.g., "9:00 AM", "2:30 PM")
    const ampmRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const ampmMatch = ampmRegex.exec(timeString);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1], 10);
      const minutes = ampmMatch[2];
      const isPM = ampmMatch[3].toUpperCase() === 'PM';
      
      if (isPM && hours !== 12) {
        hours += 12;
      } else if (!isPM && hours === 12) {
        hours = 0;
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    
    // Handle simple hour format (e.g., "9" or "14")
    const hourRegex = /^(\d{1,2})$/;
    const hourMatch = hourRegex.exec(timeString);
    if (hourMatch) {
      const hours = parseInt(hourMatch[1], 10);
      return `${hours.toString().padStart(2, '0')}:00`;
    }
    
    return timeString; // Return original if no pattern matches
  } catch {
    return timeString; // Return original if parsing fails
  }
}

/**
 * Generates a unique key for React components
 */
export function generateKey(...parts: (string | number)[]): string {
  return parts.join('-').replace(/[^a-zA-Z0-9-]/g, '');
}