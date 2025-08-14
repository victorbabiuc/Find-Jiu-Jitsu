const fs = require('fs');
const path = require('path');

// Function to properly parse CSV with quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// Function to escape CSV fields
function escapeCSVField(field) {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
}

// Function to merge missing gyms
function mergeMissingTampaGyms() {
    console.log('🔄 Tampa Gyms Merge Script\n');
    
    try {
        // Step 1: Create backup of current main file
        const mainFilePath = 'data/tampa-gyms.csv';
        const backupFilePath = 'data/tampa-gyms-before-merge.csv';
        
        if (!fs.existsSync(mainFilePath)) {
            console.error('❌ Main Tampa file not found!');
            return;
        }
        
        console.log('📋 Step 1: Creating backup...');
        fs.copyFileSync(mainFilePath, backupFilePath);
        console.log(`✅ Backup created: ${backupFilePath}\n`);
        
        // Step 2: Read current main file
        console.log('📖 Step 2: Reading current main file...');
        const mainContent = fs.readFileSync(mainFilePath, 'utf8');
        const mainLines = mainContent.split('\n').filter(line => line.trim());
        const header = mainLines[0];
        const mainDataLines = mainLines.slice(1);
        
        console.log(`✅ Main file has ${mainDataLines.length} gym entries\n`);
        
        // Step 3: Read backup file to get missing gyms
        console.log('📖 Step 3: Reading backup file for missing gyms...');
        const backupContent = fs.readFileSync('data/tampa-gyms-backup.csv', 'utf8');
        const backupLines = backupContent.split('\n').filter(line => line.trim());
        const backupDataLines = backupLines.slice(1);
        
        // Step 4: Extract missing gyms
        console.log('🔍 Step 4: Identifying missing gyms...');
        const missingGymNames = [
            'YCJJC',
            'North River BJJ', 
            'Gracie Clermont',
            'St Pete BJJ',
            'Inside Control Academy',
            'Gracie Jiu Jitsu Largo'
        ];
        
        const missingGymLines = [];
        
        backupDataLines.forEach(line => {
            const columns = parseCSVLine(line);
            if (columns.length < 10) return;
            
            const name = columns[1]?.replace(/"/g, '').trim();
            
            if (missingGymNames.includes(name)) {
                missingGymLines.push(line);
                console.log(`  ✅ Found missing gym: ${name}`);
            }
        });
        
        console.log(`✅ Found ${missingGymLines.length} missing gyms to add\n`);
        
        // Step 5: Create new file content
        console.log('📝 Step 5: Creating merged file...');
        const newContent = [header, ...mainDataLines, ...missingGymLines].join('\n');
        
        // Step 6: Write new file
        console.log('💾 Step 6: Writing merged file...');
        fs.writeFileSync(mainFilePath, newContent);
        
        // Step 7: Verify
        console.log('✅ Step 7: Verifying merge...');
        const finalContent = fs.readFileSync(mainFilePath, 'utf8');
        const finalLines = finalContent.split('\n').filter(line => line.trim());
        const finalDataLines = finalLines.slice(1);
        
        console.log(`✅ Final file has ${finalDataLines.length} gym entries`);
        console.log(`✅ Added ${missingGymLines.length} gyms successfully\n`);
        
        console.log('🎉 Merge completed successfully!');
        console.log(`📁 Backup saved as: ${backupFilePath}`);
        console.log(`📁 Updated main file: ${mainFilePath}`);
        
    } catch (error) {
        console.error('❌ Error during merge:', error.message);
    }
}

// Show what the script will do
console.log('🔍 MERGE SCRIPT PREVIEW');
console.log('========================');
console.log('This script will:');
console.log('1. Create backup: tampa-gyms-before-merge.csv');
console.log('2. Read current tampa-gyms.csv');
console.log('3. Extract 6 missing gyms from tampa-gyms-backup.csv');
console.log('4. Add missing gyms to main file');
console.log('5. Verify the merge was successful');
console.log('');
console.log('Missing gyms to be added:');
console.log('- YCJJC (Ybor City Jiu-Jitsu Club)');
console.log('- North River BJJ');
console.log('- Gracie Clermont');
console.log('- St Pete BJJ');
console.log('- Inside Control Academy');
console.log('- Gracie Jiu Jitsu Largo');
console.log('');

// Ask for confirmation
console.log('⚠️  WARNING: This will modify tampa-gyms.csv');
console.log('💡 A backup will be created automatically');
console.log('');
console.log('To run the merge, uncomment the line below:');
console.log('// mergeMissingTampaGyms();');

// Uncomment the line below to actually run the merge
mergeMissingTampaGyms(); 