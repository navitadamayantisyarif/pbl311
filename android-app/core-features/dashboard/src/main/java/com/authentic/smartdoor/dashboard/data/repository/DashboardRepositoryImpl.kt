package com.authentic.smartdoor.dashboard.data.repository

import com.authentic.smartdoor.dashboard.data.mappers.AccessLogMapper.toDomain
import com.authentic.smartdoor.dashboard.data.mappers.DoorMapper.toDomain
import com.authentic.smartdoor.dashboard.data.mappers.NotificationMapper.toDomain
import com.authentic.smartdoor.dashboard.data.remote.DashboardApiService
import com.authentic.smartdoor.dashboard.data.remote.dto.DoorControlRequest
import com.authentic.smartdoor.dashboard.data.remote.dto.MarkReadRequest
import com.authentic.smartdoor.dashboard.domain.model.AccessLog
import com.authentic.smartdoor.dashboard.domain.model.DashboardData
import com.authentic.smartdoor.dashboard.domain.model.Door
import com.authentic.smartdoor.dashboard.domain.model.Notification
import com.authentic.smartdoor.dashboard.domain.model.SystemHealth
import com.authentic.smartdoor.dashboard.domain.model.SystemStatus
import com.authentic.smartdoor.dashboard.domain.model.User
import com.authentic.smartdoor.dashboard.domain.repository.DashboardRepository
import com.authentic.smartdoor.authentication.utils.PreferencesManager
import javax.inject.Inject

