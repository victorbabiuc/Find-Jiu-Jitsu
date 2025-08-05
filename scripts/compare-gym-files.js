const fs = require('fs');
const path = require('path');

// Function to read CSV and extract gym names
function getGymNamesFromCSV(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        // Skip header line
        const dataLines = lines.slice(1);
        
        // Extract gym names (second column)
        const gymNames = dataLines.map(line => {
            const columns = line.split(',');
            // Handle quoted names that might contain commas
            let name = columns[1];
            if (name.startsWith('"') && name.endsWith('"')) {
                name = name.slice(1, -1);
            }
            return name.trim();
        }).filter(name => name && name !== 'Contact');
        
        return new Set(gymNames);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return new Set();
    }
}

// Compare files
function compareGymFiles() {
    console.log('🔍 Comparing gym data files...\n');
    
    // Austin comparison
    console.log('=== AUSTIN GYMS ===');
    const austinMain = getGymNamesFromCSV('data/austin-gyms.csv');
    const austinBackup = getGymNamesFromCSV('data/austin-gyms-backup.csv');
    
    const austinMissing = [...austinBackup].filter(gym => !austinMain.has(gym));
    
    if (austinMissing.length > 0) {
        console.log('Gyms in backup but missing from main file:');
        austinMissing.forEach(gym => console.log(`  - ${gym}`));
    } else {
        console.log('No missing gyms found in Austin backup file.');
    }
    
    console.log();
    
    // Tampa comparison
    console.log('=== TAMPA GYMS ===');
    const tampaMain = getGymNamesFromCSV('data/tampa-gyms.csv');
    const tampaBackup = getGymNamesFromCSV('data/tampa-gyms-backup.csv');
    
    const tampaMissing = [...tampaBackup].filter(gym => !tampaMain.has(gym));
    
    if (tampaMissing.length > 0) {
        console.log('Gyms in backup but missing from main file:');
        tampaMissing.forEach(gym => console.log(`  - ${gym}`));
    } else {
        console.log('No missing gyms found in Tampa backup file.');
    }
    
    console.log('\n✅ Comparison complete!');
}

// Run the comparison
compareGymFiles(); 