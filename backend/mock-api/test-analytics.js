// Test script for analytics endpoint
const http = require('http');
const { loadSampleData } = require('./data/sampleData');

// First, let's check the sample data
console.log('=== SAMPLE DATA CHECK ===');
const sampleData = loadSampleData();
console.log(`Total access logs: ${sampleData.accessLogs.length}`);
console.log(`Sample access log:`, sampleData.accessLogs[0]);
console.log('');

// Test the analytics endpoint
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/analytics/summary?period=7d',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('=== TESTING ANALYTICS ENDPOINT ===');
const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:');
    try {
      const jsonData = JSON.parse(data);
      console.log('Success:', jsonData.success);
      if (jsonData.data) {
        console.log('Summary:', jsonData.data.summary);
        console.log('Daily Activity:', jsonData.data.dailyActivity);
        console.log('Active Hours:', jsonData.data.activeHours);
      }
      console.log('');
      console.log('Full Response:');
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
