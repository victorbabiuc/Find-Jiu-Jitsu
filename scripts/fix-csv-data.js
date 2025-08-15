#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * CSV Data Auto-Fix Script for JiuJitsu Finder
 * Automatically corrects common data format issues found by the validator
 */

class CSVAutoFixer {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.reportsDir = path.join(__dirname, 'reports');
    this.backupDir = path.join(__dirname, 'backups');
    this.fixes = [];
    this.stats = {
      totalFiles: 0,
      totalFixes: 0,
      filesProcessed: 0,
      errors: 0
    };
  }

  /**
   * Read validation report to identify fixable issues
   */
  readValidationReport() {
    try {
      const reportPath = path.join(this.reportsDir, 'csv-validation-report.json');
      if (!fs.existsSync(reportPath)) {
        throw new Error('Validation report not found. Run validate-csv-data first.');
      }
      
      const reportContent = fs.readFileSync(reportPath, 'utf8');
      const report = JSON.parse(reportContent);
      
      console.log('📊 Validation Report Summary:');
      console.log(`   Total gyms: ${report.summary.totalGyms}`);
      console.log(`   Errors: ${report.summary.errors}`);
      console.log(`   Warnings: ${report.summary.warnings}\n`);
      
      return report;
    } catch (error) {
      console.error('❌ Error reading validation report:', error.message);
      process.exit(1);
    }
  }

  /**
   * Create backup directory and backup original files
   */
  createBackups() {
    try {
      // Create backup directory
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir);
      }
      
      // Create timestamped backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `backup-${timestamp}`);
      fs.mkdirSync(backupPath);
      
      // Copy all CSV files to backup
      const csvFiles = this.getCSVFiles();
      csvFiles.forEach(csvFile => {
        const fileName = path.basename(csvFile);
        const backupFile = path.join(backupPath, fileName);
        fs.copyFileSync(csvFile, backupFile);
      });
      
      console.log(`📦 Backups created in: ${backupPath}\n`);
      return backupPath;
    } catch (error) {
      console.error('❌ Error creating backups:', error.message);
      process.exit(1);
    }
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
   * Parse CSV content into array of gym objects
   */
  parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], gyms: [] };
    
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
    
    return { headers, gyms };
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
   * Fix website protocol (add https:// if missing)
   */
  fixWebsiteProtocol(website) {
    if (website && website !== 'No website' && website !== 'N/A' && website !== 'Contact') {
      if (!website.startsWith('http://') && !website.startsWith('https://')) {
        return 'https://' + website;
      }
    }
    return website;
  }

  /**
   * Standardize fee values
   */
  fixFeeValue(fee) {
    if (!fee || fee === '') return fee;
    
    // Convert common variations to standard format
    if (fee === 'Contact' || fee === 'contact' || fee === 'N/A' || fee === 'n/a') {
      return '?';
    }
    
    // Keep valid values
    if (fee === '?' || fee === 'free' || fee === 'Free' || fee === '0') {
      return fee;
    }
    
    // Check if it's a valid number
    const numFee = Number(fee);
    if (!isNaN(numFee) && numFee >= 0) {
      return fee; // Keep as is
    }
    
    // Default to '?' for invalid values
    return '?';
  }

  /**
   * Fix coordinate format
   */
  fixCoordinates(coordinates) {
    if (!coordinates || coordinates === 'No coordinates') {
      return coordinates;
    }
    
    // Check if coordinates are in correct format
    const coordPattern = /^-?\d+\.\d+,-?\d+\.\d+$/;
    if (coordPattern.test(coordinates)) {
      return coordinates; // Already correct
    }
    
    // Try to fix common issues
    const cleaned = coordinates.replace(/\s+/g, ''); // Remove spaces
    if (coordPattern.test(cleaned)) {
      return cleaned;
    }
    
    // If still invalid, return as is (will be caught by validator)
    return coordinates;
  }

  /**
   * Fix date format
   */
  fixDateFormat(date) {
    if (!date) return date;
    
    // Check if date is already in correct format
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (datePattern.test(date)) {
      return date; // Already correct
    }
    
    // Try to parse and reformat common date formats
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // If can't parse, return as is
    return date;
  }

  /**
   * Apply fixes to a single gym
   */
  applyFixes(gym, fileName, rowIndex) {
    const originalGym = { ...gym };
    let hasChanges = false;
    
    // Fix website protocol
    if (gym.website) {
      const fixedWebsite = this.fixWebsiteProtocol(gym.website);
      if (fixedWebsite !== gym.website) {
        this.fixes.push({
          file: fileName,
          row: rowIndex + 2,
          gym: gym.name,
          field: 'website',
          before: gym.website,
          after: fixedWebsite
        });
        gym.website = fixedWebsite;
        hasChanges = true;
      }
    }
    
    // Fix fee values
    if (gym.matFee !== undefined) {
      const fixedMatFee = this.fixFeeValue(gym.matFee);
      if (fixedMatFee !== gym.matFee) {
        this.fixes.push({
          file: fileName,
          row: rowIndex + 2,
          gym: gym.name,
          field: 'matFee',
          before: gym.matFee,
          after: fixedMatFee
        });
        gym.matFee = fixedMatFee;
        hasChanges = true;
      }
    }
    
    if (gym.dropInFee !== undefined) {
      const fixedDropInFee = this.fixFeeValue(gym.dropInFee);
      if (fixedDropInFee !== gym.dropInFee) {
        this.fixes.push({
          file: fileName,
          row: rowIndex + 2,
          gym: gym.name,
          field: 'dropInFee',
          before: gym.dropInFee,
          after: fixedDropInFee
        });
        gym.dropInFee = fixedDropInFee;
        hasChanges = true;
      }
    }
    
    // Fix coordinates
    if (gym.coordinates) {
      const fixedCoordinates = this.fixCoordinates(gym.coordinates);
      if (fixedCoordinates !== gym.coordinates) {
        this.fixes.push({
          file: fileName,
          row: rowIndex + 2,
          gym: gym.name,
          field: 'coordinates',
          before: gym.coordinates,
          after: fixedCoordinates
        });
        gym.coordinates = fixedCoordinates;
        hasChanges = true;
      }
    }
    
    // Fix last_updated date
    if (gym.last_updated) {
      const fixedDate = this.fixDateFormat(gym.last_updated);
      if (fixedDate !== gym.last_updated) {
        this.fixes.push({
          file: fileName,
          row: rowIndex + 2,
          gym: gym.name,
          field: 'last_updated',
          before: gym.last_updated,
          after: fixedDate
        });
        gym.last_updated = fixedDate;
        hasChanges = true;
      }
    }
    
    return { gym, hasChanges };
  }

  /**
   * Convert gym object back to CSV line
   */
  gymToCSVLine(gym, headers) {
    return headers.map(header => {
      const value = gym[header] || '';
      // Quote values that contain commas or quotes
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  }

  /**
   * Process a single CSV file
   */
  processCSVFile(filePath) {
    const fileName = path.basename(filePath);
    console.log(`🔧 Processing ${fileName}...`);
    
    try {
      // Read and parse CSV
      const csvContent = fs.readFileSync(filePath, 'utf8');
      const { headers, gyms } = this.parseCSV(csvContent);
      
      console.log(`   Found ${gyms.length} gyms`);
      
      let totalFixes = 0;
      const fixedGyms = [];
      
      // Apply fixes to each gym
      gyms.forEach((gym, index) => {
        const { gym: fixedGym, hasChanges } = this.applyFixes(gym, fileName, index);
        fixedGyms.push(fixedGym);
        if (hasChanges) totalFixes++;
      });
      
      // Generate fixed CSV content
      const fixedCSV = [
        headers.join(','),
        ...fixedGyms.map(gym => this.gymToCSVLine(gym, headers))
      ].join('\n');
      
      // Save fixed file
      const fixedFileName = fileName.replace('.csv', '-fixed.csv');
      const fixedFilePath = path.join(this.dataDir, fixedFileName);
      fs.writeFileSync(fixedFilePath, fixedCSV);
      
      console.log(`   ✅ Applied ${totalFixes} fixes`);
      console.log(`   💾 Saved as: ${fixedFileName}`);
      
      this.stats.totalFixes += totalFixes;
      this.stats.filesProcessed++;
      
      return { fileName, totalFixes, gyms: gyms.length };
      
    } catch (error) {
      console.error(`   ❌ Error processing ${fileName}:`, error.message);
      this.stats.errors++;
      return { fileName, totalFixes: 0, gyms: 0, error: error.message };
    }
  }

  /**
   * Generate fix report
   */
  generateFixReport() {
    try {
      // Create reports directory if it doesn't exist
      if (!fs.existsSync(this.reportsDir)) {
        fs.mkdirSync(this.reportsDir);
      }
      
      // Create comprehensive fix report
      const fixReport = {
        timestamp: new Date().toISOString(),
        summary: {
          totalFiles: this.stats.totalFiles,
          filesProcessed: this.stats.filesProcessed,
          totalFixes: this.stats.totalFixes,
          errors: this.stats.errors
        },
        fixes: this.fixes,
        fixSummary: this.generateFixSummary()
      };
      
      // Save detailed fix report
      const reportPath = path.join(this.reportsDir, 'csv-fix-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(fixReport, null, 2));
      
      // Save summary report
      const summaryPath = path.join(this.reportsDir, 'csv-fix-summary.txt');
      const summary = this.generateFixSummaryText();
      fs.writeFileSync(summaryPath, summary);
      
      console.log(`\n📄 Fix reports saved to:`);
      console.log(`   📊 Detailed: ${reportPath}`);
      console.log(`   📋 Summary: ${summaryPath}`);
      
    } catch (error) {
      console.error('❌ Error saving fix report:', error.message);
    }
  }

  /**
   * Generate fix summary for JSON report
   */
  generateFixSummary() {
    const summary = {};
    
    this.fixes.forEach(fix => {
      if (!summary[fix.field]) {
        summary[fix.field] = { count: 0, examples: [] };
      }
      summary[fix.field].count++;
      if (summary[fix.field].examples.length < 3) {
        summary[fix.field].examples.push({
          gym: fix.gym,
          before: fix.before,
          after: fix.after
        });
      }
    });
    
    return summary;
  }

  /**
   * Generate fix summary text report
   */
  generateFixSummaryText() {
    let summaryText = `JiuJitsu Finder - CSV Auto-Fix Report\n`;
    summaryText += `Generated: ${new Date().toLocaleString()}\n`;
    summaryText += `\n`;
    summaryText += `SUMMARY:\n`;
    summaryText += `  Total files processed: ${this.stats.filesProcessed}\n`;
    summaryText += `  Total fixes applied: ${this.stats.totalFixes}\n`;
    summaryText += `  Errors encountered: ${this.stats.errors}\n`;
    summaryText += `\n`;
    
    if (this.fixes.length > 0) {
      summaryText += `FIXES BY FIELD:\n`;
      const fixSummary = this.generateFixSummary();
      Object.entries(fixSummary).forEach(([field, data]) => {
        summaryText += `  ${field}: ${data.count} fixes\n`;
        data.examples.forEach(example => {
          summaryText += `    - ${example.gym}: "${example.before}" → "${example.after}"\n`;
        });
        summaryText += `\n`;
      });
      
      summaryText += `DETAILED FIXES:\n`;
      this.fixes.forEach((fix, index) => {
        summaryText += `  ${index + 1}. ${fix.gym} (${fix.file}:${fix.row})\n`;
        summaryText += `     ${fix.field}: "${fix.before}" → "${fix.after}"\n\n`;
      });
    } else {
      summaryText += `No fixes were applied.\n`;
    }
    
    summaryText += `\nNEXT STEPS:\n`;
    summaryText += `  1. Review the fixed CSV files (with "-fixed" suffix)\n`;
    summaryText += `  2. Verify the changes look correct\n`;
    summaryText += `  3. Replace original files with fixed versions if satisfied\n`;
    summaryText += `  4. Run validation again to confirm fixes\n`;
    
    return summaryText;
  }

  /**
   * Display fix results
   */
  displayResults() {
    console.log('\n🔧 AUTO-FIX COMPLETE');
    console.log('='.repeat(50));
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Total fixes applied: ${this.stats.totalFixes}`);
    console.log(`Errors encountered: ${this.stats.errors}`);
    console.log('='.repeat(50));
    
    if (this.fixes.length > 0) {
      console.log('\n✅ FIXES APPLIED:');
      
      // Group fixes by field type
      const fixGroups = {};
      this.fixes.forEach(fix => {
        if (!fixGroups[fix.field]) {
          fixGroups[fix.field] = [];
        }
        fixGroups[fix.field].push(fix);
      });
      
      Object.entries(fixGroups).forEach(([field, fieldFixes]) => {
        console.log(`\n   ${field}: ${fieldFixes.length} fixes`);
        fieldFixes.slice(0, 3).forEach(fix => {
          console.log(`      - ${fix.gym}: "${fix.before}" → "${fix.after}"`);
        });
        if (fieldFixes.length > 3) {
          console.log(`      ... and ${fieldFixes.length - 3} more`);
        }
      });
      
      console.log('\n💡 NEXT STEPS:');
      console.log('   1. Review the "-fixed" CSV files');
      console.log('   2. Verify changes look correct');
      console.log('   3. Replace originals with fixed versions');
      console.log('   4. Run validation again to confirm');
      
    } else {
      console.log('\n🎉 No fixes were needed! Data is already clean.');
    }
  }

  /**
   * Main auto-fix method
   */
  async autoFix() {
    console.log('🔧 Starting CSV auto-fix for JiuJitsu Finder...\n');
    
    try {
      // Read validation report
      const validationReport = this.readValidationReport();
      
      // Create backups
      const backupPath = this.createBackups();
      
      // Get CSV files
      const csvFiles = this.getCSVFiles();
      this.stats.totalFiles = csvFiles.length;
      
      console.log(`📁 Found ${csvFiles.length} CSV files to process\n`);
      
      // Process each CSV file
      for (const csvFile of csvFiles) {
        await this.processCSVFile(csvFile);
        console.log(''); // Add spacing between files
      }
      
      // Generate and display results
      this.displayResults();
      
      // Generate and save reports
      this.generateFixReport();
      
      return {
        success: this.stats.errors === 0,
        stats: this.stats,
        fixes: this.fixes
      };
      
    } catch (error) {
      console.error('❌ Error during auto-fix:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Run auto-fix if script is called directly
if (require.main === module) {
  const fixer = new CSVAutoFixer();
  fixer.autoFix().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = CSVAutoFixer;
