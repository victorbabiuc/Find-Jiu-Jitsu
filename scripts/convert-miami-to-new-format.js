const fs = require('fs');

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

// Alternative: Use Node.js built-in CSV parsing for Miami
function parseMiamiCSVLine(line) {
  // For Miami CSV, we know the structure and can handle it manually
  const parts = line.split(',');
  
  // The coordinates field contains a comma, so we need to handle it specially
  // Find where the coordinates field starts and ends
  let result = [];
  let i = 0;
  
  // id, name, address, website, phoneNumber (5 fields)
  for (let j = 0; j < 5; j++) {
    result.push(parts[i++]);
  }
  
  // coordinates (latitude,longitude) - combine these
  if (i < parts.length - 1) {
    const lat = parts[i++];
    const lng = parts[i++];
    result.push(`${lat},${lng}`);
  }
  
  // distance, sessionDay, sessionTime, sessionType, matFee, dropInFee, last_updated (7 fields)
  for (let j = 0; j < 7 && i < parts.length; j++) {
    result.push(parts[i++]);
  }
  
  return result;
}

// Convert time format to standard format
function standardizeTime(time) {
  if (!time || time.trim() === '') return '';
  
  // Handle various time formats
  let cleanTime = time.trim().toLowerCase();
  
  // Convert 12pm-2pm to 12:00 PM - 2:00 PM
  if (cleanTime.includes('pm') || cleanTime.includes('am')) {
    // Handle ranges like "12pm-2pm"
    if (cleanTime.includes('-')) {
      const parts = cleanTime.split('-');
      const start = standardizeSingleTime(parts[0].trim());
      const end = standardizeSingleTime(parts[1].trim());
      return `${start} - ${end}`;
    } else {
      return standardizeSingleTime(cleanTime);
    }
  }
  
  // Handle times like "12-2pm"
  if (cleanTime.includes('-') && (cleanTime.includes('pm') || cleanTime.includes('am'))) {
    const parts = cleanTime.split('-');
    const start = standardizeSingleTime(parts[0].trim());
    const end = standardizeSingleTime(parts[1].trim());
    return `${start} - ${end}`;
  }
  
  // Handle times like "6:30pm-7:30pm"
  if (cleanTime.includes(':') && cleanTime.includes('-')) {
    const parts = cleanTime.split('-');
    const start = standardizeSingleTime(parts[0].trim());
    const end = standardizeSingleTime(parts[1].trim());
    return `${start} - ${end}`;
  }
  
  return time.trim();
}

function standardizeSingleTime(time) {
  if (!time || time.trim() === '') return '';
  
  let cleanTime = time.trim().toLowerCase();
  
  // Handle times like "12pm", "2pm", "6:30pm"
  if (cleanTime.includes('pm') || cleanTime.includes('am')) {
    // Remove am/pm and add space
    const period = cleanTime.includes('pm') ? 'PM' : 'AM';
    cleanTime = cleanTime.replace(/[ap]m/g, '').trim();
    
    // Handle times like "12", "2", "6:30"
    if (cleanTime.includes(':')) {
      return `${cleanTime} ${period}`;
    } else {
      // Add :00 for whole hours
      return `${cleanTime}:00 ${period}`;
    }
  }
  
  return time.trim();
}

// Convert session type to standard format
function standardizeSessionType(type) {
  if (!type || type.trim() === '') return '';
  
  const cleanType = type.trim();
  
  // Map variations to standard types
  if (cleanType.toLowerCase() === 'gi/nogi' || cleanType.toLowerCase() === 'gi/ nogi' || cleanType.toLowerCase() === 'both') {
    return 'Gi/NoGi';
  } else if (cleanType.toLowerCase() === 'nogi') {
    return 'NoGi';
  } else if (cleanType.toLowerCase() === 'gi') {
    return 'Gi';
  }
  
  return cleanType;
}

// Get day abbreviation
function getDayAbbreviation(day) {
  if (!day || day.trim() === '') return '';
  
  const dayMap = {
    'monday': 'monday',
    'tuesday': 'tuesday', 
    'wednesday': 'wednesday',
    'thursday': 'thursday',
    'friday': 'friday',
    'saturday': 'saturday',
    'sunday': 'sunday'
  };
  
  const result = dayMap[day.toLowerCase()] || '';
  console.log(`getDayAbbreviation: "${day}" -> "${result}"`);
  return result;
}

