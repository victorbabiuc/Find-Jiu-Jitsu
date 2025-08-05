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

// Function to read CSV and find specific gyms
function getMissingGymDetails() {
    try {
        const content = fs.readFileSync('data/tampa-gyms-backup.csv', 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        // Skip header line
        const dataLines = lines.slice(1);
        
        // List of missing gym names
        const missingGyms = [
            'YCJJC',
            'North River BJJ', 
            'Gracie Clermont',
            'St Pete BJJ',
            'Inside Control Academy',
            'Gracie Jiu Jitsu Largo'
        ];
        
        console.log('🥋 Missing Tampa Gyms from Backup File:\n');
        
        dataLines.forEach(line => {
            const columns = parseCSVLine(line);
            
            if (columns.length < 10) return; // Skip malformed lines
            
            const name = columns[1]?.replace(/"/g, '').trim();
            
            // Check if this is one of our missing gyms
            if (missingGyms.includes(name)) {
                const address = columns[2]?.replace(/"/g, '').trim() || 'N/A';
                const website = columns[3]?.replace(/"/g, '').trim() || 'N/A';
                const dropInFee = columns[6]?.trim() || 'N/A';
                const sessionDay = columns[7]?.trim() || 'N/A';
                const sessionTime = columns[8]?.replace(/"/g, '').trim() || 'N/A';
                const sessionType = columns[9]?.trim() || 'N/A';
                
                console.log(`📍 ${name}`);
                console.log(`   Address: ${address}`);
                console.log(`   Website: ${website}`);
                console.log(`   Drop-in Fee: $${dropInFee}`);
                console.log(`   Session: ${sessionDay} at ${sessionTime}`);
                console.log(`   Type: ${sessionType}`);
                console.log('');
            }
        });
        
    } catch (error) {
        console.error('Error reading backup file:', error.message);
    }
}

// Run the function
getMissingGymDetails(); 