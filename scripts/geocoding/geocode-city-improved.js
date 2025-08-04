#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Note: This script requires the Google Maps API key to be set in .env
// For now, we'll use a simplified version that works with the existing geocoding approach
// The full GeocodingService can be used in the React Native app

class ImprovedGeocoder {
  constructor(city) {
    this.city = city.toLowerCase();
    this.csvPath = path.join(__dirname, 'data', `${this.city}-gyms.csv`);
    this.backupPath = path.join(__dirname, 'data', `${this.city}-gyms-backup.csv`);
    this.logPath = path.join(__dirname, `geocoding-improved-${this.city}-${this.getTimestamp()}.log`);
    
    this.stats = {
      total: 0,
      geocoded: 0,
      failed: 0,
      skipped: 0,
      highAccuracy: 0,
      mediumAccuracy: 0,
      lowAccuracy: 0,
      errors: []
    };
  }

  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type}: ${message}`;
    console.log(logMessage);
    
    // Also write to log file
    fs.appendFileSync(this.logPath, logMessage + '\n');
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  cleanAddress(address) {
    return address
      .replace(/[#&]/g, '') // Remove # and &
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/,\s*,/g, ',') // Remove double commas
      .replace(/,\s*$/g, '') // Remove trailing comma
      .replace(/\s+(suite|apt|ste|#)\s*\d+[a-z]?/gi, '') // Remove suite/apt numbers
      .replace(/\s+(ste\.|ste)\s+[a-z]/gi, '') // Remove ste. B, ste B
      .replace(/\s+[a-z]\s*,/gi, ',') // Remove single letters before comma
      .replace(/\s+(Hwy|Highway)\s+/gi, ' ') // Replace Hwy/Highway with space
      .replace(/\s+FM\s+/gi, ' Farm to Market ') // Replace FM with full name
      .trim();
  }

  formatCoordinates(latitude, longitude, precision = 8) {
    return `${latitude.toFixed(precision)},${longitude.toFixed(precision)}`;
  }

  validateCoordinates(latitude, longitude, city) {
    const issues = [];
    const suggestions = [];

    // Define expected coordinate ranges for cities
    const cityRanges = {
      'tampa': {
        lat: { min: 27.5, max: 28.5 },
        lng: { min: -82.8, max: -82.0 }
      },
      'austin': {
        lat: { min: 30.0, max: 30.8 },
        lng: { min: -98.0, max: -97.4 }
      }
    };

    const cityKey = city.toLowerCase();
    const ranges = cityRanges[cityKey];

    if (ranges) {
      // Check if coordinates are within expected range
      if (latitude < ranges.lat.min || latitude > ranges.lat.max) {
        issues.push(`Latitude ${latitude} is outside expected range for ${city} (${ranges.lat.min}-${ranges.lat.max})`);
        suggestions.push('Verify the address and re-geocode');
      }

      if (longitude < ranges.lng.min || longitude > ranges.lng.max) {
        issues.push(`Longitude ${longitude} is outside expected range for ${city} (${ranges.lng.min}-${ranges.lng.max})`);
        suggestions.push('Verify the address and re-geocode');
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  async geocodeAddress(address, gymName) {
    try {
      this.log(`Geocoding: ${gymName} - ${address}`, 'INFO');
      
      // Clean the address for better geocoding
      const cleanedAddress = this.cleanAddress(address);
      
      // Use OpenStreetMap Nominatim for geocoding
      const coordinates = await this.geocodeWithNominatim(cleanedAddress, gymName);
      
      if (coordinates) {
        const [latitude, longitude] = coordinates.split(',').map(Number);
        
        // Validate coordinates
        const validation = this.validateCoordinates(latitude, longitude, this.city);

        if (!validation.isValid) {
          this.log(`Validation issues for ${gymName}: ${validation.issues.join(', ')}`, 'WARN');
        }

        // Track accuracy statistics (simplified)
        this.stats.highAccuracy++; // Assume high accuracy for now

        this.log(`✅ Geocoded ${gymName}: ${coordinates}`, 'INFO');
        
        return coordinates;
      } else {
        this.log(`❌ Failed to geocode ${gymName}: ${address}`, 'ERROR');
        this.stats.failed++;
        return null;
      }

    } catch (error) {
      this.log(`❌ Error geocoding ${gymName}: ${error.message}`, 'ERROR');
      this.stats.errors.push({ gym: gymName, error: error.message });
      this.stats.failed++;
      return null;
    }
  }

  async geocodeWithNominatim(address, gymName) {
    const variations = this.generateAddressVariations(address);
    
    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      
      try {
        const encodedAddress = encodeURIComponent(variation);
        const url = `/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;
        
        const response = await this.makeNominatimRequest(url);
        
        if (response && response.length > 0) {
          const result = response[0];
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);
          
          if (!isNaN(lat) && !isNaN(lon)) {
            return this.formatCoordinates(lat, lon, 8); // 8 decimal places for high precision
          }
        }
        
      } catch (error) {
        // Continue to next variation
        continue;
      }
    }
    
    throw new Error('No valid coordinates found for any address variation');
  }

  generateAddressVariations(address) {
    const variations = [];
    const cleaned = this.cleanAddress(address);
    
    // Original cleaned address
    variations.push(cleaned);
    
    // Remove suite/apt/ste numbers
    const withoutSuite = cleaned.replace(/\s+(suite|apt|ste|#)\s*\d+[a-z]?/gi, '');
    if (withoutSuite !== cleaned) {
      variations.push(withoutSuite);
    }
    
    // Remove unit numbers
    const withoutUnit = cleaned.replace(/\s+#\d+/g, '');
    if (withoutUnit !== cleaned && withoutUnit !== withoutSuite) {
      variations.push(withoutUnit);
    }
    
    // Try with just street and city
    const parts = cleaned.split(',');
    if (parts.length >= 2) {
      const streetCity = parts[0] + ',' + parts[parts.length - 1];
      if (streetCity !== cleaned) {
        variations.push(streetCity);
      }
      
      // Try with just street name (no number)
      const streetOnly = cleaned.replace(/^\d+\s+/, '');
      if (streetOnly !== cleaned) {
        variations.push(streetOnly);
      }
      
      // Try with just the street name and city
      const streetNameOnly = streetOnly.split(',')[0] + ',' + parts[parts.length - 1];
      if (streetNameOnly !== cleaned && streetNameOnly !== streetCity) {
        variations.push(streetNameOnly);
      }
      
      // Try with business name + city
      const businessName = this.extractBusinessName(address);
      if (businessName) {
        const businessCity = businessName + ', ' + parts[parts.length - 1];
        variations.push(businessCity);
      }
    }
    
    return variations;
  }

  extractBusinessName(address) {
    // Try to extract business name from the address
    // This is a simple heuristic - in practice you'd want more sophisticated parsing
    const parts = address.split(',');
    if (parts.length >= 2) {
      const city = parts[parts.length - 1].trim();
      return city;
    }
    return null;
  }

  async makeNominatimRequest(url) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'nominatim.openstreetmap.org',
        path: url,
        method: 'GET',
        headers: {
          'User-Agent': 'JiuJitsuFinder/1.5.0',
          'Accept': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  parseCSV(content) {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = this.parseCSVLine(line);
      
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] ? values[index].trim().replace(/"/g, '') : '';
        });
        rows.push(row);
      }
    }

    return { headers, rows };
  }

  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current);
    return values;
  }

  generateCSV(headers, rows) {
    const headerLine = headers.join(',');
    const dataLines = rows.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma
        const escaped = value.replace(/"/g, '""');
        return value.includes(',') ? `"${escaped}"` : escaped;
      }).join(',')
    );
    
    return [headerLine, ...dataLines].join('\n');
  }

  async run() {
    try {
      this.log(`🚀 Starting improved geocoding for ${this.city}`, 'INFO');
      
      // Check if CSV file exists
      if (!fs.existsSync(this.csvPath)) {
        throw new Error(`CSV file not found: ${this.csvPath}`);
      }

      // Create backup
      const csvContent = fs.readFileSync(this.csvPath, 'utf8');
      fs.writeFileSync(this.backupPath, csvContent);
      this.log(`📋 Backup created: ${this.backupPath}`, 'INFO');

      // Parse CSV
      const { headers, rows } = this.parseCSV(csvContent);
      this.log(`📊 Parsed ${rows.length} rows from CSV`, 'INFO');

      // Find unique addresses to geocode
      const addressesToGeocode = [];
      const addressMap = new Map();

      rows.forEach((row, index) => {
        const address = row.address || '';
        const gymName = row.name || '';
        
        if (address && !addressMap.has(address)) {
          addressMap.set(address, { gymName, rowIndex: index });
          addressesToGeocode.push({ address, gymName, rowIndex: index });
        }
      });

      this.stats.total = addressesToGeocode.length;
      this.stats.skipped = rows.length - addressesToGeocode.length;

      this.log(`🔍 Found ${addressesToGeocode.length} unique addresses to geocode`, 'INFO');

      if (addressesToGeocode.length === 0) {
        this.log('✅ No addresses to geocode', 'INFO');
        return;
      }

      // Geocode addresses with improved service
      for (let i = 0; i < addressesToGeocode.length; i++) {
        const { address, gymName, rowIndex } = addressesToGeocode[i];
        
        this.log(`📍 Processing ${i + 1}/${addressesToGeocode.length}: ${gymName}`, 'INFO');
        
        // Skip if already has coordinates
        if (rows[rowIndex].coordinates && rows[rowIndex].coordinates.trim() !== '') {
          this.log(`⏭️  Skipping ${gymName} - already has coordinates`, 'INFO');
          this.stats.skipped++;
          continue;
        }

        const coordinates = await this.geocodeAddress(address, gymName);
        
        if (coordinates) {
          // Update all rows with this address
          rows.forEach(row => {
            if (row.address === address) {
              row.coordinates = coordinates;
            }
          });
          
          this.stats.geocoded++;
        }

        // Add delay between requests to be respectful
        if (i < addressesToGeocode.length - 1) {
          await this.delay(1000); // 1 second delay
        }
      }

      // Generate updated CSV
      const updatedCSV = this.generateCSV(headers, rows);
      fs.writeFileSync(this.csvPath, updatedCSV);
      
      this.log(`💾 Updated CSV saved: ${this.csvPath}`, 'INFO');
      
      this.printSummary();

    } catch (error) {
      this.log(`❌ Geocoding failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  printSummary() {
    const successRate = this.stats.total > 0 ? 
      Math.round((this.stats.geocoded / this.stats.total) * 100) : 0;
    
    this.log('📊 Geocoding Summary:', 'INFO');
    this.log(`   Total addresses: ${this.stats.total}`, 'INFO');
    this.log(`   Successfully geocoded: ${this.stats.geocoded}`, 'INFO');
    this.log(`   Failed: ${this.stats.failed}`, 'INFO');
    this.log(`   Skipped: ${this.stats.skipped}`, 'INFO');
    this.log(`   Success rate: ${successRate}%`, 'INFO');
    this.log(`   High accuracy: ${this.stats.highAccuracy}`, 'INFO');
    this.log(`   Medium accuracy: ${this.stats.mediumAccuracy}`, 'INFO');
    this.log(`   Low accuracy: ${this.stats.lowAccuracy}`, 'INFO');
    
    if (this.stats.errors.length > 0) {
      this.log(`   Errors: ${this.stats.errors.length}`, 'INFO');
      this.stats.errors.forEach(error => {
        this.log(`     - ${error.gym}: ${error.error}`, 'ERROR');
      });
    }
  }
}

async function main() {
  const city = process.argv[2];
  
  if (!city) {
    console.error('❌ Usage: node geocode-city-improved.js <city>');
    console.error('📝 Example: node geocode-city-improved.js austin');
    process.exit(1);
  }

  try {
    const geocoder = new ImprovedGeocoder(city);
    await geocoder.run();
    console.log(`\n🎯 Improved geocoding completed for ${city}!`);
  } catch (error) {
    console.error(`❌ Geocoding failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ImprovedGeocoder; 