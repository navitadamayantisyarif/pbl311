package com.authentic.smartdoor.dashboard.data.repository

import com.authentic.smartdoor.dashboard.domain.model.AccessLog
import com.authentic.smartdoor.dashboard.domain.model.DashboardData
import com.authentic.smartdoor.dashboard.domain.model.SystemStatus
import com.authentic.smartdoor.dashboard.domain.repository.DashboardRepository
import com.authentic.smartdoor.storage.mappers.toEntity
import com.authentic.smartdoor.storage.mappers.toGenericMetric
import com.authentic.smartdoor.storage.mappers.toGenericChartData
import com.authentic.smartdoor.storage.mappers.toGenericActiveHour
import com.authentic.smartdoor.storage.mappers.toGenericAvailableDoor
import com.authentic.smartdoor.storage.mappers.toGenericAccessLog
import com.authentic.smartdoor.storage.remote.datasource.DashboardRemoteDataSource
import com.authentic.smartdoor.dashboard.data.mappers.toDomainModel
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DashboardRepositoryImpl @Inject constructor(
    private val remote: DashboardRemoteDataSource,
    private val local: com.authentic.smartdoor.storage.local.datasource.DashboardLocalDataSource,
    private val authLocal: com.authentic.smartdoor.storage.local.datasource.AuthLocalDataSource,
    private val networkMonitor: com.authentic.smartdoor.storage.network.NetworkMonitor,
    private val doorMapper: DoorEntityToDomainMapper,
    private val notificationMapper: NotificationEntityToDomainMapper,
    private val accessLogMapper: AccessLogEntityToDomainMapper,
    private val userMapper: UserEntityToDomainMapper
) : DashboardRepository {

    override suspend fun getDashboardData(): Result<DashboardData> {
        return runCatching {
            if (!networkMonitor.isOnline()) {
                val doors = local.getDoorStatuses().map { doorMapper.map(it) }
                val notifications = local.getNotifications().map { notificationMapper.map(it) }
                val accessLogs = local.getRecentAccessLogs(50).map { accessLogMapper.map(it) }
                val user = authLocal.getUserId()?.let { id -> authLocal.getUserById(id) }?.let { userMapper.map(it) }
                val systemStatus = SystemStatus(
                    doorsOnline = doors.count { !it.locked },
                    camerasActive = doors.count { it.cameraActive },
                    batteryOk = doors.all { it.batteryLevel >= 20 }
                )
                return@runCatching DashboardData(
                    user = user,
                    doors = doors,
                    notifications = notifications,
                    recentAccessLogs = accessLogs,
                    systemStatus = systemStatus
                )
            }
            try {
                val doorsRes = remote.getDoorStatus()
                val notifRes = remote.getNotifications(limit = 20)
                val logsRes = remote.getAccessHistory(limit = 10)
                val userRes = remote.getUserProfile()

                val doors = doorsRes.data.orEmpty().map { doorMapper.map(it.toEntity()) }
                val notifications = notifRes.data.orEmpty().map { notificationMapper.map(it.toEntity()) }
                val accessibleDoorIds = doorsRes.data.orEmpty().map { it.id }.toSet()
                val accessLogs = logsRes.data.orEmpty()
                    .filter { accessibleDoorIds.contains(it.door_id) }
                    .map { it.toDomainModel() }
                val user = userRes.data?.let { userDto ->
                    val entity = userDto.toEntity()
                    authLocal.upsertUser(entity)
                    authLocal.saveUserId(entity.id)
                    com.authentic.smartdoor.dashboard.domain.model.User(
                        id = userDto.id.toString(),
                        name = userDto.name,
                        email = userDto.email,
                        avatar = userDto.avatar,
                        role = userDto.role,
                        faceRegistered = userDto.face_registered
                    )
                }

                local.clearAll()
                val doorEntities = doorsRes.data.orEmpty().map { it.toEntity() }
                local.saveDoorStatuses(doorEntities)
                val notificationEntities = notifRes.data.orEmpty().map { it.toEntity() }
                local.saveNotifications(notificationEntities)
                val accessLogEntities = logsRes.data.orEmpty().map { it.toEntity() }
                local.saveAccessLogs(accessLogEntities)

                val systemStatus = SystemStatus(
                    doorsOnline = doors.count { !it.locked },
                    camerasActive = doors.count { it.cameraActive },
                    batteryOk = doors.all { it.batteryLevel >= 20 }
                )

                DashboardData(
                    user = user,
                    doors = doors,
                    notifications = notifications,
                    recentAccessLogs = accessLogs,
                    systemStatus = systemStatus
                )
            } catch (e: Exception) {
                val doors = local.getDoorStatuses().map { doorMapper.map(it) }
                val notifications = local.getNotifications().map { notificationMapper.map(it) }
                val accessLogs = local.getRecentAccessLogs(50).map { accessLogMapper.map(it) }
                val user = authLocal.getUserId()?.let { id -> authLocal.getUserById(id) }?.let { userMapper.map(it) }
                val systemStatus = SystemStatus(
                    doorsOnline = doors.count { !it.locked },
                    camerasActive = doors.count { it.cameraActive },
                    batteryOk = doors.all { it.batteryLevel >= 20 }
                )
                DashboardData(
                    user = user,
                    doors = doors,
                    notifications = notifications,
                    recentAccessLogs = accessLogs,
                    systemStatus = systemStatus
                )
            }
        }
    }

    override suspend fun refreshData(): Result<DashboardData> = getDashboardData()

    override suspend fun controlDoor(action: String): Result<Boolean> {
        return runCatching {
            val res = remote.controlDoor(action)
            res.success && (res.data?.success == true)
        }
    }

    override suspend fun controlDoorById(action: String, doorId: String): Result<Boolean> {
        return runCatching {
            val id = doorId.toIntOrNull()
            val res = remote.controlDoor(action, id)
            res.success && (res.data?.success == true)
        }
    }

    override suspend fun markNotificationsAsRead(ids: List<String>): Result<Unit> {
        return runCatching {
            val intIds = ids.mapNotNull { it.toIntOrNull() }
            remote.markNotificationsAsRead(intIds)
            Unit
        }
    }

    override suspend fun getUnreadNotificationCount(): Result<Int> {
        return runCatching {
            if (!networkMonitor.isOnline()) {
                return@runCatching local.getNotifications().count { !it.read }
            }
            try {
                val notif = remote.getNotifications(limit = 100)
                notif.data.orEmpty().count { !it.read }
            } catch (e: Exception) {
                local.getNotifications().count { !it.read }
            }
        }
    }

    override suspend fun getAccessHistory(): Result<List<AccessLog>> {
        return runCatching {
            if (!networkMonitor.isOnline()) {
                return@runCatching local.getRecentAccessLogs(100).map { accessLogMapper.map(it) }
            }
            try {
                val doorsRes = remote.getDoorStatus()
                val accessibleDoorIds = doorsRes.data.orEmpty().map { it.id }.toSet()
                val logs = remote.getAccessHistory(limit = 50)
                val list = logs.data.orEmpty()
                    .filter { accessibleDoorIds.contains(it.door_id) }
                    .map { it.toDomainModel() }
                val entities = logs.data.orEmpty().map { it.toEntity() }
                local.saveAccessLogs(entities)
                list
            } catch (e: Exception) {
                local.getRecentAccessLogs(100).map { accessLogMapper.map(it) }
            }
        }
    }

    override suspend fun getUserProfile(): Result<com.authentic.smartdoor.dashboard.domain.model.User?> {
        return runCatching {
            try {
                val userRes = remote.getUserProfile()
                userRes.data?.let { userDto ->
                    val entity = userDto.toEntity()
                    authLocal.upsertUser(entity)
                    authLocal.saveUserId(entity.id)
                    com.authentic.smartdoor.dashboard.domain.model.User(
                        id = userDto.id.toString(),
                        name = userDto.name,
                        email = userDto.email,
                        avatar = userDto.avatar,
                        role = userDto.role,
                        faceRegistered = userDto.face_registered
                    )
                }
            } catch (e: Exception) {
                authLocal.getUserId()?.let { id -> authLocal.getUserById(id) }?.let { userMapper.map(it) }
            }
        }
    }

    override suspend fun logout(): Result<Unit> {
        return runCatching {
            remote.logout()
            Unit
        }
    }

    override suspend fun getNotifications(): Result<List<com.authentic.smartdoor.dashboard.domain.model.Notification>> {
        return runCatching {
            if (!networkMonitor.isOnline()) {
                return@runCatching local.getNotifications().map { notificationMapper.map(it) }
            }
            try {
                val notifRes = remote.getNotifications(limit = 50)
                notifRes.data.orEmpty().map { notificationMapper.map(it.toEntity()) }
            } catch (e: Exception) {
                local.getNotifications().map { notificationMapper.map(it) }
            }
        }
    }

    override suspend fun refreshNotifications(): Result<List<com.authentic.smartdoor.dashboard.domain.model.Notification>> {
        return runCatching {
            try {
                val notifRes = remote.getNotifications(limit = 50)
                val notifications = notifRes.data.orEmpty().map { notificationMapper.map(it.toEntity()) }
                val notificationEntities = notifRes.data.orEmpty().map { it.toEntity() }
                local.saveNotifications(notificationEntities)
                notifications
            } catch (e: Exception) {
                local.getNotifications().map { notificationMapper.map(it) }
            }
        }
    }

    override suspend fun getAnalyticsData(doorId: Int?, startDate: String?, endDate: String?): Result<com.authentic.smartdoor.dashboard.domain.model.AnalyticsData> {
        return runCatching {
            if (!networkMonitor.isOnline()) {
                val doors = local.getDoorStatuses()
                val doorDomains = doors.map { doorMapper.map(it) }
                val logs = local.getRecentAccessLogs(200)
                val totalAccess = logs.size
                val deniedAccess = logs.count { !it.success }
                val lockedDoors = doorDomains.count { it.locked }
                val openedDoors = doorDomains.count { !it.locked }
                val analyticsMetrics = com.authentic.smartdoor.dashboard.domain.model.AnalyticsMetrics(
                    totalAccess = com.authentic.smartdoor.dashboard.domain.model.AnalyticsMetric(
                        value = totalAccess,
                        change = "0%",
                        changeType = "positive"
                    ),
                    deniedAccess = com.authentic.smartdoor.dashboard.domain.model.AnalyticsMetric(
                        value = deniedAccess,
                        change = "0%",
                        changeType = "negative"
                    ),
                    lockedDoors = com.authentic.smartdoor.dashboard.domain.model.AnalyticsMetric(
                        value = lockedDoors,
                        change = "0%",
                        changeType = "positive"
                    ),
                    openedDoors = com.authentic.smartdoor.dashboard.domain.model.AnalyticsMetric(
                        value = openedDoors,
                        change = "0%",
                        changeType = "positive"
                    )
                )
                val chartData = logs.groupBy {
                    val cal = java.util.Calendar.getInstance().apply { timeInMillis = it.timestamp }
                    cal.get(java.util.Calendar.HOUR_OF_DAY)
                }.map { (hour, items) ->
                    com.authentic.smartdoor.dashboard.domain.model.ChartData(hour = hour, count = items.size)
                }.sortedBy { it.hour }
                val activeHours = chartData.map { cd ->
                    val progress = if (totalAccess == 0) 0.0 else cd.count.toDouble() / totalAccess.toDouble()
                    com.authentic.smartdoor.dashboard.domain.model.ActiveHour(
                        timeRange = String.format("%02d:00-%02d:00", cd.hour, (cd.hour + 1) % 24),
                        count = cd.count,
                        progress = progress
                    )
                }
                val availableDoors = doorDomains.map { d ->
                    com.authentic.smartdoor.dashboard.domain.model.AvailableDoor(
                        id = d.id.toIntOrNull() ?: 0,
                        name = d.name,
                        location = d.location
                    )
                }
                val accessLogs = logs.map { accessLogMapper.map(it) }
                return@runCatching com.authentic.smartdoor.dashboard.domain.model.AnalyticsData(
                    metrics = analyticsMetrics,
                    chartData = chartData,
                    activeHours = activeHours,
                    availableDoors = availableDoors,
                    accessLogs = accessLogs
                )
            }
            try {
                val analyticsRes = remote.getAnalyticsDashboard(doorId, startDate, endDate)
                val data = analyticsRes.data ?: throw Exception("No analytics data received")
                val totalAccessMetric = data.metrics.totalAccess.toGenericMetric()
                val deniedAccessMetric = data.metrics.deniedAccess.toGenericMetric()
                val lockedDoorsMetric = data.metrics.lockedDoors.toGenericMetric()
                val openedDoorsMetric = data.metrics.openedDoors.toGenericMetric()
                val analyticsMetrics = com.authentic.smartdoor.dashboard.domain.model.AnalyticsMetrics(
                    totalAccess = com.authentic.smartdoor.dashboard.domain.model.AnalyticsMetric(
                        value = totalAccessMetric.first,
                        change = totalAccessMetric.second,
                        changeType = data.metrics.totalAccess.changeType
                    ),
                    deniedAccess = com.authentic.smartdoor.dashboard.domain.model.AnalyticsMetric(
                        value = deniedAccessMetric.first,
                        change = deniedAccessMetric.second,
                        changeType = data.metrics.deniedAccess.changeType
                    ),
                    lockedDoors = com.authentic.smartdoor.dashboard.domain.model.AnalyticsMetric(
                        value = lockedDoorsMetric.first,
                        change = lockedDoorsMetric.second,
                        changeType = data.metrics.lockedDoors.changeType
                    ),
                    openedDoors = com.authentic.smartdoor.dashboard.domain.model.AnalyticsMetric(
                        value = openedDoorsMetric.first,
                        change = openedDoorsMetric.second,
                        changeType = data.metrics.openedDoors.changeType
                    )
                )
                val chartData = data.chartData.map { chartDto ->
                    val chartPair = chartDto.toGenericChartData()
                    com.authentic.smartdoor.dashboard.domain.model.ChartData(
                        hour = chartPair.first,
                        count = chartPair.second
                    )
                }
                val activeHours = data.activeHours.map { activeHourDto ->
                    val activeHourTriple = activeHourDto.toGenericActiveHour()
                    com.authentic.smartdoor.dashboard.domain.model.ActiveHour(
                        timeRange = activeHourTriple.first,
                        count = activeHourTriple.second,
                        progress = activeHourTriple.third
                    )
                }
                val availableDoors = data.availableDoors.map { doorDto ->
                    val doorTriple = doorDto.toGenericAvailableDoor()
                    com.authentic.smartdoor.dashboard.domain.model.AvailableDoor(
                        id = doorTriple.first,
                        name = doorTriple.second,
                        location = doorTriple.third
                    )
                }
                var accessLogs = data.accessLogs?.map { logDto ->
                    val logNonuple = logDto.toGenericAccessLog()
                    com.authentic.smartdoor.dashboard.domain.model.AccessLog(
                        id = logNonuple.first,
                        userId = logNonuple.second,
                        doorId = logNonuple.third,
                        action = logNonuple.fourth,
                        timestamp = logNonuple.fifth,
                        success = logNonuple.sixth,
                        method = logNonuple.seventh,
                        ipAddress = logNonuple.eighth,
                        cameraCaptureId = logNonuple.ninth
                    )
                }
                if (accessLogs.isNullOrEmpty()) {
                    val cal = java.util.Calendar.getInstance()
                    val endIso = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.getDefault()).apply {
                        timeZone = java.util.TimeZone.getTimeZone("UTC")
                    }.format(cal.time)
                    cal.add(java.util.Calendar.DAY_OF_YEAR, -30)
                    val startIso = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.getDefault()).apply {
                        timeZone = java.util.TimeZone.getTimeZone("UTC")
                    }.format(cal.time)
                    val historyRes = remote.getAccessHistory(limit = 200, doorId = doorId, startDate = startIso, endDate = endIso)
                    val doorsRes = remote.getDoorStatus()
                    val accessibleDoorIds = doorsRes.data.orEmpty().map { it.id }.toSet()
                    accessLogs = historyRes.data.orEmpty()
                        .filter { accessibleDoorIds.contains(it.door_id) }
                        .map { it.toDomainModel() }
                }
                com.authentic.smartdoor.dashboard.domain.model.AnalyticsData(
                    metrics = analyticsMetrics,
                    chartData = chartData,
                    activeHours = activeHours,
                    availableDoors = availableDoors,
                    accessLogs = accessLogs
                )
            } catch (e: Exception) {
                val doors = local.getDoorStatuses()
                val doorDomains = doors.map { doorMapper.map(it) }
                val logs = local.getRecentAccessLogs(200)
                val totalAccess = logs.size
                val deniedAccess = logs.count { !it.success }
                val lockedDoors = doorDomains.count { it.locked }
                val openedDoors = doorDomains.count { !it.locked }
                val analyticsMetrics = com.authentic.smartdoor.dashboard.domain.model.AnalyticsMetrics(
                    totalAccess = com.authentic.smartdoor.dashboard.domain.model.AnalyticsMetric(
                        value = totalAccess,
                        change = "0%",
                        changeType = "positive"
                    ),
                    deniedAccess = com.authentic.smartdoor.dashboard.domain.model.AnalyticsMetric(
                        value = deniedAccess,
                        change = "0%",
                        changeType = "negative"
                    ),
                    lockedDoors = com.authentic.smartdoor.dashboard.domain.model.AnalyticsMetric(
                        value = lockedDoors,
                        change = "0%",
                        changeType = "positive"
                    ),
                    openedDoors = com.authentic.smartdoor.dashboard.domain.model.AnalyticsMetric(
                        value = openedDoors,
                        change = "0%",
                        changeType = "positive"
                    )
                )
                val chartData = logs.groupBy {
                    val cal = java.util.Calendar.getInstance().apply { timeInMillis = it.timestamp }
                    cal.get(java.util.Calendar.HOUR_OF_DAY)
                }.map { (hour, items) ->
                    com.authentic.smartdoor.dashboard.domain.model.ChartData(hour = hour, count = items.size)
                }.sortedBy { it.hour }
                val activeHours = chartData.map { cd ->
                    val progress = if (totalAccess == 0) 0.0 else cd.count.toDouble() / totalAccess.toDouble()
                    com.authentic.smartdoor.dashboard.domain.model.ActiveHour(
                        timeRange = String.format("%02d:00-%02d:00", cd.hour, (cd.hour + 1) % 24),
                        count = cd.count,
                        progress = progress
                    )
                }
                val availableDoors = doorDomains.map { d ->
                    com.authentic.smartdoor.dashboard.domain.model.AvailableDoor(
                        id = d.id.toIntOrNull() ?: 0,
                        name = d.name,
                        location = d.location
                    )
                }
                val accessLogs = logs.map { accessLogMapper.map(it) }
                com.authentic.smartdoor.dashboard.domain.model.AnalyticsData(
                    metrics = analyticsMetrics,
                    chartData = chartData,
                    activeHours = activeHours,
                    availableDoors = availableDoors,
                    accessLogs = accessLogs
                )
            }
        }
    }

    override suspend fun getCameraStreamUrl(doorId: Int): Result<String?> {
        return runCatching {
            val res = remote.getCameraStream(doorId)
            res.data?.stream_url
        }
    }
}

