package com.authentic.smartdoor.dashboard.data.mappers

import com.authentic.smartdoor.dashboard.data.remote.dto.AccessLogDto
import com.authentic.smartdoor.dashboard.domain.model.AccessAction
import com.authentic.smartdoor.dashboard.domain.model.AccessLog
import com.authentic.smartdoor.dashboard.domain.model.AccessMethod
import java.text.SimpleDateFormat
import java.util.*

object AccessLogMapper {
    
    fun AccessLogDto.toDomain(): AccessLog {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        
        return AccessLog(
            id = id,
            userId = user_id,
            userName = user_name,
            action = mapAccessAction(action),
            timestamp = try {
                dateFormat.parse(timestamp)?.time ?: System.currentTimeMillis()
            } catch (e: Exception) {
                System.currentTimeMillis()
            },
            success = success,
            method = mapAccessMethod(method),
            location = location,
            ipAddress = ip_address,
            deviceInfo = device_info
        )
    }
    
    private fun mapAccessAction(action: String): AccessAction {
        return when (action.lowercase()) {
            "unlock" -> AccessAction.UNLOCK
            "lock" -> AccessAction.LOCK
            "access_denied" -> AccessAction.ACCESS_DENIED
            "face_scan" -> AccessAction.FACE_SCAN
            "manual_unlock" -> AccessAction.MANUAL_UNLOCK
            "emergency_unlock" -> AccessAction.EMERGENCY_UNLOCK
            else -> AccessAction.UNLOCK
        }
    }
    
    private fun mapAccessMethod(method: String): AccessMethod {
        return when (method.lowercase()) {
            "face_recognition" -> AccessMethod.FACE_RECOGNITION
            "mobile_app" -> AccessMethod.MOBILE_APP
            "physical_key" -> AccessMethod.PHYSICAL_KEY
            "emergency_code" -> AccessMethod.EMERGENCY_CODE
            "remote_control" -> AccessMethod.REMOTE_CONTROL
            else -> AccessMethod.MOBILE_APP
        }
    }
}
