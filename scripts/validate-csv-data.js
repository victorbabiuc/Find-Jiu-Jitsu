#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * CSV Data Validation Script for JiuJitsu Finder
 * Checks for data quality issues that could crash the app
 */

class CSVValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      totalGyms: 0,
      errors: 0,
      warnings: 0
    };
    this.dataDir = path.join(__dirname, '../data');
  }

  /**
   * Read and parse CSV file content
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
   * Get all CSV files from data directory
   */
  getCSVFiles() {
    const files = fs.readdirSync(this.dataDir);
    return files
      .filter(file => file.endsWith('.csv'))
      .map(file => path.join(this.dataDir, file));
  }

  /**
   * Read CSV file and return parsed data
   */
  readCSVFile(filePath) {
    try {
      const csvContent = fs.readFileSync(filePath, 'utf8');
      const gyms = this.parseCSV(csvContent);
      return {
        fileName: path.basename(filePath),
        gyms: gyms,
        totalRows: gyms.length
      };
    } catch (error) {
      this.errors.push({
        file: path.basename(filePath),
        row: 0,
        issue: `Failed to read file: ${error.message}`,
        gym: 'N/A'
      });
      return {
        fileName: path.basename(filePath),
        gyms: [],
        totalRows: 0
      };
    }
  }

  /**
   * Validate individual gym data
   */
  validateGym(gym, rowIndex, fileName) {
    // Check for required fields
    if (!gym.id || !gym.name || !gym.address) {
      this.errors.push({
        file: fileName,
        row: rowIndex + 2, // +2 for header and 0-index
        issue: 'Missing required fields',
        gym: gym.name || 'Unknown',
        details: {
          id: gym.id || 'MISSING',
          name: gym.name || 'MISSING',
          address: gym.address || 'MISSING'
        }
      });
      this.stats.errors++;
    }

    // Check for empty rows (all fields empty)
    const hasAnyData = Object.values(gym).some(value => value && value.trim() !== '');
    if (!hasAnyData) {
      this.errors.push({
        file: fileName,
        row: rowIndex + 2,
        issue: 'Empty row - no data',
        gym: 'Empty Row',
        details: { row: rowIndex + 2 }
      });
      this.stats.errors++;
    }

    // COORDINATE VALIDATION
    // Check coordinates format (should be "lat,lng")
    if (gym.coordinates && gym.coordinates !== 'No coordinates') {
      const coordPattern = /^-?\d+\.\d+,-?\d+\.\d+$/;
      if (!coordPattern.test(gym.coordinates)) {
        this.errors.push({
          file: fileName,
          row: rowIndex + 2,
          issue: 'Invalid coordinates format',
          gym: gym.name,
          details: { value: gym.coordinates, expected: 'lat,lng (e.g., 27.9506,-82.4572)' }
        });
        this.stats.errors++;
      }
    }

    // URL VALIDATION
    // Check website format
    if (gym.website && gym.website !== 'No website' && gym.website !== 'N/A') {
      if (!gym.website.startsWith('http://') && !gym.website.startsWith('https://')) {
        this.warnings.push({
          file: fileName,
          row: rowIndex + 2,
          issue: 'Website missing http/https protocol',
          gym: gym.name,
          details: { value: gym.website, suggestion: 'Add https:// prefix' }
        });
        this.stats.warnings++;
      }
    }

    // DATE VALIDATION
    // Check last_updated format (should be YYYY-MM-DD)
    if (gym.last_updated) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(gym.last_updated)) {
        this.warnings.push({
          file: fileName,
          row: rowIndex + 2,
          issue: 'Invalid date format',
          gym: gym.name,
          details: { value: gym.last_updated, expected: 'YYYY-MM-DD' }
        });
        this.stats.warnings++;
      }
    }

    // FEE VALIDATION
    // Check fee values (should be numbers or specific strings)
    const checkFee = (fee, feeType) => {
      if (fee && fee !== '?' && fee !== 'free' && fee !== 'Free') {
        if (isNaN(Number(fee)) || Number(fee) < 0) {
          this.warnings.push({
            file: fileName,
            row: rowIndex + 2,
            issue: `Invalid ${feeType} value`,
            gym: gym.name,
            details: { value: fee, expected: 'Number, "?", or "free"' }
          });
          this.stats.warnings++;
        }
      }
    };
    
    checkFee(gym.matFee, 'matFee');
    checkFee(gym.dropInFee, 'dropInFee');

    // UPDATE STATS
    this.stats.errors = this.errors.length;
    this.stats.warnings = this.warnings.length;
  }

  /**
   * Check for duplicate IDs across all files
   */
  checkDuplicateIDs(allGyms) {
    const idCounts = {};
    const duplicates = [];

    allGyms.forEach(({ gym, fileName, rowIndex }) => {
      if (gym.id) {
        if (!idCounts[gym.id]) {
          idCounts[gym.id] = [];
        }
        idCounts[gym.id].push({ fileName, rowIndex, gymName: gym.name });
      }
    });

    // Find duplicates
    Object.entries(idCounts).forEach(([id, occurrences]) => {
      if (occurrences.length > 1) {
        this.errors.push({
          file: 'Multiple Files',
          row: 'Multiple Rows',
          issue: 'Duplicate ID found',
          gym: `ID: ${id}`,
          details: {
            id: id,
            occurrences: occurrences.map(o => `${o.fileName}:${o.rowIndex + 2} (${o.gymName})`)
          }
        });
        this.stats.errors++;
      }
    });
  }

  /**
   * Main validation method
   */
  async validateAll() {
    console.log('🔍 Starting CSV data validation for JiuJitsu Finder...\n');
    
    try {
      // Get all CSV files
      const csvFiles = this.getCSVFiles();
      console.log(`📁 Found ${csvFiles.length} CSV files to validate\n`);
      
      const allGyms = [];
      
      // Process each CSV file
      for (const csvFile of csvFiles) {
        const fileData = this.readCSVFile(csvFile);
        console.log(`📊 Processing ${fileData.fileName}...`);
        console.log(`   Found ${fileData.totalRows} gyms`);
        
        // Validate each gym in the file
        fileData.gyms.forEach((gym, index) => {
          this.validateGym(gym, index, fileData.fileName);
          
          // Add to allGyms for duplicate checking
          allGyms.push({
            gym,
            fileName: fileData.fileName,
            rowIndex: index
          });
          
          this.stats.totalGyms++;
        });
        
        console.log(`   ✅ Completed validation for ${fileData.fileName}\n`);
      }
      
      // Check for duplicate IDs across all files
      console.log('🔍 Checking for duplicate IDs across all files...');
      this.checkDuplicateIDs(allGyms);
      
      // Generate and display results
      this.displayResults();
      
      // Generate and save reports
      await this.generateReport();
      
      return {
        success: this.stats.errors === 0,
        stats: this.stats,
        errors: this.errors,
        warnings: this.warnings
      };
      
    } catch (error) {
      console.error('❌ Error during validation:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Display validation results
   */
  displayResults() {
    console.log('\n📊 VALIDATION COMPLETE');
    console.log('='.repeat(50));
    console.log(`Total gyms checked: ${this.stats.totalGyms}`);
    console.log(`❌ Errors found: ${this.stats.errors}`);
    console.log(`⚠️  Warnings: ${this.stats.warnings}`);
    console.log('='.repeat(50));
    
    if (this.errors.length > 0) {
      console.log('\n🔴 ERRORS FOUND:');
      this.errors.forEach((error, index) => {
        console.log(`\n   ${index + 1}. ${error.issue}`);
        console.log(`      File: ${error.file}`);
        console.log(`      Row: ${error.row}`);
        console.log(`      Gym: ${error.gym}`);
        if (error.details) {
          console.log(`      Details: ${JSON.stringify(error.details, null, 2)}`);
        }
      });
      
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('   1. Fix missing required fields (id, name, address)');
      console.log('   2. Remove or fill empty rows');
      console.log('   3. Resolve duplicate IDs across files');
      console.log('   4. Run validation again after fixes');
    } else {
      console.log('\n🎉 No critical errors found! CSV data looks good.');
    }
    
    if (this.warnings.length > 0) {
      console.log('\n🟡 WARNINGS FOUND:');
      
      // Group warnings by type for better organization
      const warningGroups = {};
      this.warnings.forEach(warning => {
        if (!warningGroups[warning.issue]) {
          warningGroups[warning.issue] = [];
        }
        warningGroups[warning.issue].push(warning);
      });
      
      Object.entries(warningGroups).forEach(([issue, warnings], groupIndex) => {
        console.log(`\n   ${groupIndex + 1}. ${issue} (${warnings.length} instances):`);
        warnings.slice(0, 5).forEach((warning, index) => {
          console.log(`      - ${warning.gym} (${warning.file}:${warning.row})`);
          if (warning.details) {
            const details = Object.entries(warning.details)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
            console.log(`        ${details}`);
          }
        });
        
        if (warnings.length > 5) {
          console.log(`      ... and ${warnings.length - 5} more`);
        }
      });
      
      console.log('\n💡 RECOMMENDATIONS FOR WARNINGS:');
      console.log('   1. Add https:// prefix to websites without protocols');
      console.log('   2. Use valid fee values: numbers, "?", or "free"');
      console.log('   3. Ensure dates follow YYYY-MM-DD format');
      console.log('   4. Verify coordinate format is "lat,lng"');
      console.log('   5. Run validation again after fixes');
    }
  }

  /**
   * Generate and save detailed validation report
   */
  async generateReport() {
    try {
      // Create reports directory if it doesn't exist
      const reportsDir = path.join(__dirname, 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
      }
      
      // Create comprehensive report object
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          totalGyms: this.stats.totalGyms,
          errors: this.stats.errors,
          warnings: this.stats.warnings,
          success: this.stats.errors === 0
        },
        errors: this.errors,
        warnings: this.warnings,
        warningGroups: this.groupWarnings(),
        recommendations: this.generateRecommendations()
      };
      
      // Save detailed report
      const reportPath = path.join(reportsDir, 'csv-validation-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      // Save summary report
      const summaryPath = path.join(reportsDir, 'csv-validation-summary.txt');
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
   * Group warnings by type for analysis
   */
  groupWarnings() {
    const groups = {};
    this.warnings.forEach(warning => {
      if (!groups[warning.issue]) {
        groups[warning.issue] = [];
      }
      groups[warning.issue].push(warning);
    });
    
    return Object.entries(groups).map(([issue, warnings]) => ({
      issue,
      count: warnings.length,
      examples: warnings.slice(0, 3).map(w => ({
        gym: w.gym,
        file: w.file,
        row: w.row,
        details: w.details
      }))
    }));
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.errors.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Fix critical errors',
        description: 'Resolve missing required fields and empty rows',
        count: this.errors.length
      });
    }
    
    // Analyze warning patterns
    const warningGroups = this.groupWarnings();
    warningGroups.forEach(group => {
      if (group.issue.includes('Website missing http/https protocol')) {
        recommendations.push({
          priority: 'MEDIUM',
          action: 'Add protocol to websites',
          description: 'Add https:// prefix to websites without protocols',
          count: group.count,
          examples: group.examples.map(e => e.gym)
        });
      } else if (group.issue.includes('Invalid fee value')) {
        recommendations.push({
          priority: 'MEDIUM',
          action: 'Standardize fee values',
          description: 'Use valid fee values: numbers, "?", or "free"',
          count: group.count,
          examples: group.examples.map(e => e.gym)
        });
      }
    });
    
    return recommendations;
  }

  /**
   * Generate summary text report
   */
  generateSummaryText() {
    let summaryText = `JiuJitsu Finder - CSV Validation Report\n`;
    summaryText += `Generated: ${new Date().toLocaleString()}\n`;
    summaryText += `\n`;
    summaryText += `SUMMARY:\n`;
    summaryText += `  Total gyms checked: ${this.stats.totalGyms}\n`;
    summaryText += `  Errors found: ${this.stats.errors}\n`;
    summaryText += `  Warnings: ${this.stats.warnings}\n`;
    summaryText += `  Validation status: ${this.stats.errors === 0 ? 'PASSED' : 'FAILED'}\n`;
    summaryText += `\n`;
    
    if (this.errors.length > 0) {
      summaryText += `CRITICAL ERRORS:\n`;
      this.errors.forEach((error, index) => {
        summaryText += `  ❌ ${error.issue}\n`;
        summaryText += `     File: ${error.file}, Row: ${error.row}\n`;
        summaryText += `     Gym: ${error.gym}\n\n`;
      });
    }
    
    if (this.warnings.length > 0) {
      summaryText += `WARNINGS BY TYPE:\n`;
      const warningGroups = this.groupWarnings();
      warningGroups.forEach(group => {
        summaryText += `  ⚠️  ${group.issue}: ${group.count} instances\n`;
        group.examples.forEach(example => {
          summaryText += `     - ${example.gym} (${example.file}:${example.row})\n`;
        });
        summaryText += `\n`;
      });
    }
    
    summaryText += `RECOMMENDATIONS:\n`;
    const recommendations = this.generateRecommendations();
    recommendations.forEach((rec, index) => {
      summaryText += `  ${index + 1}. [${rec.priority}] ${rec.action}\n`;
      summaryText += `     ${rec.description} (${rec.count} items)\n`;
      if (rec.examples) {
        summaryText += `     Examples: ${rec.examples.join(', ')}\n`;
      }
      summaryText += `\n`;
    });
    
    return summaryText;
  }
}

// Run validation if script is called directly
if (require.main === module) {
  const validator = new CSVValidator();
  validator.validateAll().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = CSVValidator;
