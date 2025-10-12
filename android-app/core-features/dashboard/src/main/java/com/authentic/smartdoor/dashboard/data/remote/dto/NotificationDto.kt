package com.authentic.smartdoor.dashboard.data.remote.dto

data class NotificationDto(
    val id: String,
    val type: String,
    val message: String,
    val read: Boolean,
    val created_at: String,
    val priority: String,
    val user_id: String
)

data class NotificationResponse(
    val success: Boolean,
    val data: List<NotificationDto>?,
    val message: String?
)

data class NotificationCountResponse(
    val success: Boolean,
    val data: Int?,
    val message: String?
)