class DoorEntityToDomainMapper @Inject constructor() {
    fun map(entity: com.authentic.smartdoor.storage.local.entities.DoorStatusEntity): com.authentic.smartdoor.dashboard.domain.model.Door {
        return com.authentic.smartdoor.dashboard.domain.model.Door(
            id = entity.id,
            name = entity.name,
            location = entity.location,
            locked = entity.locked,
            batteryLevel = entity.batteryLevel,
            lastUpdate = entity.lastUpdate?.let { 
                java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.getDefault())
                    .apply { timeZone = java.util.TimeZone.getTimeZone("UTC") }
                    .format(java.util.Date(it))
            },
            wifiStrength = entity.wifiStrength,
            cameraActive = entity.cameraActive
        )
    }
}

class NotificationEntityToDomainMapper @Inject constructor() {
    fun map(entity: com.authentic.smartdoor.storage.local.entities.NotificationEntity): com.authentic.smartdoor.dashboard.domain.model.Notification {
        val createdAtIso = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.getDefault())
            .apply { timeZone = java.util.TimeZone.getTimeZone("UTC") }
            .format(java.util.Date(entity.createdAt))
        return com.authentic.smartdoor.dashboard.domain.model.Notification(
            id = entity.id,
            title = entity.title,
            message = entity.message,
            type = entity.type,
            read = entity.read,
            createdAt = createdAtIso
        )
    }
}

class UserEntityToDomainMapper @Inject constructor() {
    fun map(entity: com.authentic.smartdoor.storage.local.entities.UserEntity): com.authentic.smartdoor.dashboard.domain.model.User {
        return com.authentic.smartdoor.dashboard.domain.model.User(
            id = entity.id,
            name = entity.name,
            email = entity.email,
            avatar = null,
            role = entity.role,
            faceRegistered = null
        )
    }
}

class AccessLogEntityToDomainMapper @Inject constructor() {
    fun map(entity: com.authentic.smartdoor.storage.local.entities.AccessLogEntity): com.authentic.smartdoor.dashboard.domain.model.AccessLog {
        val iso = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.getDefault())
            .apply { timeZone = java.util.TimeZone.getTimeZone("UTC") }
            .format(java.util.Date(entity.timestamp))
        return com.authentic.smartdoor.dashboard.domain.model.AccessLog(
            id = entity.id,
            userId = entity.userId,
            doorId = entity.doorId,
            action = entity.action,
            timestamp = iso,
            success = entity.success,
            method = entity.method,
            ipAddress = entity.ipAddress,
            cameraCaptureId = entity.cameraCaptureId
        )
    }
}
