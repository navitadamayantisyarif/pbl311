package com.authentic.smartdoor.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import com.authentic.smartdoor.storage.remote.datasource.DashboardRemoteDataSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import android.util.Log

@AndroidEntryPoint
class SmartDoorMessagingService : FirebaseMessagingService() {

    @Inject
    lateinit var remoteDataSource: DashboardRemoteDataSource
    @Inject
    lateinit var preferences: com.authentic.smartdoor.storage.preferences.PreferencesManager

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d("FCM", "onNewToken: $token")
        try { preferences.saveFcmToken(token) } catch (_: Exception) {}
        CoroutineScope(Dispatchers.IO).launch {
            try {
                remoteDataSource.registerFcmToken(token)
            } catch (_: Exception) {}
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        Log.d("FCM", "onMessageReceived: ${message.notification?.title} | ${message.notification?.body}")
        val title = message.notification?.title ?: "SecureDoor"
        val body = message.notification?.body ?: "New notification"
        showNotification(title, body)
    }

    private fun showNotification(title: String, body: String) {
        val channelId = "securedoor_default"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "SecureDoor Notifications",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.createNotificationChannel(channel)
        }

        val builder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)

        NotificationManagerCompat.from(this).notify((System.currentTimeMillis() % Int.MAX_VALUE).toInt(), builder.build())
    }
}
