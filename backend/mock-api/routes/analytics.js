const express = require('express');
const { authenticateToken, randomErrorMiddleware } = require('../middleware/common');
const { loadSampleData } = require('../data/sampleData');

const router = express.Router();

// Apply random error simulation (but skip authentication for testing)
router.use(randomErrorMiddleware);

// GET /api/analytics/summary - Get analytics summary data
router.get('/summary', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const validPeriods = ['24h', '7d', '30d', '90d'];

    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        error: 'Invalid period',
        code: 'INVALID_PERIOD',
        valid_periods: validPeriods
      });
    }

    const data = loadSampleData();

    // Calculate date range based on period
    const now = new Date();
    let dateFrom;

    switch (period) {
      case '24h':
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    // Filter data by period
    const accessLogs = data.accessLogs.filter(log => new Date(log.timestamp) >= dateFrom);
    const photos = data.cameraCaptures.filter(photo => new Date(photo.timestamp) >= dateFrom);

    // Calculate analytics summary from real data
    const accessDenied = accessLogs.filter(log => !log.success).length;
    const accessAccepted = accessLogs.filter(log => log.success).length;
    const totalAccess = accessDenied + accessAccepted; // Total harus sama dengan jumlah akses ditolak + diterima
    
    // Calculate door metrics
    const doorMetrics = calculateDoorMetrics(accessLogs);
    const doorsOpened = accessLogs.filter(log => 
      log.success && (log.action === 'unlock' || log.action === 'manual_unlock' || log.action === 'face_scan')
    ).length;
    const doorsClosed = accessLogs.filter(log => 
      log.success && log.action === 'lock'
    ).length;

    // Generate activity data based on period from real data
    let dailyActivity = [];
    let weeklyActivity = [];
    let monthlyActivity = [];

    if (period === '24h') {
      // Generate hourly data for last 24 hours
      dailyActivity = generateHourlyActivity(accessLogs, dateFrom);
    } else if (period === '7d') {
      // Generate daily data for last 7 days
      dailyActivity = generateDailyActivity(accessLogs, dateFrom);
      weeklyActivity = generateWeeklyActivity(accessLogs, dateFrom);
    } else if (period === '30d') {
      // Generate weekly data for last 30 days
      weeklyActivity = generateWeeklyActivity(accessLogs, dateFrom);
      monthlyActivity = generateMonthlyActivity(accessLogs, dateFrom);
    } else if (period === '90d') {
      // Generate monthly data for last 90 days
      monthlyActivity = generateMonthlyActivity(accessLogs, dateFrom);
    }

    // Generate active hours data from real data
    const activeHours = generateActiveHours(accessLogs);

    // Calculate changes based on comparison with previous period
    const changes = calculateChanges(data.accessLogs, accessLogs, period);

    const analyticsData = {
      summary: {
        totalAccess,
        accessDenied,
        accessAccepted,
        doorsOpened,
        doorsClosed,
        totalAccessChange: changes.totalAccessChange,
        accessDeniedChange: changes.accessDeniedChange,
        accessAcceptedChange: changes.accessAcceptedChange,
        doorsOpenedChange: changes.doorsOpenedChange,
        doorsClosedChange: changes.doorsClosedChange
      },
      doorMetrics,
      dailyActivity,
      weeklyActivity,
      monthlyActivity,
      activeHours
    };

    res.json({
      success: true,
      data: analyticsData,
      period,
      date_range: {
        from: dateFrom.toISOString(),
        to: now.toISOString()
      }
    });

  } catch (error) {
    console.error('Get analytics summary error:', error);
    res.status(500).json({
      error: 'Failed to get analytics summary',
      message: error.message,
      code: 'ANALYTICS_ERROR'
    });
  }
});

