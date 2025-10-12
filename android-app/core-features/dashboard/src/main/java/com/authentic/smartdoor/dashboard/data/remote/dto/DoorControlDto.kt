package com.authentic.smartdoor.dashboard.data.remote.dto

data class DoorControlRequest(
    val action: String, // "lock" or "unlock"
    val door_id: String? = null
)

data class DoorControlResponse(
    val success: Boolean,
    val message: String?,
    val data: DoorControlData?
)

data class DoorControlData(
    val action: String,
    val success: Boolean,
    val timestamp: String,
    val door_id: String?
)
