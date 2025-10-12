package com.authentic.smartdoor.dashboard.domain.model

data class DashboardData(
    val user: User,
    val doors: List<Door>,
    val notifications: List<Notification>,
    val recentAccessLogs: List<AccessLog>,
    val systemStatus: SystemStatus
)


