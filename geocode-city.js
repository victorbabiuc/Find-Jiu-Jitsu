#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const path = require('path');

// Configuration
const DELAY_BETWEEN_REQUESTS = 1500; // 1.5 seconds
const USER_AGENT = 'FindJiuJitsu/1.0';
const NOMINATIM_BASE_URL = 'nominatim.openstreetmap.org';

class Geocoder {
  constructor(city) {
    this.city = city.toLowerCase();
    this.csvPath = path.join(__dirname, 'data', `${this.city}-gyms.csv`);
    this.backupPath = path.join(__dirname, 'data', `${this.city}-gyms-backup.csv`);
    this.logPath = path.join(__dirname, `geocoding-${this.city}-${this.getTimestamp()}.log`);
    
    this.stats = {
      total: 0,
      geocoded: 0,
      failed: 0,
      skipped: 0,
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
    // Remove special characters and normalize
    return address
      .replace(/[#&]/g, '') // Remove # and &
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/,\s*,/g, ',') // Remove double commas
      .replace(/,\s*$/g, '') // Remove trailing comma
      .trim();
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
    }
    
    return variations;
  }

  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: NOMINATIM_BASE_URL,
        path: url,
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const jsonData = JSON.parse(data);
              resolve(jsonData);
            } catch (error) {
              reject(new Error(`Failed to parse JSON response: ${error.message}`));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  async geocodeAddress(address, retryCount = 0) {
    const variations = this.generateAddressVariations(address);
    
    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      
      try {
        const encodedAddress = encodeURIComponent(variation);
        const url = `/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;
        
        const response = await this.makeRequest(url);
        
        if (response && response.length > 0) {
          const result = response[0];
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);
          
          if (!isNaN(lat) && !isNaN(lon)) {
            // Verify it's in the right area (rough check)
            const isInTexas = result.address && (
              result.address.state === 'Texas' || 
              result.address.state === 'TX' ||
              result.display_name.toLowerCase().includes('texas')
            );
            
            if (isInTexas || i === 0) { // Accept first variation even if state check fails
              return `${lat},${lon}`;
            }
          }
        }
        
      } catch (error) {
        // Continue to next variation
        continue;
      }
    }
    
    // If we get here, all variations failed
    if (retryCount < 1) {
      this.log(`Retrying geocoding for "${address}" (attempt ${retryCount + 2})`, 'WARN');
      await this.delay(2000); // Longer delay for retry
      return this.geocodeAddress(address, retryCount + 1);
    }
    
    throw new Error('No valid coordinates found for any address variation');
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
        // Quote values that contain commas, quotes, or newlines
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    return [headerLine, ...dataLines].join('\n');
  }

  async run() {
    try {
      this.log(`Starting geocoding for ${this.city}`);
      this.log(`CSV file: ${this.csvPath}`);
      this.log(`Backup file: ${this.backupPath}`);
      this.log(`Log file: ${this.logPath}`);

      // Check if CSV file exists
      if (!fs.existsSync(this.csvPath)) {
        throw new Error(`CSV file not found: ${this.csvPath}`);
      }

      // Read and parse CSV
      this.log('Reading CSV file...');
      const csvContent = fs.readFileSync(this.csvPath, 'utf8');
      const { headers, rows } = this.parseCSV(csvContent);
      
      this.log(`Found ${rows.length} rows in CSV`);
      this.log(`Headers: ${headers.join(', ')}`);

      // Check if coordinates column exists
      if (!headers.includes('coordinates')) {
        throw new Error('CSV file does not have a "coordinates" column');
      }

      // Create backup
      this.log('Creating backup...');
      fs.copyFileSync(this.csvPath, this.backupPath);
      this.log('Backup created successfully');

      // Find unique addresses that need geocoding
      const addressesToGeocode = [];
      const addressMap = new Map(); // address -> row indices

      rows.forEach((row, index) => {
        const address = row.address || '';
        const coordinates = row.coordinates || '';
        
        if (address && !coordinates.trim()) {
          if (!addressMap.has(address)) {
            addressMap.set(address, []);
            addressesToGeocode.push(address);
          }
          addressMap.get(address).push(index);
        }
      });

      this.stats.total = addressesToGeocode.length;
      this.stats.skipped = rows.length - addressesToGeocode.length;

      this.log(`Found ${addressesToGeocode.length} unique addresses to geocode`);
      this.log(`${this.stats.skipped} rows already have coordinates or no address`);

      if (addressesToGeocode.length === 0) {
        this.log('No addresses need geocoding. Exiting.');
        return;
      }

      // Geocode addresses
      this.log('Starting geocoding process...');
      this.log(`Rate limit: ${DELAY_BETWEEN_REQUESTS}ms between requests`);

      for (let i = 0; i < addressesToGeocode.length; i++) {
        const address = addressesToGeocode[i];
        const rowIndices = addressMap.get(address);
        
        this.log(`Geocoding ${i + 1}/${addressesToGeocode.length}: ${address}`, 'INFO');
        
        try {
          const coordinates = await this.geocodeAddress(address);
          
          // Update all rows with this address
          rowIndices.forEach(rowIndex => {
            rows[rowIndex].coordinates = coordinates;
          });
          
          this.stats.geocoded++;
          this.log(`✅ Success: ${coordinates}`, 'SUCCESS');
          
        } catch (error) {
          this.stats.failed++;
          this.stats.errors.push({ address, error: error.message });
          this.log(`❌ Failed: ${error.message}`, 'ERROR');
        }

        // Delay between requests (except for the last one)
        if (i < addressesToGeocode.length - 1) {
          await this.delay(DELAY_BETWEEN_REQUESTS);
        }
      }

      // Write updated CSV
      this.log('Writing updated CSV file...');
      const updatedCSV = this.generateCSV(headers, rows);
      fs.writeFileSync(this.csvPath, updatedCSV);
      this.log('CSV file updated successfully');

      // Print summary
      this.printSummary();

    } catch (error) {
      this.log(`Fatal error: ${error.message}`, 'ERROR');
      console.error(error);
      process.exit(1);
    }
  }

  printSummary() {
    const successRate = this.stats.total > 0 ? 
      Math.round((this.stats.geocoded / this.stats.total) * 100) : 0;

    this.log('='.repeat(50));
    this.log('GEOCODING SUMMARY');
    this.log('='.repeat(50));
    this.log(`City: ${this.city}`);
    this.log(`Total addresses: ${this.stats.total}`);
    this.log(`Successfully geocoded: ${this.stats.geocoded}`);
    this.log(`Failed: ${this.stats.failed}`);
    this.log(`Skipped (already had coordinates): ${this.stats.skipped}`);
    this.log(`Success rate: ${successRate}%`);
    
    if (this.stats.errors.length > 0) {
      this.log('');
      this.log('FAILED ADDRESSES:');
      this.stats.errors.forEach(({ address, error }) => {
        this.log(`  - ${address}: ${error}`);
      });
    }
    
    this.log('');
    this.log(`Backup saved to: ${this.backupPath}`);
    this.log(`Log saved to: ${this.logPath}`);
    this.log('='.repeat(50));
    
    // Also print to console
    console.log(`\n🎯 Summary: Success: ${this.stats.geocoded}/${this.stats.total} geocoded, ${this.stats.failed} failed`);
  }
}

// Main execution
async function main() {
  const city = process.argv[2];
  
  if (!city) {
    console.error('Usage: node geocode-city.js <city>');
    console.error('Example: node geocode-city.js austin');
    process.exit(1);
  }

  const geocoder = new Geocoder(city);
  await geocoder.run();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = Geocoder; 