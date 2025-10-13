package com.authentic.smartdoor.dashboard.domain.model

data class AnalyticsSummary(
    val totalAccess: Int,
    val accessDenied: Int,
    val accessAccepted: Int,
    val doorsOpened: Int,
    val doorsClosed: Int,
    val totalAccessChange: String,
    val accessDeniedChange: String,
    val accessAcceptedChange: String,
    val doorsOpenedChange: String,
    val doorsClosedChange: String
)

data class AccessActivityData(
    val timeLabel: String,
    val value: Int
)

data class ActiveHourData(
    val timeRange: String,
    val count: Int
)

data class AnalyticsData(
    val summary: AnalyticsSummary,
    val dailyActivity: List<AccessActivityData>,
    val weeklyActivity: List<AccessActivityData>,
    val monthlyActivity: List<AccessActivityData>,
    val activeHours: List<ActiveHourData>
)

data class AnalyticsApiResponse(
    val success: Boolean,
    val data: AnalyticsApiData?,
    val error: String?
)

data class AnalyticsApiData(
    val period: String,
    val dateRange: DateRange,
    val accessStatistics: AccessStatistics,
    val photoStatistics: PhotoStatistics,
    val systemHealth: AnalyticsSystemHealth
)

data class DateRange(
    val from: String,
    val to: String
)

data class AccessStatistics(
    val totalAttempts: Int,
    val successfulAccess: Int,
    val failedAttempts: Int,
    val uniqueUsers: Int,
    val mostActiveUser: MostActiveUser?,
    val peakHours: List<PeakHour>,
    val methodsBreakdown: Map<String, Int>
)

data class MostActiveUser(
    val id: String,
    val name: String,
    val accessCount: Int
)

data class PeakHour(
    val hour: Int,
    val count: Int
)

data class PhotoStatistics(
    val totalPhotos: Int,
    val motionDetected: Int,
    val faceScans: Int,
    val manualCaptures: Int,
    val accessAttempts: Int,
    val identifiedUsers: Int,
    val unidentifiedCaptures: Int
)

data class AnalyticsSystemHealth(
    val doorStatus: String,
    val batteryLevel: Int,
    val cameraOnline: Boolean,
    val wifiStrength: Int,
    val lastActivity: String?,
    val unreadNotifications: Int
)