class DashboardRepositoryImpl @Inject constructor(
    private val apiService: DashboardApiService,
    private val preferencesManager: PreferencesManager
) : DashboardRepository {

    override suspend fun getDashboardData(): Result<DashboardData> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token.isNullOrEmpty()) {
                return Result.failure(Exception("No authentication token"))
            }

            // Fetch all data from API
            val doorsResult = getUserAccessibleDoors()
            val notificationsResult = getNotifications()
            val accessHistoryResult = getAccessHistory()
            val userResult = getCurrentUser()

            // Get data from API results
            val doors = doorsResult.getOrNull() ?: emptyList()
            val notifications = notificationsResult.getOrNull() ?: emptyList()
            val accessLogs = accessHistoryResult.getOrNull() ?: emptyList()
            val user = userResult.getOrNull() ?: return Result.failure(Exception("Failed to get user data"))

            // Create system status based on API data
            val systemStatus = SystemStatus(
                totalDoors = doors.size,
                activeDoors = doors.count { it.cameraActive },
                totalUsers = 1, // This could come from API in the future
                onlineUsers = 1, // This could come from API in the future
                systemHealth = if (doors.isNotEmpty()) {
                    if (doors.all { it.batteryLevel > 20 }) SystemHealth.GOOD
                    else if (doors.any { it.batteryLevel <= 20 }) SystemHealth.WARNING
                    else SystemHealth.GOOD
                } else SystemHealth.WARNING
            )

            val dashboardData = DashboardData(
                user = user,
                doors = doors,
                notifications = notifications,
                recentAccessLogs = accessLogs.take(5), // Last 5 logs
                systemStatus = systemStatus
            )

            Result.success(dashboardData)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getDoorStatus(): Result<Door> {
        return try {
            // Fallback to getting first available door status
            val doors = getUserAccessibleDoors()
            doors.getOrNull()?.firstOrNull()?.let { 
                Result.success(it)
            } ?: Result.failure(Exception("No doors available"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private suspend fun getUserAccessibleDoors(): Result<List<Door>> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token.isNullOrEmpty()) {
                return Result.failure(Exception("No authentication token"))
            }

            val response = apiService.getUserAccessibleDoors("Bearer $token")
            if (response.isSuccessful) {
                val doorListResponse = response.body()
                if (doorListResponse?.success == true && doorListResponse.data != null) {
                    val doors = doorListResponse.data.map { it.toDomain() }
                    Result.success(doors)
                } else {
                    Result.failure(Exception(doorListResponse?.message ?: "Failed to get doors"))
                }
            } else {
                Result.failure(Exception("API Error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getDoorStatusById(doorId: String): Result<Door> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token.isNullOrEmpty()) {
                return Result.failure(Exception("No authentication token"))
            }

            // Get all accessible doors and find the one with the specified ID
            val allDoors = getUserAccessibleDoors()
            val specificDoor = allDoors.getOrNull()?.find { it.id == doorId }
            
            specificDoor?.let {
                Result.success(it)
            } ?: Result.failure(Exception("Door with ID $doorId not found"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun controlDoor(action: String): Result<Boolean> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token.isNullOrEmpty()) {
                return Result.failure(Exception("No authentication token"))
            }

            // For now, control the first door or default door
            val request = DoorControlRequest(action = action)
            val response = apiService.controlDoor("Bearer $token", request)
            
            if (response.isSuccessful) {
                val controlResponse = response.body()
                Result.success(controlResponse?.success == true)
            } else {
                Result.failure(Exception("API Error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun controlDoorById(action: String, doorId: String): Result<Boolean> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token.isNullOrEmpty()) {
                return Result.failure(Exception("No authentication token"))
            }

            val request = DoorControlRequest(action = action, door_id = doorId)
            val response = apiService.controlDoor("Bearer $token", request)
            
            if (response.isSuccessful) {
                val controlResponse = response.body()
                Result.success(controlResponse?.success == true)
            } else {
                Result.failure(Exception("API Error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getNotifications(): Result<List<Notification>> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token.isNullOrEmpty()) {
                return Result.failure(Exception("No authentication token"))
            }

            val response = apiService.getNotifications("Bearer $token")
            if (response.isSuccessful) {
                val notificationResponse = response.body()
                if (notificationResponse?.success == true && notificationResponse.data != null) {
                    val notifications = notificationResponse.data.map { it.toDomain() }
                    Result.success(notifications)
                } else {
                    Result.failure(Exception(notificationResponse?.message ?: "Failed to get notifications"))
                }
            } else {
                Result.failure(Exception("API Error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getUnreadNotificationCount(): Result<Int> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token.isNullOrEmpty()) {
                return Result.failure(Exception("No authentication token"))
            }

            val response = apiService.getUnreadNotificationCount("Bearer $token")
            if (response.isSuccessful) {
                val countResponse = response.body()
                if (countResponse?.success == true && countResponse.data != null) {
                    Result.success(countResponse.data)
                } else {
                    Result.failure(Exception(countResponse?.message ?: "Failed to get notification count"))
                }
            } else {
                Result.failure(Exception("API Error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun markNotificationsAsRead(notificationIds: List<String>): Result<Unit> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token.isNullOrEmpty()) {
                return Result.failure(Exception("No authentication token"))
            }

            val request = MarkReadRequest(notification_ids = notificationIds)
            val response = apiService.markNotificationsAsRead("Bearer $token", request)
            
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("API Error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getAccessHistory(): Result<List<AccessLog>> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token.isNullOrEmpty()) {
                return Result.failure(Exception("No authentication token"))
            }

            val response = apiService.getAccessHistory("Bearer $token")
            if (response.isSuccessful) {
                val accessLogResponse = response.body()
                if (accessLogResponse?.success == true && accessLogResponse.data != null) {
                    val accessLogs = accessLogResponse.data.map { it.toDomain() }
                    Result.success(accessLogs)
                } else {
                    Result.failure(Exception(accessLogResponse?.message ?: "Failed to get access history"))
                }
            } else {
                Result.failure(Exception("API Error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun refreshData(): Result<DashboardData> {
        return getDashboardData()
    }

    private suspend fun getCurrentUser(): Result<User> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token.isNullOrEmpty()) {
                return Result.failure(Exception("No authentication token"))
            }

            val response = apiService.getUserProfile("Bearer $token")
            if (response.isSuccessful) {
                val userResponse = response.body()
                if (userResponse?.success == true && userResponse.data != null) {
                    val userDto = userResponse.data
                    val user = User(
                        id = userDto.id,
                        name = userDto.name,
                        email = userDto.email,
                        role = userDto.role,
                        faceRegistered = userDto.face_registered,
                        avatar = userDto.avatar,
                        phone = userDto.phone,
                        createdAt = try {
                            java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.getDefault())
                                .parse(userDto.created_at)?.time ?: System.currentTimeMillis()
                        } catch (e: Exception) {
                            System.currentTimeMillis()
                        }
                    )
                    Result.success(user)
                } else {
                    Result.failure(Exception(userResponse?.message ?: "Failed to get user profile"))
                }
            } else {
                Result.failure(Exception("API Error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

}
