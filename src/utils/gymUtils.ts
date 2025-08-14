import { Linking, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { OpenMat, OpenMatSession } from '../types';
import { haptics } from './haptics';

/**
 * Format time range for display (e.g., "5:00 PM - 6:00 PM")
 * Handles both existing ranges and single times by adding 1 hour
 */
export const formatTimeRange = (sessionTime: string): string => {
  // Check if the time already contains a range (has a dash/hyphen)
  // Handle both formats: "12pm-2pm" and "6:30 PM - 7:30 PM"
  if (sessionTime.includes('-') || sessionTime.includes('–')) {
    // It's already a time range, format it properly
    // Split on dash/hyphen and clean up any extra spaces
    const parts = sessionTime.split(/[-–]/).map(part => part.trim());
    if (parts.length >= 2) {
      // Handle special case like "12-2pm" where first part is missing period
      let startTime = parts[0];
      const endTime = parts[1];
      
      // If start time doesn't have AM/PM but end time does, infer from end time
      if (!startTime.match(/(am|pm)$/i) && endTime.match(/(am|pm)$/i)) {
        const endPeriodMatch = endTime.match(/(am|pm)$/i);
        if (endPeriodMatch) {
          const endPeriod = endPeriodMatch[1].toUpperCase();
          startTime = startTime + endPeriod;
        }
      }
      
      return formatTimeRangeSmart(startTime, endTime);
    }
  }
  
  // It's a single time, add 1 hour
  const formattedStart = formatSingleTime(sessionTime);
  const endTime = addOneHour(sessionTime);
  
  return formatTimeRangeSmart(formattedStart, endTime);
};

/**
 * Smart time range formatting that handles same/different periods
 */
export const formatTimeRangeSmart = (startTime: string, endTime: string): string => {
  // Parse both times to extract hour, minute, and period
  const startParsed = parseTime(startTime);
  const endParsed = parseTime(endTime);
  
  if (!startParsed || !endParsed) {
    // Fallback to original formatting
    return `${startTime} - ${endTime}`;
  }
  
  const { hour: startHour, minute: startMinute, period: startPeriod } = startParsed;
  const { hour: endHour, minute: endMinute, period: endPeriod } = endParsed;
  
  // Check if both times have the same period (AM/PM)
  if (startPeriod === endPeriod) {
    // Same period - use compact format
    const startFormatted = formatHourMinute(startHour, startMinute);
    const endFormatted = formatHourMinute(endHour, endMinute);
    return `${startFormatted}-${endFormatted} ${startPeriod}`;
  } else {
    // Different periods - show both periods
    const startFormatted = formatHourMinute(startHour, startMinute);
    const endFormatted = formatHourMinute(endHour, endMinute);
    return `${startFormatted} ${startPeriod} - ${endFormatted} ${endPeriod}`;
  }
};

/**
 * Parse time string into hour, minute, and period
 */
export const parseTime = (time: string) => {
  const cleanTime = time.trim();
  
  // Match patterns like "11am", "6pm", "11AM", "6PM" (case insensitive)
  const simpleMatch = cleanTime.match(/^(\d+)(am|pm)$/i);
  if (simpleMatch) {
    return {
      hour: parseInt(simpleMatch[1]),
      minute: 0,
      period: simpleMatch[2].toUpperCase()
    };
  }
  
  // Match patterns like "5:00 PM", "11:30 AM", "6:30pm", "12:00pm" (case insensitive)
  const detailedMatch = cleanTime.match(/^(\d+):(\d+)\s*(am|pm)$/i);
  if (detailedMatch) {
    return {
      hour: parseInt(detailedMatch[1]),
      minute: parseInt(detailedMatch[2]),
      period: detailedMatch[3].toUpperCase()
    };
  }
  
  return null;
};

/**
 * Format hour and minute with smart zero handling
 */
export const formatHourMinute = (hour: number, minute: number): string => {
  // Remove unnecessary zeros - show just the hour if minute is 0
  if (minute === 0) {
    return hour.toString();
  }
  return `${hour}:${minute.toString().padStart(2, '0')}`;
};

/**
 * Format single time for display (e.g., "5:00 PM")
 * Handles various input formats and standardizes them
 */
export const formatSingleTime = (time: string): string => {
  // Handle various time formats and standardize them
  const cleanTime = time.trim().toLowerCase();
  
  // Handle formats like "11am", "6pm", "5:00 PM", etc.
  let hour, minute = '00', period;
  
  // Match patterns like "11am", "6pm"
  const simpleMatch = cleanTime.match(/^(\d+)(am|pm)$/);
  if (simpleMatch) {
    hour = parseInt(simpleMatch[1]);
    period = simpleMatch[2].toUpperCase();
  } else {
    // Match patterns like "5:00 PM", "11:30 AM"
    const detailedMatch = cleanTime.match(/^(\d+):(\d+)\s*(am|pm)$/);
    if (detailedMatch) {
      hour = parseInt(detailedMatch[1]);
      minute = detailedMatch[2];
      period = detailedMatch[3].toUpperCase();
    } else {
      // Fallback - return as is
      return time;
    }
  }
  
  // Format consistently
  return `${hour}:${minute} ${period}`;
};

/**
 * Add one hour to a time string
 */
export const addOneHour = (time: string): string => {
  // Parse the time and add 1 hour
  const cleanTime = time.trim().toLowerCase();
  
  let hour, minute = '00', period;
  
  // Match patterns like "11am", "6pm"
  const simpleMatch = cleanTime.match(/^(\d+)(am|pm)$/);
  if (simpleMatch) {
    hour = parseInt(simpleMatch[1]);
    period = simpleMatch[2].toUpperCase();
  } else {
    // Match patterns like "5:00 PM", "11:30 AM"
    const detailedMatch = cleanTime.match(/^(\d+):(\d+)\s*(am|pm)$/);
    if (detailedMatch) {
      hour = parseInt(detailedMatch[1]);
      minute = detailedMatch[2];
      period = detailedMatch[3].toUpperCase();
    } else {
      // Fallback - return as is
      return time;
    }
  }
  
  // Add 1 hour
  hour += 1;
  
  // Handle 12-hour format
  if (hour === 13) hour = 1;
  if (hour === 12) {
    return `12:${minute} ${period === 'AM' ? 'PM' : 'AM'}`;
  }
  
  return `${hour}:${minute} ${period}`;
};

/**
 * Get session type with emoji icon
 */
export const getSessionTypeWithIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'gi':
      return 'Gi 🥋';
    case 'nogi':
      return 'No-Gi 👕';
    case 'both':
      return 'Gi & No-Gi 🥋👕';
    case 'mma':
    case 'mma sparring':
      return 'MMA Sparring 🥊';
    default:
      // For any other custom session types, preserve the original name
      return `${type} 🥋👕`;
  }
};

