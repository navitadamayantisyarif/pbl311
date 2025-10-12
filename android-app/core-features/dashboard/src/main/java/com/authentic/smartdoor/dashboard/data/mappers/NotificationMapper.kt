package com.authentic.smartdoor.dashboard.data.mappers

import com.authentic.smartdoor.dashboard.data.remote.dto.NotificationDto
import com.authentic.smartdoor.dashboard.domain.model.Notification
import com.authentic.smartdoor.dashboard.domain.model.NotificationPriority
import com.authentic.smartdoor.dashboard.domain.model.NotificationType
import java.text.SimpleDateFormat
import java.util.*

object NotificationMapper {
    
    fun NotificationDto.toDomain(): Notification {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        
        return Notification(
            id = id,
            type = mapNotificationType(type),
            message = message,
            read = read,
            createdAt = try {
                dateFormat.parse(created_at)?.time ?: System.currentTimeMillis()
            } catch (e: Exception) {
                System.currentTimeMillis()
            },
            priority = mapNotificationPriority(priority),
            userId = user_id
        )
    }
    
    private fun mapNotificationType(type: String): NotificationType {
        return when (type.lowercase()) {
            "access_granted" -> NotificationType.ACCESS_GRANTED
            "access_denied" -> NotificationType.ACCESS_DENIED
            "low_battery" -> NotificationType.LOW_BATTERY
            "system_update" -> NotificationType.SYSTEM_UPDATE
            "door_opened" -> NotificationType.DOOR_OPENED
            "door_closed" -> NotificationType.DOOR_CLOSED
            "camera_alert" -> NotificationType.CAMERA_ALERT
            "maintenance_reminder" -> NotificationType.MAINTENANCE_REMINDER
            else -> NotificationType.SYSTEM_UPDATE
        }
    }
    
    private fun mapNotificationPriority(priority: String): NotificationPriority {
        return when (priority.lowercase()) {
            "high" -> NotificationPriority.HIGH
            "medium" -> NotificationPriority.MEDIUM
            "low" -> NotificationPriority.LOW
            else -> NotificationPriority.MEDIUM
        }
    }
}
