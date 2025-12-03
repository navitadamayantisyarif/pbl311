package com.authentic.smartdoor

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import dagger.hilt.android.HiltAndroidApp
import com.google.firebase.messaging.FirebaseMessaging
import dagger.hilt.android.EntryPointAccessors
import dagger.hilt.EntryPoint
import dagger.hilt.InstallIn
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import com.authentic.smartdoor.storage.remote.datasource.DashboardRemoteDataSource
import dagger.hilt.components.SingletonComponent

@EntryPoint
@InstallIn(SingletonComponent::class)
interface AppEntryPoint {
    fun remoteDataSource(): DashboardRemoteDataSource
    fun preferences(): com.authentic.smartdoor.storage.preferences.PreferencesManager
}

@HiltAndroidApp
class SecureDoorApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "securedoor_default",
                "SecureDoor Notifications",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            val nm = getSystemService(NotificationManager::class.java)
            nm.createNotificationChannel(channel)
        }

        val entryPoint = EntryPointAccessors.fromApplication(this, AppEntryPoint::class.java)
        val remote = entryPoint.remoteDataSource()
        val prefs = entryPoint.preferences()
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                CoroutineScope(Dispatchers.IO).launch {
                    try {
                        prefs.saveFcmToken(task.result)
                        if (prefs.isLoggedIn()) {
                            remote.registerFcmToken(task.result)
                        }
                    } catch (_: Exception) {}
                }
            }
        }
    }
}