// Helper functions to generate activity data from real data
function calculateDoorMetrics(accessLogs) {
  const doorStats = {};
  
  // Group logs by door
  accessLogs.forEach(log => {
    const doorId = log.door_id;
    const doorName = log.door_name;
    const location = log.location;
    
    if (!doorStats[doorId]) {
      doorStats[doorId] = {
        doorId,
        doorName,
        location,
        totalAccess: 0,
        accessAccepted: 0,
        accessDenied: 0,
        doorOpened: 0,
        doorClosed: 0
      };
    }
    
    doorStats[doorId].totalAccess++;
    
    if (log.success) {
      doorStats[doorId].accessAccepted++;
    } else {
      doorStats[doorId].accessDenied++;
    }
    
    // Count door actions based on action type
    if (log.action === 'unlock' || log.action === 'manual_unlock' || log.action === 'face_scan') {
      doorStats[doorId].doorOpened++;
    } else if (log.action === 'lock') {
      doorStats[doorId].doorClosed++;
    }
  });
  
  // Convert to array and sort by total access
  return Object.values(doorStats)
    .sort((a, b) => b.totalAccess - a.totalAccess)
    .slice(0, 10); // Top 10 doors
}

function calculateChanges(allLogs, currentLogs, period) {
  // Calculate previous period for comparison
  const now = new Date();
  let previousDateFrom;
  let previousDateTo;
  
  switch (period) {
    case '24h':
      previousDateFrom = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      previousDateTo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      previousDateFrom = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      previousDateTo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      previousDateFrom = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      previousDateTo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      previousDateFrom = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      previousDateTo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      previousDateFrom = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      previousDateTo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  
  const previousLogs = allLogs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= previousDateFrom && logDate <= previousDateTo;
  });
  
  // Calculate current metrics
  const currentTotal = currentLogs.length;
  const currentDenied = currentLogs.filter(log => !log.success).length;
  const currentAccepted = currentLogs.filter(log => log.success).length;
  const currentDoorsOpened = currentLogs.filter(log => 
    log.success && (log.action === 'unlock' || log.action === 'manual_unlock' || log.action === 'face_scan')
  ).length;
  const currentDoorsClosed = currentLogs.filter(log => 
    log.success && log.action === 'lock'
  ).length;
  
  // Calculate previous metrics
  const previousTotal = previousLogs.length;
  const previousDenied = previousLogs.filter(log => !log.success).length;
  const previousAccepted = previousLogs.filter(log => log.success).length;
  const previousDoorsOpened = previousLogs.filter(log => 
    log.success && (log.action === 'unlock' || log.action === 'manual_unlock' || log.action === 'face_scan')
  ).length;
  const previousDoorsClosed = previousLogs.filter(log => 
    log.success && log.action === 'lock'
  ).length;
  
  // Calculate percentage changes
  const totalChange = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal * 100) : 0;
  const deniedChange = previousDenied > 0 ? ((currentDenied - previousDenied) / previousDenied * 100) : 0;
  const acceptedChange = previousAccepted > 0 ? ((currentAccepted - previousAccepted) / previousAccepted * 100) : 0;
  const doorsOpenedChange = previousDoorsOpened > 0 ? ((currentDoorsOpened - previousDoorsOpened) / previousDoorsOpened * 100) : 0;
  const doorsClosedChange = previousDoorsClosed > 0 ? ((currentDoorsClosed - previousDoorsClosed) / previousDoorsClosed * 100) : 0;
  
  return {
    totalAccessChange: `${totalChange >= 0 ? '+' : ''}${Math.round(totalChange)}%`,
    accessDeniedChange: `${deniedChange >= 0 ? '+' : ''}${Math.round(deniedChange)}%`,
    accessAcceptedChange: `${acceptedChange >= 0 ? '+' : ''}${Math.round(acceptedChange)}%`,
    doorsOpenedChange: `${doorsOpenedChange >= 0 ? '+' : ''}${Math.round(doorsOpenedChange)}%`,
    doorsClosedChange: `${doorsClosedChange >= 0 ? '+' : ''}${Math.round(doorsClosedChange)}%`
  };
}

