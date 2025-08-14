const fs = require('fs');

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

// Function to remove Gracie Clermont from Tampa file
function removeGracieClermont() {
    console.log('🔧 Removing Gracie Clermont from Tampa File\n');
    
    try {
        // Step 1: Create backup of current Tampa file
        const tampaFilePath = 'data/tampa-gyms.csv';
        const backupFilePath = 'data/tampa-gyms-before-clermont-removal.csv';
        
        if (!fs.existsSync(tampaFilePath)) {
            console.error('❌ Tampa file not found!');
            return;
        }
        
        console.log('📋 Step 1: Creating backup...');
        fs.copyFileSync(tampaFilePath, backupFilePath);
        console.log(`✅ Backup created: ${backupFilePath}\n`);
        
        // Step 2: Read current Tampa file
        console.log('📖 Step 2: Reading current Tampa file...');
        const tampaContent = fs.readFileSync(tampaFilePath, 'utf8');
        const tampaLines = tampaContent.split('\n').filter(line => line.trim());
        const header = tampaLines[0];
        const tampaDataLines = tampaLines.slice(1);
        
        console.log(`✅ Tampa file has ${tampaDataLines.length} gym entries\n`);
        
        // Step 3: Remove Gracie Clermont
        console.log('🔍 Step 3: Looking for Gracie Clermont...');
        
        const filteredLines = [];
        let removedCount = 0;
        
        tampaDataLines.forEach(line => {
            const columns = parseCSVLine(line);
            if (columns.length < 10) return;
            
            const name = columns[1]?.replace(/"/g, '').trim();
            
            if (name === 'Gracie Clermont') {
                console.log(`  ❌ Removing: ${name} (Clermont is near Orlando, not Tampa)`);
                removedCount++;
            } else {
                filteredLines.push(line);
            }
        });
        
        if (removedCount === 0) {
            console.log('⚠️  Gracie Clermont not found in Tampa file');
            return;
        }
        
        console.log(`✅ Found and will remove ${removedCount} Gracie Clermont entry\n`);
        
        // Step 4: Create new file content
        console.log('📝 Step 4: Creating cleaned file...');
        const newContent = [header, ...filteredLines].join('\n');
        
        // Step 5: Write new file
        console.log('💾 Step 5: Writing cleaned file...');
        fs.writeFileSync(tampaFilePath, newContent);
        
        // Step 6: Verify
        console.log('✅ Step 6: Verifying removal...');
        const finalContent = fs.readFileSync(tampaFilePath, 'utf8');
        const finalLines = finalContent.split('\n').filter(line => line.trim());
        const finalDataLines = finalLines.slice(1);
        
        console.log(`✅ Final file has ${finalDataLines.length} gym entries`);
        console.log(`✅ Removed ${removedCount} Gracie Clermont entry successfully\n`);
        
        console.log('🎉 Gracie Clermont removal completed successfully!');
        console.log(`📁 Backup saved as: ${backupFilePath}`);
        console.log(`📁 Updated main file: ${tampaFilePath}`);
        
    } catch (error) {
        console.error('❌ Error during removal:', error.message);
    }
}

// Show what the script will do
console.log('🔍 GRACIE CLERMONT REMOVAL PREVIEW');
console.log('===================================');
console.log('This script will:');
console.log('1. Create backup: tampa-gyms-before-clermont-removal.csv');
console.log('2. Read current tampa-gyms.csv');
console.log('3. Remove Gracie Clermont (Clermont is near Orlando, not Tampa)');
console.log('4. Verify the removal was successful');
console.log('');
console.log('Reason: Clermont, FL is near Orlando, not Tampa area');
console.log('');

// Ask for confirmation
console.log('⚠️  WARNING: This will modify tampa-gyms.csv');
console.log('💡 A backup will be created automatically');
console.log('');
console.log('To run the removal, uncomment the line below:');
console.log('// removeGracieClermont();');

// Uncomment the line below to actually run the removal
removeGracieClermont(); 