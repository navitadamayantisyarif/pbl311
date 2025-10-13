package com.authentic.smartdoor.dashboard.domain.repository

import com.authentic.smartdoor.dashboard.domain.model.AccessLog
import com.authentic.smartdoor.dashboard.domain.model.DashboardData
import com.authentic.smartdoor.dashboard.domain.model.Door
import com.authentic.smartdoor.dashboard.domain.model.Notification
import com.authentic.smartdoor.dashboard.domain.model.User

interface DashboardRepository {
    suspend fun getDashboardData(): Result<DashboardData>
    suspend fun getDoorStatus(): Result<Door>
    suspend fun getDoorStatusById(doorId: String): Result<Door>
    suspend fun controlDoor(action: String): Result<Boolean>
    suspend fun controlDoorById(action: String, doorId: String): Result<Boolean>
    suspend fun getNotifications(): Result<List<Notification>>
    suspend fun getUnreadNotificationCount(): Result<Int>
    suspend fun markNotificationsAsRead(notificationIds: List<String>): Result<Unit>
    suspend fun getAccessHistory(): Result<List<AccessLog>>
    suspend fun refreshData(): Result<DashboardData>
    suspend fun getUserProfile(): Result<User>
    suspend fun logout(): Result<Unit>
}