function generateHourlyActivity(accessLogs, dateFrom) {
  const hourlyData = {};
  
  // Initialize all hours with 0
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = 0;
  }
  
  // Count access logs by hour
  accessLogs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    hourlyData[hour]++;
  });
  
  // Convert to array format for chart display (6 time points)
  const timeLabels = ['12AM', '4AM', '8AM', '12PM', '4PM', '8PM'];
  const hourIndices = [0, 4, 8, 12, 16, 20];
  
  return timeLabels.map((label, index) => ({
    timeLabel: label,
    value: hourlyData[hourIndices[index]] || 0
  }));
}

function generateDailyActivity(accessLogs, dateFrom) {
  const dailyData = {};
  
  // Initialize last 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const date = new Date(dateFrom);
    date.setDate(dateFrom.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    dailyData[dateKey] = 0;
  }
  
  // Count access logs by day
  accessLogs.forEach(log => {
    const dateKey = new Date(log.timestamp).toISOString().split('T')[0];
    if (dailyData.hasOwnProperty(dateKey)) {
      dailyData[dateKey]++;
    }
  });
  
  // Convert to array format for chart display (6 time points)
  const timeLabels = ['12AM', '4AM', '8AM', '12PM', '4PM', '8PM'];
  const values = Object.values(dailyData);
  
  // If we have less than 6 data points, pad with zeros
  while (values.length < 6) {
    values.push(0);
  }
  
  return timeLabels.map((label, index) => ({
    timeLabel: label,
    value: values[index] || 0
  }));
}

function generateWeeklyActivity(accessLogs, dateFrom) {
  const weeklyData = {};
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  
  // Initialize all days with 0
  dayNames.forEach(day => {
    weeklyData[day] = 0;
  });
  
  // Count access logs by day of week
  accessLogs.forEach(log => {
    const dayOfWeek = new Date(log.timestamp).getDay();
    const dayName = dayNames[dayOfWeek];
    weeklyData[dayName]++;
  });
  
  // Convert to array format
  const timeLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const dayMapping = {
    'Senin': 'Sen',
    'Selasa': 'Sel', 
    'Rabu': 'Rab',
    'Kamis': 'Kam',
    'Jumat': 'Jum',
    'Sabtu': 'Sab',
    'Minggu': 'Min'
  };
  
  return timeLabels.map(label => ({
    timeLabel: label,
    value: weeklyData[Object.keys(dayMapping).find(key => dayMapping[key] === label)] || 0
  }));
}

function generateMonthlyActivity(accessLogs, dateFrom) {
  const monthlyData = {};
  
  // Initialize last 4 weeks with 0
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(dateFrom);
    weekStart.setDate(dateFrom.getDate() + (i * 7));
    const weekKey = `Minggu ${4 - i}`;
    monthlyData[weekKey] = 0;
  }
  
  // Count access logs by week
  accessLogs.forEach(log => {
    const logDate = new Date(log.timestamp);
    const weekNumber = Math.floor((logDate - dateFrom) / (7 * 24 * 60 * 60 * 1000)) + 1;
    if (weekNumber >= 1 && weekNumber <= 4) {
      const weekKey = `Minggu ${weekNumber}`;
      monthlyData[weekKey]++;
    }
  });
  
  // Convert to array format
  const timeLabels = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
  
  return timeLabels.map(label => ({
    timeLabel: label,
    value: monthlyData[label] || 0
  }));
}

function generateActiveHours(accessLogs) {
  // Calculate peak hours from actual data
  const hourlyCounts = {};
  
  accessLogs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
  });
  
  // Get top 3 hours
  const sortedHours = Object.entries(hourlyCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  
  // If we don't have enough data, use mock data
  if (sortedHours.length < 3) {
    return [
      { timeRange: '08:00 - 10:00', count: 42 },
      { timeRange: '16:00 - 18:00', count: 35 },
      { timeRange: '12:00 - 14:00', count: 28 }
    ];
  }
  
  return sortedHours.map(([hour, count]) => ({
    timeRange: `${hour.padStart(2, '0')}:00 - ${(parseInt(hour) + 2).toString().padStart(2, '0')}:00`,
    count
  }));
}

module.exports = router;
