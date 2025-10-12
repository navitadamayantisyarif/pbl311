package com.authentic.smartdoor.dashboard.data.remote.dto

data class DoorStatusDto(
    val locked: Boolean,
    val battery_level: Int,
    val last_update: String,
    val camera_active: Boolean,
    val wifi_strength: Int,
    val temperature: Int,
    val humidity: Int,
    val firmware_version: String,
    val last_maintenance: String
)

data class DoorStatusResponse(
    val success: Boolean,
    val data: DoorStatusDto?,
    val message: String?
)

data class DoorDto(
    val id: String,
    val name: String,
    val location: String,
    val locked: Boolean,
    val battery_level: Int,
    val last_update: String,
    val camera_active: Boolean,
    val wifi_strength: Int,
    val temperature: Int,
    val humidity: Int,
    val firmware_version: String,
    val last_maintenance: String,
    val access_level: String?
)

data class DoorListResponse(
    val success: Boolean,
    val data: List<DoorDto>?,
    val message: String?
)
