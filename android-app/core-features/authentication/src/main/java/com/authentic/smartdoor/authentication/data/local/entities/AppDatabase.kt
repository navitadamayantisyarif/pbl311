package com.authentic.smartdoor.authentication.data.local.entities

import androidx.room.Database
import androidx.room.RoomDatabase
import com.authentic.smartdoor.authentication.data.local.dao.UserDao
import com.authentic.smartdoor.authentication.data.local.dao.AccessLogDao
import com.authentic.smartdoor.authentication.data.local.dao.DoorStatusDao
import com.authentic.smartdoor.authentication.data.local.dao.NotificationDao
import com.authentic.smartdoor.authentication.data.local.dao.CameraRecordDao
import com.authentic.smartdoor.authentication.data.local.dao.SystemSettingDao

@Database(
    entities = [
        UserEntity::class,
        AccessLogEntity::class,
        DoorStatusEntity::class,
        NotificationEntity::class,
        CameraRecordEntity::class,
        SystemSettingEntity::class
    ],
    version = 2,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun accessLogDao(): AccessLogDao
    abstract fun doorStatusDao(): DoorStatusDao
    abstract fun notificationDao(): NotificationDao
    abstract fun cameraRecordDao(): CameraRecordDao
    abstract fun systemSettingDao(): SystemSettingDao
}