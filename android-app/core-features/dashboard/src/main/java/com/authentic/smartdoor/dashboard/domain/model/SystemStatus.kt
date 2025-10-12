package com.authentic.smartdoor.dashboard.domain.model

data class SystemStatus(
    val totalDoors: Int,
    val activeDoors: Int,
    val totalUsers: Int,
    val onlineUsers: Int,
    val systemHealth: SystemHealth
)

enum class SystemHealth {
    EXCELLENT,
    GOOD,
    WARNING,
    CRITICAL
}
