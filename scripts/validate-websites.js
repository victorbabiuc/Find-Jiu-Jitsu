#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * Website Validation Script for JiuJitsu Finder
 * Checks if all gym websites in CSV files are still active
 */

class WebsiteValidator {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.reportPath = path.join(__dirname, 'validation-report.json');
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {
        total: 0,
        active: 0,
        broken: 0,
        errors: 0
      },
      details: []
    };
    this.timeout = 5000; // 5 second timeout
  }

  /**
   * Main validation function
   */
  async validateAllWebsites() {
    console.log('🔍 Starting website validation for JiuJitsu Finder...\n');
    
    try {
      // Read all CSV files
      const csvFiles = await this.getCSVFiles();
      console.log(`📁 Found ${csvFiles.length} CSV files to process\n`);
      
      // Process each CSV file
      for (const csvFile of csvFiles) {
        await this.processCSVFile(csvFile);
      }
      
      // Generate and save report
      await this.generateReport();
      
      // Display summary
      this.displaySummary();
      
    } catch (error) {
      console.error('❌ Error during validation:', error.message);
      process.exit(1);
    }
  }

  /**
   * Get all CSV files from data directory
   */
  async getCSVFiles() {
    const files = fs.readdirSync(this.dataDir);
    return files
      .filter(file => file.endsWith('.csv'))
      .map(file => path.join(this.dataDir, file));
  }

  /**
   * Process a single CSV file
   */
  async processCSVFile(filePath) {
    const fileName = path.basename(filePath);
    console.log(`📊 Processing ${fileName}...`);
    
    try {
      const csvContent = fs.readFileSync(filePath, 'utf8');
      const gyms = this.parseCSV(csvContent);
      
      console.log(`   Found ${gyms.length} gyms in ${fileName}`);
      
      // Validate websites for each gym
      for (const gym of gyms) {
        if (this.shouldValidateWebsite(gym.website)) {
          await this.validateWebsite(gym, fileName);
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing ${fileName}:`, error.message);
    }
  }

  /**
   * Parse CSV content into array of gym objects
   */
  parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const gyms = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length >= headers.length) {
        const gym = {};
        headers.forEach((header, index) => {
          gym[header] = values[index] ? values[index].replace(/"/g, '').trim() : '';
        });
        gyms.push(gym);
      }
    }
    
    return gyms;
  }

  /**
   * Parse CSV line handling quoted values
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  /**
   * Check if website should be validated
   */
  shouldValidateWebsite(website) {
    if (!website || website.trim() === '') return false;
    if (website.toLowerCase() === 'no website') return false;
    if (website.toLowerCase() === 'contact') return false;
    if (website.toLowerCase() === 'n/a') return false;
    return true;
  }

  /**
   * Validate a single website
   */
  async validateWebsite(gym, sourceFile) {
    const website = this.normalizeWebsite(gym.website);
    
    try {
      const result = await this.checkWebsite(website);
      
      const validationResult = {
        gym: gym.name || 'Unknown',
        id: gym.id || 'Unknown',
        website: website,
        sourceFile: sourceFile,
        status: result.status,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        error: result.error || null,
        timestamp: new Date().toISOString()
      };
      
      this.results.details.push(validationResult);
      this.results.summary.total++;
      
      if (result.status === 'active') {
        this.results.summary.active++;
        console.log(`   ✅ ${gym.name}: ${website} (${result.statusCode})`);
      } else if (result.status === 'broken') {
        this.results.summary.broken++;
        console.log(`   ❌ ${gym.name}: ${website} (${result.statusCode})`);
      } else {
        this.results.summary.errors++;
        console.log(`   ⚠️  ${gym.name}: ${website} (${result.error})`);
      }
      
    } catch (error) {
      const validationResult = {
        gym: gym.name || 'Unknown',
        id: gym.id || 'Unknown',
        website: website,
        sourceFile: sourceFile,
        status: 'error',
        statusCode: null,
        responseTime: null,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.results.details.push(validationResult);
      this.results.summary.total++;
      this.results.summary.errors++;
      
      console.log(`   ⚠️  ${gym.name}: ${website} (${error.message})`);
    }
  }

  /**
   * Normalize website URL
   */
  normalizeWebsite(website) {
    let normalized = website.trim();
    
    // Add protocol if missing
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    
    // Remove trailing slash
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    
    return normalized;
  }

  /**
   * Check website status
   */
  async checkWebsite(url) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const req = client.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'JiuJitsu-Finder-Validator/1.0'
        }
      }, (res) => {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;
        
        if (statusCode >= 200 && statusCode < 400) {
          resolve({
            status: 'active',
            statusCode,
            responseTime,
            error: null
          });
        } else {
          resolve({
            status: 'broken',
            statusCode,
            responseTime,
            error: `HTTP ${statusCode}`
          });
        }
      });
      
      req.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        let errorMessage = error.message;
        
        // Categorize common errors
        if (error.code === 'ENOTFOUND') {
          errorMessage = 'Domain not found';
        } else if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Connection refused';
        } else if (error.code === 'ETIMEDOUT') {
          errorMessage = 'Connection timeout';
        } else if (error.code === 'CERT_HAS_EXPIRED') {
          errorMessage = 'SSL certificate expired';
        } else if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
          errorMessage = 'SSL verification failed';
        }
        
        resolve({
          status: 'error',
          statusCode: null,
          responseTime,
          error: errorMessage
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        const responseTime = Date.now() - startTime;
        resolve({
          status: 'error',
          statusCode: null,
          responseTime,
          error: 'Request timeout'
        });
      });
      
      req.setTimeout(this.timeout);
    });
  }

  /**
   * Generate and save validation report
   */
  async generateReport() {
    try {
      // Create reports directory if it doesn't exist
      const reportsDir = path.join(__dirname, 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
      }
      
      // Save detailed report
      const reportPath = path.join(reportsDir, 'validation-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
      
      // Save summary report
      const summaryPath = path.join(reportsDir, 'validation-summary.txt');
      const summary = this.generateSummaryText();
      fs.writeFileSync(summaryPath, summary);
      
      console.log(`\n📄 Reports saved to:`);
      console.log(`   📊 Detailed: ${reportPath}`);
      console.log(`   📋 Summary: ${summaryPath}`);
      
    } catch (error) {
      console.error('❌ Error saving report:', error.message);
    }
  }

  /**
   * Generate summary text report
   */
  generateSummaryText() {
    const { summary, details } = this.results;
    
    let summaryText = `JiuJitsu Finder - Website Validation Report\n`;
    summaryText += `Generated: ${new Date().toLocaleString()}\n`;
    summaryText += `\n`;
    summaryText += `SUMMARY:\n`;
    summaryText += `  Total websites checked: ${summary.total}\n`;
    summaryText += `  Active websites: ${summary.active}\n`;
    summaryText += `  Broken websites: ${summary.broken}\n`;
    summaryText += `  Errors: ${summary.errors}\n`;
    summaryText += `\n`;
    
    if (summary.broken > 0) {
      summaryText += `BROKEN WEBSITES:\n`;
      details
        .filter(d => d.status === 'broken')
        .forEach(d => {
          summaryText += `  ❌ ${d.gym} (${d.id}): ${d.website} - HTTP ${d.statusCode}\n`;
        });
      summaryText += `\n`;
    }
    
    if (summary.errors > 0) {
      summaryText += `WEBSITES WITH ERRORS:\n`;
      details
        .filter(d => d.status === 'error')
        .forEach(d => {
          summaryText += `  ⚠️  ${d.gym} (${d.id}): ${d.website} - ${d.error}\n`;
        });
      summaryText += `\n`;
    }
    
    summaryText += `ACTIVE WEBSITES: ${summary.active}\n`;
    
    return summaryText;
  }

  /**
   * Display validation summary
   */
  displaySummary() {
    const { summary } = this.results;
    
    console.log('\n📊 VALIDATION COMPLETE');
    console.log('='.repeat(50));
    console.log(`Total websites checked: ${summary.total}`);
    console.log(`✅ Active websites: ${summary.active}`);
    console.log(`❌ Broken websites: ${summary.broken}`);
    console.log(`⚠️  Errors: ${summary.errors}`);
    console.log('='.repeat(50));
    
    if (summary.broken > 0) {
      console.log('\n🔴 BROKEN WEBSITES NEED ATTENTION:');
      this.results.details
        .filter(d => d.status === 'broken')
        .forEach(d => {
          console.log(`   ❌ ${d.gym}: ${d.website} (HTTP ${d.statusCode})`);
        });
    }
    
    if (summary.errors > 0) {
      console.log('\n🟡 WEBSITES WITH ERRORS:');
      this.results.details
        .filter(d => d.status === 'error')
        .forEach(d => {
          console.log(`   ⚠️  ${d.gym}: ${d.website} (${d.error})`);
        });
    }
    
    if (summary.broken === 0 && summary.errors === 0) {
      console.log('\n🎉 All websites are working correctly!');
    } else {
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('   1. Fix broken websites (HTTP 4xx/5xx)');
      console.log('   2. Investigate connection errors');
      console.log('   3. Update CSV files with corrected URLs');
      console.log('   4. Run validation again after fixes');
    }
  }
}

// Run validation if script is called directly
if (require.main === module) {
  const validator = new WebsiteValidator();
  validator.validateAllWebsites().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = WebsiteValidator;
