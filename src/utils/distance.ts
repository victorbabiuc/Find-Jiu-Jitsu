/**
 * Distance calculation utilities using the Haversine formula
 * Calculates the great-circle distance between two points on Earth
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param coord1 - First coordinate (latitude, longitude)
 * @param coord2 - Second coordinate (latitude, longitude)
 * @returns Distance in miles, rounded to 1 decimal place
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 3959; // Earth's radius in miles

  const lat1Rad = toRadians(coord1.latitude);
  const lat2Rad = toRadians(coord2.latitude);
  const deltaLatRad = toRadians(coord2.latitude - coord1.latitude);
  const deltaLonRad = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 1 decimal place
  return Math.round(distance * 10) / 10;
}

/**
 * Convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param distance - Distance in miles
 * @returns Formatted distance string (e.g., "2.3 mi", "0.5 mi")
 */
export function formatDistance(distance: number): string {
  if (distance < 0.1) {
    return '< 0.1 mi';
  }
  return `${distance} mi`;
}

/**
 * Calculate distance from user location to gym
 * @param userLocation - User's current coordinates
 * @param gymCoordinates - Gym's coordinates (string format: "lat,lng")
 * @returns Distance in miles, or null if coordinates are invalid
 */
export function calculateGymDistance(
  userLocation: Coordinates | null,
  gymCoordinates: string | undefined
): number | null {
  if (!userLocation || !gymCoordinates) {
    return null;
  }

  try {
    const [lat, lng] = gymCoordinates.split(',').map(coord => parseFloat(coord.trim()));

    if (isNaN(lat) || isNaN(lng)) {
      return null;
    }

    const gymCoord: Coordinates = { latitude: lat, longitude: lng };
    return calculateDistance(userLocation, gymCoord);
  } catch (error) {
    return null;
  }
}
