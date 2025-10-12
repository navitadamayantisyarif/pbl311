package com.authentic.smartdoor.dashboard.data.remote.dto

data class AccessLogDto(
    val id: String,
    val user_id: String,
    val user_name: String,
    val action: String,
    val timestamp: String,
    val success: Boolean,
    val method: String,
    val location: String,
    val ip_address: String,
    val device_info: String
)

data class AccessLogResponse(
    val success: Boolean,
    val data: List<AccessLogDto>?,
    val message: String?
)