// Main conversion function
function convertMiamiToNewFormat() {
  console.log('🔄 Converting Miami gyms to new format...');
  
  // Read the original CSV
  const csvData = fs.readFileSync('data/miami-gyms.csv', 'utf8');
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  
  // Parse headers
  const headers = parseCSVLine(lines[0]);
  console.log('📋 Headers:', headers);
  
  // Group gyms by name
  const gymMap = new Map();
  
  // Process each data row
  for (let i = 1; i < lines.length; i++) {
    const values = parseMiamiCSVLine(lines[i]);
    if (values.length < headers.length) continue;
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    const gymName = row.name;
    
    if (!gymMap.has(gymName)) {
      // Create new gym entry
      gymMap.set(gymName, {
        id: row.id,
        name: gymName,
        address: row.address,
        website: row.website,
        distance: row.distance,
        matFee: row.matFee,
        dropInFee: row.dropInFee,
        coordinates: row.coordinates,
        last_updated: row.last_updated,
        sessions: {} // Will store sessions by day
      });
    }
    
    // Add session to the gym - use header indices to get correct values
    const dayIndex = headers.indexOf('sessionDay');
    const timeIndex = headers.indexOf('sessionTime');
    const typeIndex = headers.indexOf('sessionType');
    
    // The coordinates field is split into two values, so we need to adjust indices
    const actualDayIndex = dayIndex;
    const actualTimeIndex = timeIndex;
    const actualTypeIndex = typeIndex;
    
    const day = getDayAbbreviation(values[actualDayIndex]);
    const time = standardizeTime(values[actualTimeIndex]);
    const type = standardizeSessionType(values[actualTypeIndex]);
    
    // Debug logging for first few rows
    if (i <= 5) {
      console.log(`Row ${i}: raw line:`, lines[i]);
      console.log(`Row ${i}: values=`, values);
      console.log(`Row ${i}: dayIndex=${dayIndex}, timeIndex=${timeIndex}, typeIndex=${typeIndex}`);
      console.log(`Row ${i}: values[dayIndex]="${values[dayIndex]}", values[timeIndex]="${values[timeIndex]}", values[typeIndex]="${values[typeIndex]}"`);
      console.log(`Row ${i}: day="${values[actualDayIndex]}" -> "${day}", time="${values[actualTimeIndex]}" -> "${time}", type="${values[actualTypeIndex]}" -> "${type}"`);
    }
    
    // Only add sessions that have valid data (not "Contact" or empty)
    if (day && time && type && 
        time !== '' && time !== 'contact' && 
        type !== '' && type !== 'contact' && 
        day !== 'contact') {
      const sessionString = `${time} - ${type}`;
      
      if (!gymMap.get(gymName).sessions[day]) {
        gymMap.get(gymName).sessions[day] = [];
      }
      
      // Avoid duplicates
      if (!gymMap.get(gymName).sessions[day].includes(sessionString)) {
        gymMap.get(gymName).sessions[day].push(sessionString);
      }
    }
  }
  
  // Convert to new format
  const newFormatRows = [];
  const newHeaders = ['id', 'name', 'address', 'website', 'distance', 'matFee', 'dropInFee', 'coordinates', 'last_updated', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Add header row
  newFormatRows.push(newHeaders.join(','));
  
  // Add data rows
  for (const [gymName, gym] of gymMap) {
    const row = [
      gym.id,
      `"${gym.name}"`,
      `"${gym.address}"`,
      gym.website || '',
      gym.distance || '0',
      gym.matFee || '0',
      gym.dropInFee || '0',
      `"${gym.coordinates}"`,
      gym.last_updated || '',
      gym.sessions.monday ? `"${gym.sessions.monday.join(', ')}"` : '',
      gym.sessions.tuesday ? `"${gym.sessions.tuesday.join(', ')}"` : '',
      gym.sessions.wednesday ? `"${gym.sessions.wednesday.join(', ')}"` : '',
      gym.sessions.thursday ? `"${gym.sessions.thursday.join(', ')}"` : '',
      gym.sessions.friday ? `"${gym.sessions.friday.join(', ')}"` : '',
      gym.sessions.saturday ? `"${gym.sessions.saturday.join(', ')}"` : '',
      gym.sessions.sunday ? `"${gym.sessions.sunday.join(', ')}"` : ''
    ];
    
    newFormatRows.push(row.join(','));
  }
  
  // Write to new file
  const outputPath = 'data/miami-gyms-new-format.csv';
  fs.writeFileSync(outputPath, newFormatRows.join('\n'));
  
  console.log(`✅ Conversion complete! Output: ${outputPath}`);
  console.log(`📊 Converted ${gymMap.size} unique gyms`);
  
  // Count sessions by day
  const dayCounts = {};
  let totalSessions = 0;
  
  for (const [gymName, gym] of gymMap) {
    for (const [day, sessions] of Object.entries(gym.sessions)) {
      if (sessions.length > 0) {
        dayCounts[day] = (dayCounts[day] || 0) + sessions.length;
        totalSessions += sessions.length;
      }
    }
  }
  
  console.log(`📅 Total sessions: ${totalSessions}`);
  console.log('📅 Sessions by day:');
  Object.entries(dayCounts).forEach(([day, count]) => {
    console.log(`   ${day}: ${count} sessions`);
  });
  
  // Show sample data
  console.log('\n📋 Sample converted data:');
  console.log('Headers:', newHeaders.join(','));
  
  let sampleCount = 0;
  for (const [gymName, gym] of gymMap) {
    if (sampleCount < 3) {
      console.log(`\n🏢 ${gymName}:`);
      console.log(`  ID: ${gym.id}`);
      console.log(`  Address: ${gym.address}`);
      console.log(`  Sessions:`);
      for (const [day, sessions] of Object.entries(gym.sessions)) {
        if (sessions.length > 0) {
          console.log(`    ${day}: ${sessions.join(', ')}`);
        }
      }
      sampleCount++;
    }
  }
  
  return outputPath;
}

// Run the conversion
if (require.main === module) {
  try {
    convertMiamiToNewFormat();
  } catch (error) {
    console.error('❌ Conversion failed:', error);
    process.exit(1);
  }
}

module.exports = { convertMiamiToNewFormat }; 