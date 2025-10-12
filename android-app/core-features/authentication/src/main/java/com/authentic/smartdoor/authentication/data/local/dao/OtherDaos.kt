package com.authentic.smartdoor.authentication.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.authentic.smartdoor.authentication.data.local.entities.DoorStatusEntity
import com.authentic.smartdoor.authentication.data.local.entities.NotificationEntity
import com.authentic.smartdoor.authentication.data.local.entities.CameraRecordEntity
import com.authentic.smartdoor.authentication.data.local.entities.SystemSettingEntity

@Dao
interface DoorStatusDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStatus(status: DoorStatusEntity)

    @Query("SELECT * FROM door_status ORDER BY last_update DESC LIMIT 1")
    suspend fun getLatestStatus(): DoorStatusEntity?

    @Query("DELETE FROM door_status")
    suspend fun clear()
}

@Dao
interface NotificationDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNotification(notification: NotificationEntity)

    @Query("SELECT * FROM notifications WHERE user_id = :userId ORDER BY created_at DESC")
    suspend fun getNotificationsForUser(userId: String): List<NotificationEntity>

    @Query("UPDATE notifications SET read = 1 WHERE id = :id")
    suspend fun markAsRead(id: String)

    @Query("DELETE FROM notifications")
    suspend fun clear()
}

@Dao
interface CameraRecordDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecord(record: CameraRecordEntity)

    @Query("SELECT * FROM camera_records ORDER BY timestamp DESC LIMIT :limit")
    suspend fun getRecentRecords(limit: Int = 50): List<CameraRecordEntity>

    @Query("DELETE FROM camera_records")
    suspend fun clear()
}

@Dao
interface SystemSettingDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSetting(setting: SystemSettingEntity)

    @Query("SELECT * FROM system_settings WHERE key = :key LIMIT 1")
    suspend fun getSettingByKey(key: String): SystemSettingEntity?

    @Query("UPDATE system_settings SET value = :value, updated_at = :updatedAt, updated_by = :updatedBy WHERE key = :key")
    suspend fun updateSettingValue(key: String, value: String, updatedAt: Long, updatedBy: String)

    @Query("DELETE FROM system_settings")
    suspend fun clear()
}