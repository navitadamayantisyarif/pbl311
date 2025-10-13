# Analytics API Documentation

## Overview
The Analytics API provides comprehensive analytics data for the Smart Door Lock system, including access statistics, activity patterns, and system health metrics.

## Base URL
```
http://localhost:3000/api/analytics
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Endpoints

### GET /api/analytics/summary
Get analytics summary data for a specified time period.

#### Parameters
- `period` (query, optional): Time period for analytics data
  - Valid values: `24h`, `7d`, `30d`, `90d`
  - Default: `7d`

#### Example Request
```bash
curl -X GET "http://localhost:3000/api/analytics/summary?period=7d" \
  -H "Authorization: Bearer your_token_here"
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalAccess": 248,
      "accessDenied": 8,
      "activeUsers": 42,
      "averageDuration": "32m",
      "totalAccessChange": "+12%",
      "accessDeniedChange": "-5%",
      "activeUsersChange": "+3%",
      "averageDurationChange": "+8%"
    },
    "dailyActivity": [
      {
        "timeLabel": "12AM",
        "value": 2
      },
      {
        "timeLabel": "4AM", 
        "value": 1
      },
      {
        "timeLabel": "8AM",
        "value": 12
      },
      {
        "timeLabel": "12PM",
        "value": 6
      },
      {
        "timeLabel": "4PM",
        "value": 15
      },
      {
        "timeLabel": "8PM",
        "value": 8
      }
    ],
    "weeklyActivity": [
      {
        "timeLabel": "Sen",
        "value": 45
      },
      {
        "timeLabel": "Sel",
        "value": 52
      },
      {
        "timeLabel": "Rab",
        "value": 38
      },
      {
        "timeLabel": "Kam",
        "value": 61
      },
      {
        "timeLabel": "Jum",
        "value": 48
      },
      {
        "timeLabel": "Sab",
        "value": 35
      },
      {
        "timeLabel": "Min",
        "value": 28
      }
    ],
    "monthlyActivity": [
      {
        "timeLabel": "Minggu 1",
        "value": 180
      },
      {
        "timeLabel": "Minggu 2",
        "value": 195
      },
      {
        "timeLabel": "Minggu 3",
        "value": 168
      },
      {
        "timeLabel": "Minggu 4",
        "value": 203
      }
    ],
    "activeHours": [
      {
        "timeRange": "08:00 - 10:00",
        "count": 42
      },
      {
        "timeRange": "16:00 - 18:00",
        "count": 35
      },
      {
        "timeRange": "12:00 - 14:00",
        "count": 28
      }
    ]
  },
  "period": "7d",
  "date_range": {
    "from": "2024-01-01T00:00:00.000Z",
    "to": "2024-01-08T00:00:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request - Invalid Period**
```json
{
  "error": "Invalid period",
  "code": "INVALID_PERIOD",
  "valid_periods": ["24h", "7d", "30d", "90d"]
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to get analytics summary",
  "message": "Error details",
  "code": "ANALYTICS_ERROR"
}
```

## Data Structure

### Summary Data
- `totalAccess`: Total number of access attempts
- `accessDenied`: Number of denied access attempts
- `activeUsers`: Number of unique users who accessed the system
- `averageDuration`: Average session duration
- `totalAccessChange`: Percentage change in total access (with +/- sign)
- `accessDeniedChange`: Percentage change in denied access
- `activeUsersChange`: Percentage change in active users
- `averageDurationChange`: Percentage change in average duration

### Activity Data
- `timeLabel`: Time period label (e.g., "12AM", "Sen", "Minggu 1")
- `value`: Number of access attempts in that time period

### Active Hours Data
- `timeRange`: Time range in HH:MM - HH:MM format
- `count`: Number of access attempts in that time range

## Integration with Android App

The Android app uses this endpoint through the `AnalyticsRepository` which:
1. Calls the `/api/analytics/summary` endpoint
2. Maps the response to `AnalyticsData` model
3. Falls back to mock data if the API call fails
4. Provides the data to `AnalyticsViewModel` for UI display

## Testing

You can test the endpoint using curl or any HTTP client:

```bash
# Test with default period (7d)
curl -X GET "http://localhost:3000/api/analytics/summary" \
  -H "Authorization: Bearer test_token"

# Test with specific period
curl -X GET "http://localhost:3000/api/analytics/summary?period=30d" \
  -H "Authorization: Bearer test_token"
```

## Notes

- The API generates realistic mock data based on the sample data in the system
- Activity data varies based on the selected period
- All percentage changes are randomly generated for demonstration purposes
- The API includes error simulation middleware for testing error handling
