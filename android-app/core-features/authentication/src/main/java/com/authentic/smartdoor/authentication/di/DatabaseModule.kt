package com.authentic.smartdoor.authentication.di

import android.content.Context
import androidx.room.Room
import com.authentic.smartdoor.authentication.data.local.dao.UserDao
import com.authentic.smartdoor.authentication.data.local.dao.AccessLogDao
import com.authentic.smartdoor.authentication.data.local.dao.DoorStatusDao
import com.authentic.smartdoor.authentication.data.local.dao.NotificationDao
import com.authentic.smartdoor.authentication.data.local.dao.CameraRecordDao
import com.authentic.smartdoor.authentication.data.local.dao.SystemSettingDao
import com.authentic.smartdoor.authentication.data.local.entities.AppDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "smart_door_database"
        )
            .fallbackToDestructiveMigration()
            .build()
    }

    @Provides
    fun provideUserDao(database: AppDatabase): UserDao = database.userDao()

    @Provides
    fun provideAccessLogDao(database: AppDatabase): AccessLogDao = database.accessLogDao()

    @Provides
    fun provideDoorStatusDao(database: AppDatabase): DoorStatusDao = database.doorStatusDao()

    @Provides
    fun provideNotificationDao(database: AppDatabase): NotificationDao = database.notificationDao()

    @Provides
    fun provideCameraRecordDao(database: AppDatabase): CameraRecordDao = database.cameraRecordDao()

    @Provides
    fun provideSystemSettingDao(database: AppDatabase): SystemSettingDao = database.systemSettingDao()
}