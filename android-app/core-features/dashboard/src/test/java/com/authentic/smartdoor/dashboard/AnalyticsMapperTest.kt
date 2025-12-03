package com.authentic.smartdoor.dashboard

import com.authentic.smartdoor.dashboard.data.mappers.toDomainModel
import com.authentic.smartdoor.storage.mappers.toEntity
import com.authentic.smartdoor.storage.mappers.toGenericAccessLog
import com.authentic.smartdoor.storage.remote.dto.AccessLogDto
import org.junit.Assert.assertEquals
import org.junit.Test

class AnalyticsMapperTest {
    @Test
    fun `ipAddress blank is mapped to dash in domain`() {
        val dto = AccessLogDto(
            id = 1,
            user_id = 2,
            door_id = 3,
            action = "OPEN",
            timestamp = "2024-12-01T10:00:00.000Z",
            success = true,
            method = null,
            ip_address = "",
            camera_capture_id = null,
            user = null,
            door = null,
            camera_capture = null
        )

        val domain = dto.toDomainModel()
        assertEquals("-", domain.ipAddress)
        assertEquals("UNKNOWN", domain.method)
    }

    @Test
    fun `ipAddress blank is mapped to dash in generic and entity`() {
        val dto = AccessLogDto(
            id = 9,
            user_id = 8,
            door_id = 7,
            action = "LOCK",
            timestamp = "2024-12-01T10:05:00.000Z",
            success = false,
            method = null,
            ip_address = "",
            camera_capture_id = null,
            user = null,
            door = null,
            camera_capture = null
        )

        val nonuple = dto.toGenericAccessLog()
        assertEquals("-", nonuple.eighth)

        val entity = dto.toEntity()
        assertEquals("-", entity.ipAddress)
    }
}

