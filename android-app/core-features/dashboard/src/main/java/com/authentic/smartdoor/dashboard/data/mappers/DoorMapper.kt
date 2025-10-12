package com.authentic.smartdoor.dashboard.data.mappers

import com.authentic.smartdoor.dashboard.data.remote.dto.DoorDto
import com.authentic.smartdoor.dashboard.data.remote.dto.DoorStatusDto
import com.authentic.smartdoor.dashboard.domain.model.Door
import com.authentic.smartdoor.dashboard.domain.model.DoorStatus
import java.text.SimpleDateFormat
import java.util.*

object DoorMapper {
    
    fun DoorStatusDto.toDomain(): DoorStatus {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        
        return DoorStatus(
            locked = locked,
            batteryLevel = battery_level,
            lastUpdate = try {
                dateFormat.parse(last_update)?.time ?: System.currentTimeMillis()
            } catch (e: Exception) {
                System.currentTimeMillis()
            },
            cameraActive = camera_active,
            wifiStrength = wifi_strength,
            temperature = temperature,
            humidity = humidity,
            firmwareVersion = firmware_version,
            lastMaintenance = try {
                dateFormat.parse(last_maintenance)?.time ?: System.currentTimeMillis()
            } catch (e: Exception) {
                System.currentTimeMillis()
            }
        )
    }
    
    fun DoorDto.toDomain(): Door {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        
        return Door(
            id = id,
            name = name,
            location = location,
            locked = locked,
            batteryLevel = battery_level,
            lastUpdate = try {
                dateFormat.parse(last_update)?.time ?: System.currentTimeMillis()
            } catch (e: Exception) {
                System.currentTimeMillis()
            },
            cameraActive = camera_active,
            wifiStrength = wifi_strength,
            temperature = temperature,
            humidity = humidity,
            firmwareVersion = firmware_version,
            lastMaintenance = try {
                dateFormat.parse(last_maintenance)?.time ?: System.currentTimeMillis()
            } catch (e: Exception) {
                System.currentTimeMillis()
            }
        )
    }
    
    fun DoorStatus.toDoor(id: String = "main_door", name: String = "Main Door", location: String = "Main Entrance"): Door {
        return Door(
            id = id,
            name = name,
            location = location,
            locked = locked,
            batteryLevel = batteryLevel,
            lastUpdate = lastUpdate,
            cameraActive = cameraActive,
            wifiStrength = wifiStrength,
            temperature = temperature,
            humidity = humidity,
            firmwareVersion = firmwareVersion,
            lastMaintenance = lastMaintenance
        )
    }
}
