import { logger } from './logger';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  accuracy: 'high' | 'medium' | 'low';
  formattedAddress: string;
  confidence: number; // 0-1 scale
}

export interface CoordinateValidation {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}

/**
 * Enhanced geocoding utility for gym locations
 * Provides better accuracy and validation than the current OpenStreetMap approach
 */
export class GeocodingService {
  private static readonly GOOGLE_GEOCODING_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  private static readonly NOMINATIM_BASE_URL = 'nominatim.openstreetmap.org';
  private static readonly USER_AGENT = 'JiuJitsuFinder/1.5.0';

  /**
   * Geocode an address with high precision using multiple services
   */
  static async geocodeAddress(address: string, city?: string): Promise<GeocodingResult | null> {
    try {
      logger.info('Geocoding address:', { address, city });

      // Try Google Geocoding API first (most accurate)
      if (this.GOOGLE_GEOCODING_API_KEY) {
        const googleResult = await this.geocodeWithGoogle(address, city);
        if (googleResult && googleResult.confidence > 0.8) {
          logger.info('Google geocoding successful:', {
            address,
            coordinates: `${googleResult.latitude},${googleResult.longitude}`,
            confidence: googleResult.confidence,
          });
          return googleResult;
        }
      }

      // Fallback to OpenStreetMap Nominatim
      const nominatimResult = await this.geocodeWithNominatim(address, city);
      if (nominatimResult) {
        logger.info('Nominatim geocoding successful:', {
          address,
          coordinates: `${nominatimResult.latitude},${nominatimResult.longitude}`,
          confidence: nominatimResult.confidence,
        });
        return nominatimResult;
      }

      logger.warn('Geocoding failed for address:', { address });
      return null;
    } catch (error) {
      logger.error('Geocoding error:', {
        address,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Geocode using Google Maps Geocoding API (highest accuracy)
   */
  private static async geocodeWithGoogle(
    address: string,
    city?: string
  ): Promise<GeocodingResult | null> {
    try {
      const fullAddress = city ? `${address}, ${city}` : address;
      const encodedAddress = encodeURIComponent(fullAddress);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.GOOGLE_GEOCODING_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;

        // Calculate confidence based on result quality
        const confidence = this.calculateGoogleConfidence(result);

        return {
          latitude: location.lat,
          longitude: location.lng,
          accuracy: confidence > 0.9 ? 'high' : confidence > 0.7 ? 'medium' : 'low',
          formattedAddress: result.formatted_address,
          confidence,
        };
      }

      return null;
    } catch (error) {
      logger.error('Google geocoding error:', {
        address,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Geocode using OpenStreetMap Nominatim (fallback)
   */
  private static async geocodeWithNominatim(
    address: string,
    city?: string
  ): Promise<GeocodingResult | null> {
    try {
      const fullAddress = city ? `${address}, ${city}` : address;
      const encodedAddress = encodeURIComponent(fullAddress);
      const url = `/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;

      const response = await this.makeNominatimRequest(url);

      if (response && response.length > 0) {
        const result = response[0];
        const latitude = parseFloat(result.lat);
        const longitude = parseFloat(result.lon);

        if (!isNaN(latitude) && !isNaN(longitude)) {
          const confidence = this.calculateNominatimConfidence(result);

          return {
            latitude,
            longitude,
            accuracy: confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low',
            formattedAddress: result.display_name,
            confidence,
          };
        }
      }

      return null;
    } catch (error) {
      logger.error('Nominatim geocoding error:', {
        address,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Make request to Nominatim API using fetch (React Native compatible)
   */
  private static async makeNominatimRequest(url: string): Promise<any> {
    try {
      const fullUrl = `https://${this.NOMINATIM_BASE_URL}${url}`;

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'User-Agent': this.USER_AGENT,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Nominatim request failed:', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Calculate confidence score for Google geocoding result
   */
  private static calculateGoogleConfidence(result: any): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on result type
    const types = result.types || [];
    if (types.includes('establishment')) confidence += 0.2;
    if (types.includes('premise')) confidence += 0.15;
    if (types.includes('street_address')) confidence += 0.1;

    // Boost confidence based on geometry accuracy
    const geometry = result.geometry;
    if (geometry.location_type === 'ROOFTOP') confidence += 0.2;
    else if (geometry.location_type === 'RANGE_INTERPOLATED') confidence += 0.1;
    else if (geometry.location_type === 'GEOMETRIC_CENTER') confidence += 0.05;

    // Boost confidence based on address components
    const addressComponents = result.address_components || [];
    const hasStreetNumber = addressComponents.some((comp: any) =>
      comp.types.includes('street_number')
    );
    const hasRoute = addressComponents.some((comp: any) => comp.types.includes('route'));

    if (hasStreetNumber && hasRoute) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate confidence score for Nominatim geocoding result
   */
  private static calculateNominatimConfidence(result: any): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on result type
    const type = result.type || '';
    if (type === 'house' || type === 'commercial') confidence += 0.2;
    else if (type === 'street') confidence += 0.1;

    // Boost confidence based on address details
    const address = result.address || {};
    if (address.house_number) confidence += 0.15;
    if (address.road) confidence += 0.1;
    if (address.city || address.town) confidence += 0.05;

    // Boost confidence based on importance score
    const importance = result.importance || 0;
    if (importance > 0.8) confidence += 0.1;
    else if (importance > 0.6) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  /**
   * Validate coordinates for a specific city/region
   */
  static validateCoordinates(
    latitude: number,
    longitude: number,
    city: string
  ): CoordinateValidation {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Define expected coordinate ranges for cities
    const cityRanges = {
      tampa: {
        lat: { min: 27.5, max: 28.5 },
        lng: { min: -82.8, max: -82.0 },
      },
      austin: {
        lat: { min: 30.0, max: 30.8 },
        lng: { min: -98.0, max: -97.4 },
      },
      miami: {
        lat: { min: 25.5, max: 26.5 },
        lng: { min: -81.0, max: -80.0 },
      },
    };

    const cityKey = city.toLowerCase();
    const ranges = cityRanges[cityKey as keyof typeof cityRanges];

    if (ranges) {
      // Check if coordinates are within expected range
      if (latitude < ranges.lat.min || latitude > ranges.lat.max) {
        issues.push(
          `Latitude ${latitude} is outside expected range for ${city} (${ranges.lat.min}-${ranges.lat.max})`
        );
        suggestions.push('Verify the address and re-geocode');
      }

      if (longitude < ranges.lng.min || longitude > ranges.lng.max) {
        issues.push(
          `Longitude ${longitude} is outside expected range for ${city} (${ranges.lng.min}-${ranges.lng.max})`
        );
        suggestions.push('Verify the address and re-geocode');
      }
    }

    // Check for coordinates that might be over water
    if (this.isOverWater(latitude, longitude, city)) {
      issues.push('Coordinates appear to be over water');
      suggestions.push('Verify the address is correct');
    }

    // Check coordinate precision
    const latPrecision = this.getCoordinatePrecision(latitude);
    const lngPrecision = this.getCoordinatePrecision(longitude);

    if (latPrecision < 6 || lngPrecision < 6) {
      issues.push('Low coordinate precision detected');
      suggestions.push('Use higher precision geocoding service');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions,
    };
  }

  /**
   * Check if coordinates might be over water
   */
  private static isOverWater(latitude: number, longitude: number, city: string): boolean {
    // Basic water body checks for Tampa Bay area
    if (city.toLowerCase() === 'tampa') {
      // Tampa Bay area (approximate)
      if (latitude > 27.7 && latitude < 28.0 && longitude > -82.6 && longitude < -82.4) {
        return true;
      }
    }

    // Basic water body checks for Miami area
    if (city.toLowerCase() === 'miami') {
      // Biscayne Bay area (approximate)
      if (latitude > 25.7 && latitude < 25.9 && longitude > -80.2 && longitude < -80.1) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get the precision of a coordinate (number of decimal places)
   */
  private static getCoordinatePrecision(coord: number): number {
    const coordStr = coord.toString();
    const decimalIndex = coordStr.indexOf('.');
    if (decimalIndex === -1) return 0;
    return coordStr.length - decimalIndex - 1;
  }

  /**
   * Format coordinates with consistent precision
   */
  static formatCoordinates(latitude: number, longitude: number, precision: number = 6): string {
    return `${latitude.toFixed(precision)},${longitude.toFixed(precision)}`;
  }

  /**
   * Parse coordinates from string format
   */
  static parseCoordinates(coordString: string): { latitude: number; longitude: number } | null {
    try {
      const [latStr, lngStr] = coordString.split(',').map(s => s.trim());
      const latitude = parseFloat(latStr);
      const longitude = parseFloat(lngStr);

      if (isNaN(latitude) || isNaN(longitude)) {
        return null;
      }

      return { latitude, longitude };
    } catch (error) {
      logger.error('Error parsing coordinates:', {
        coordString,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Clean and standardize address format for better geocoding
   */
  static cleanAddress(address: string): string {
    return address
      .replace(/[#&]/g, '') // Remove # and &
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/,\s*,/g, ',') // Remove double commas
      .replace(/,\s*$/g, '') // Remove trailing comma
      .replace(/\s+(suite|apt|ste|#)\s*\d+[a-z]?/gi, '') // Remove suite/apt numbers
      .trim();
  }
}
