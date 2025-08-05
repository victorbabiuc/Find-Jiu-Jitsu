const fs = require('fs');

// Simulate the app's parsing logic for the new format
function parseSessionFromDayColumn(sessionData, day) {
  if (!sessionData || sessionData.trim() === '') {
    return null;
  }
  
  const sessions = sessionData.split(',').map(s => s.trim());
  const firstSession = sessions[0];
  const parts = firstSession.split(' - ');
  
  if (parts.length < 2) {
    return { 
      day: day.charAt(0).toUpperCase() + day.slice(1), 
      time: firstSession.trim(), 
      type: 'both' 
    };
  }
  
  const time = parts.slice(0, -1).join(' - ').trim();
  const type = parts[parts.length - 1].trim();
  
  return { 
    day: day.charAt(0).toUpperCase() + day.slice(1), 
    time: time, 
    type: type 
  };
}

function validateSessionType(type) {
  const cleanType = type.toLowerCase();
  if (cleanType === 'gi/nogi' || cleanType === 'gi/ nogi' || cleanType === 'both') {
    return 'Gi/NoGi';
  } else if (cleanType === 'nogi') {
    return 'NoGi';
  } else if (cleanType === 'gi') {
    return 'Gi';
  }
  return type;
}

// Parse CSV line with proper handling of quoted fields
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

function parseCSVToOpenMatsNewFormat(csvData) {
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  const headers = parseCSVLine(lines[0]);
  
  console.log('📋 Headers found:', headers);
  
  const gyms = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line);
    
    if (values.length < headers.length) {
      console.log(`⚠️ Skipping line ${i + 1}: insufficient values`);
      continue;
    }
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    console.log(`🏢 Processing gym: ${row.name}`);
    
    const gym = {
      id: row.id,
      name: row.name,
      address: row.address,
      website: row.website,
      distance: row.distance,
      matFee: row.matFee,
      dropInFee: row.dropInFee,
      coordinates: row.coordinates,
      lastUpdated: row.last_updated,
      openMats: []
    };
    
    // Parse sessions from day columns
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of days) {
      const sessionData = row[day];
      if (sessionData && sessionData.trim() !== '') {
        const session = parseSessionFromDayColumn(sessionData, day);
        if (session) {
          session.type = validateSessionType(session.type);
          gym.openMats.push(session);
          console.log(`  📅 ${session.day}: ${session.time} - ${session.type}`);
        }
      }
    }
    
    gyms.push(gym);
  }
  
  return gyms;
}

function testTampaConversion() {
  console.log('🧪 Testing Tampa conversion...');
  
  try {
    // Read the converted file
    const csvData = fs.readFileSync('data/tampa-gyms-new-format.csv', 'utf8');
    
    // Parse using the app's logic
    const gyms = parseCSVToOpenMatsNewFormat(csvData);
    
    console.log(`\n✅ Test Results:`);
    console.log(`📊 Total gyms: ${gyms.length}`);
    
    let totalSessions = 0;
    const dayCounts = {};
    
    for (const gym of gyms) {
      totalSessions += gym.openMats.length;
      
      for (const session of gym.openMats) {
        dayCounts[session.day] = (dayCounts[session.day] || 0) + 1;
      }
    }
    
    console.log(`📅 Total sessions: ${totalSessions}`);
    console.log('📅 Sessions by day:');
    Object.entries(dayCounts).forEach(([day, count]) => {
      console.log(`   ${day}: ${count} sessions`);
    });
    
    // Show sample gyms
    console.log('\n📋 Sample gyms:');
    for (let i = 0; i < Math.min(3, gyms.length); i++) {
      const gym = gyms[i];
      console.log(`\n🏢 ${gym.name}:`);
      console.log(`  ID: ${gym.id}`);
      console.log(`  Address: ${gym.address}`);
      console.log(`  Sessions: ${gym.openMats.length}`);
      
      for (const session of gym.openMats) {
        console.log(`    ${session.day}: ${session.time} - ${session.type}`);
      }
    }
    
    // Validation checks
    const expectedGyms = 23;
    const expectedSessions = 23;
    
    console.log('\n🔍 Validation:');
    console.log(`  Gyms: ${gyms.length}/${expectedGyms} ${gyms.length === expectedGyms ? '✅' : '❌'}`);
    console.log(`  Sessions: ${totalSessions}/${expectedSessions} ${totalSessions === expectedSessions ? '✅' : '❌'}`);
    
    const allValid = gyms.length === expectedGyms && totalSessions === expectedSessions;
    console.log(`\n${allValid ? '✅ PASS' : '❌ FAIL'}: Tampa conversion test`);
    
    return allValid;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testTampaConversion();
}

module.exports = { testTampaConversion }; 