import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(isoDateString: string) {
  // Create a Date object from the ISO string
  const date = new Date(isoDateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date string provided');
  }
  
  // Month names array for conversion
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  // Extract date components
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  // Format the date as "Apr 12, 2025"
  return `${month} ${day}, ${year}`;
}
