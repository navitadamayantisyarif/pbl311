package com.authentic.smartdoor.dashboard.domain.model

data class AccessLog(
    val id: String,
    val userId: String,
    val userName: String,
    val action: AccessAction,
    val timestamp: Long,
    val success: Boolean,
    val method: AccessMethod,
    val location: String,
    val ipAddress: String,
    val deviceInfo: String
)

enum class AccessAction {
    UNLOCK,
    LOCK,
    ACCESS_DENIED,
    FACE_SCAN,
    MANUAL_UNLOCK,
    EMERGENCY_UNLOCK
}

enum class AccessMethod {
    FACE_RECOGNITION,
    MOBILE_APP,
    PHYSICAL_KEY,
    EMERGENCY_CODE,
    REMOTE_CONTROL
}
