const fs = require('fs');

// Simulate the app's parsing functions
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
    type: validateSessionType(type)
  };
}

function validateSessionType(type) {
  const cleanType = type.toLowerCase();
  if (cleanType === 'gi/nogi' || cleanType === 'both') {
    return 'Gi/NoGi';
  } else if (cleanType === 'nogi') {
    return 'NoGi';
  } else if (cleanType === 'gi') {
    return 'Gi';
  }
  return type;
}

// Simulate the app's parseCSVToOpenMatsNewFormat function
function parseCSVToOpenMatsNewFormat(csvData) {
  console.log('[DEBUG] parseCSVToOpenMatsNewFormat called');
  
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) {
    console.log('[DEBUG] No data found');
    return [];
  }
  
  const headers = parseCSVLine(lines[0]);
  console.log('[DEBUG] Headers:', headers);
  
  const gyms = [];
  let totalRows = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;
    
    totalRows++;
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    console.log(`[DEBUG] Processing row ${i}:`, { id: row.id, name: row.name });
    
    // Create gym object
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
      sessions: []
    };
    
    // Parse sessions from day columns
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of days) {
      const sessionData = row[day];
      if (sessionData && sessionData.trim() !== '') {
        console.log(`[DEBUG] ${day}: "${sessionData}"`);
        
        const session = parseSessionFromDayColumn(sessionData, day);
        if (session) {
          gym.sessions.push(session);
          console.log(`[DEBUG] Added session: ${session.day} ${session.time} ${session.type}`);
        }
      } else {
        console.log(`[DEBUG] ${day}: "undefined"`);
      }
    }
    
    gyms.push(gym);
  }
  
  console.log(`[DEBUG] New format CSV parsing completed:`, {
    sampleGyms: gyms.slice(0, 5).map(g => ({ name: g.name, sessions: g.sessions.length })),
    totalRows,
    uniqueGyms: gyms.length
  });
  
  return gyms;
}

// Main test function
function testMiamiConversion() {
  console.log('🧪 Testing Miami conversion...');
  
  try {
    // Read the converted CSV
    const csvData = fs.readFileSync('data/miami-gyms-new-format.csv', 'utf8');
    console.log('✅ Read miami-gyms-new-format.csv');
    
    // Parse using the app's logic
    const gyms = parseCSVToOpenMatsNewFormat(csvData);
    
    console.log('\n📊 Test Results:');
    console.log(`🏢 Total gyms: ${gyms.length}`);
    
    // Count sessions by day
    const dayCounts = {};
    let totalSessions = 0;
    
    for (const gym of gyms) {
      for (const session of gym.sessions) {
        const day = session.day.toLowerCase();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
        totalSessions++;
      }
    }
    
    console.log(`📅 Total sessions: ${totalSessions}`);
    console.log('📅 Sessions by day:');
    Object.entries(dayCounts).forEach(([day, count]) => {
      console.log(`   ${day}: ${count} sessions`);
    });
    
    // Show sample gyms with sessions
    console.log('\n🏢 Sample gyms with sessions:');
    let sampleCount = 0;
    for (const gym of gyms) {
      if (gym.sessions.length > 0 && sampleCount < 5) {
        console.log(`\n${gym.name}:`);
        console.log(`  ID: ${gym.id}`);
        console.log(`  Address: ${gym.address}`);
        console.log(`  Sessions: ${gym.sessions.length}`);
        for (const session of gym.sessions) {
          console.log(`    ${session.day}: ${session.time} - ${session.type}`);
        }
        sampleCount++;
      }
    }
    
    // Show gyms without sessions
    const gymsWithoutSessions = gyms.filter(g => g.sessions.length === 0);
    console.log(`\n🏢 Gyms without sessions: ${gymsWithoutSessions.length}`);
    if (gymsWithoutSessions.length > 0) {
      console.log('Sample gyms without sessions:');
      gymsWithoutSessions.slice(0, 3).forEach(gym => {
        console.log(`  - ${gym.name}`);
      });
    }
    
    // Validation
    console.log('\n✅ Validation:');
    console.log(`Expected gyms: 77, Actual: ${gyms.length} - ${gyms.length === 77 ? 'PASS' : 'FAIL'}`);
    console.log(`Expected sessions: 22, Actual: ${totalSessions} - ${totalSessions === 22 ? 'PASS' : 'FAIL'}`);
    
    const expectedDays = { saturday: 11, sunday: 10, friday: 1 };
    let dayValidationPass = true;
    for (const [day, expected] of Object.entries(expectedDays)) {
      const actual = dayCounts[day] || 0;
      const pass = actual === expected;
      console.log(`${day}: Expected ${expected}, Actual ${actual} - ${pass ? 'PASS' : 'FAIL'}`);
      if (!pass) dayValidationPass = false;
    }
    
    console.log(`\n🎯 Overall Test Result: ${gyms.length === 77 && totalSessions === 22 && dayValidationPass ? 'PASS' : 'FAIL'}`);
    
    return gyms.length === 77 && totalSessions === 22 && dayValidationPass;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
if (require.main === module) {
  const success = testMiamiConversion();
  process.exit(success ? 0 : 1);
}

module.exports = { testMiamiConversion }; 