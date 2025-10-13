package com.authentic.smartdoor.dashboard.data.remote

import com.authentic.smartdoor.dashboard.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

interface DashboardApiService {
    
    // Door endpoints
    @GET("door/status")
    suspend fun getDoorStatus(
        @Header("Authorization") token: String
    ): Response<DoorStatusResponse>
    
    @GET("door/user-access")
    suspend fun getUserAccessibleDoors(
        @Header("Authorization") token: String
    ): Response<DoorListResponse>
    
    @POST("door/control")
    suspend fun controlDoor(
        @Header("Authorization") token: String,
        @Body request: DoorControlRequest
    ): Response<DoorControlResponse>
    
    @GET("door/logs")
    suspend fun getDoorLogs(
        @Header("Authorization") token: String
    ): Response<AccessLogResponse>
    
    @POST("door/emergency-unlock")
    suspend fun emergencyUnlock(
        @Header("Authorization") token: String
    ): Response<DoorControlResponse>
    
    // Notification endpoints
    @GET("notifications")
    suspend fun getNotifications(
        @Header("Authorization") token: String
    ): Response<NotificationResponse>
    
    @GET("notifications/unread/count")
    suspend fun getUnreadNotificationCount(
        @Header("Authorization") token: String
    ): Response<NotificationCountResponse>
    
    @POST("notifications/mark-read")
    suspend fun markNotificationsAsRead(
        @Header("Authorization") token: String,
        @Body request: MarkReadRequest
    ): Response<Map<String, Any>>
    
    // History endpoints
    @GET("history/access")
    suspend fun getAccessHistory(
        @Header("Authorization") token: String
    ): Response<AccessLogResponse>
    
    @GET("history/summary")
    suspend fun getHistorySummary(
        @Header("Authorization") token: String,
        @Query("period") period: String = "7d"
    ): Response<Map<String, Any>>
    
    // Analytics endpoints
    @GET("analytics/summary")
    suspend fun getAnalyticsSummary(
        @Header("Authorization") token: String,
        @Query("period") period: String = "7d"
    ): Response<Map<String, Any>>
    
    // User endpoints
    @GET("users")
    suspend fun getUsers(
        @Header("Authorization") token: String
    ): Response<UserListResponse>
    
    @GET("auth/me")
    suspend fun getUserProfile(
        @Header("Authorization") token: String
    ): Response<UserProfileResponse>
    
    @POST("auth/logout")
    suspend fun logout(
        @Header("Authorization") token: String
    ): Response<Map<String, Any>>
}


data class UserListResponse(
    val success: Boolean,
    val data: List<UserDto>?,
    val message: String?
)

data class UserProfileResponse(
    val success: Boolean,
    val data: UserDto?,
    val message: String?
)

data class UserDto(
    val id: String,
    val name: String,
    val email: String,
    val role: String,
    val face_registered: Boolean,
    val avatar: String?,
    val phone: String?,
    val created_at: String
)