/**
 * Get mat type display for multiple sessions
 */
export const getMatTypeDisplay = (openMats: OpenMatSession[]): string => {
  const types = openMats.map(mat => mat.type);
  if (types.includes('both')) return 'Gi & No-Gi';
  if (types.includes('gi') && types.includes('nogi')) return 'Gi & No-Gi';
  if (types.includes('gi')) return 'Gi Only';
  if (types.includes('nogi')) return 'No-Gi Only';
  return 'Mixed';
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Open gym website with haptic feedback
 */
export const openWebsite = (url: string): void => {
  haptics.light(); // Light haptic for website button
  if (url) Linking.openURL(url);
};

/**
 * Open directions with haptic feedback
 */
export const openDirections = (address: string): void => {
  haptics.light(); // Light haptic for directions button
  if (!address || address === 'Tampa, FL' || address === 'Austin, TX') return;
  const url = `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
  Linking.openURL(url);
};

/**
 * Copy gym details to clipboard with haptic feedback
 * Returns a promise that resolves when copy is complete
 */
export const handleCopyGym = async (gym: OpenMat): Promise<void> => {
  haptics.light(); // Light haptic for button press
  
  try {
    const firstSession = gym.openMats && gym.openMats.length > 0 ? gym.openMats[0] : null;
    
    const copyText = `I'm going to this open mat.
Come train with me! 🥋

📍 ${gym.name}
${gym.address}

📅 ${firstSession ? `${firstSession.day}, ${firstSession.time}` : ''}
🥋 ${firstSession ? (firstSession.type === 'nogi' ? 'No-Gi' : firstSession.type === 'gi' ? 'Gi' : 'Gi/NoGi') : ''}
${gym.matFee === 0 ? '✅ Free Open Mat' : gym.matFee ? `💵 Drop-in: $${gym.matFee}` : 'Contact gym for pricing'}

Find more open mats 👇
https://bit.ly/40DjTlM`;

    await Clipboard.setStringAsync(copyText);
    
    haptics.success(); // Success haptic for successful copy
  } catch (error) {
    haptics.error();
    console.error('Failed to copy:', error);
    throw error;
  }
};

/**
 * Format open mats for display
 */
export const formatOpenMats = (openMats: OpenMatSession[]): string => {
  if (!openMats || openMats.length === 0) return 'No sessions';
  
  const sessions = openMats.slice(0, 3).map(session => 
    `${session.day} ${formatTimeRange(session.time)}`
  );
  
  if (openMats.length > 3) {
    sessions.push(`+${openMats.length - 3} more`);
  }
  
  return sessions.join(' • ');
};

/**
 * Format sessions list for display
 */
export const formatSessionsList = (openMats: OpenMatSession[]): string => {
  if (!openMats || openMats.length === 0) return 'No sessions available';
  
  return openMats.map(session => 
    `${session.day}: ${formatTimeRange(session.time)} (${getSessionTypeWithIcon(session.type)})`
  ).join('\n');
}; 