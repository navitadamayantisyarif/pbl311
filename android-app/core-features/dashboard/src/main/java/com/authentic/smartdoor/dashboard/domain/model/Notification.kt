package com.authentic.smartdoor.dashboard.domain.model

data class Notification(
    val id: String,
    val type: NotificationType,
    val message: String,
    val read: Boolean,
    val createdAt: Long,
    val priority: NotificationPriority,
    val userId: String
)

enum class NotificationType {
    ACCESS_GRANTED,
    ACCESS_DENIED,
    LOW_BATTERY,
    SYSTEM_UPDATE,
    DOOR_OPENED,
    DOOR_CLOSED,
    CAMERA_ALERT,
    MAINTENANCE_REMINDER
}

enum class NotificationPriority {
    LOW,
    MEDIUM,
    HIGH
}
