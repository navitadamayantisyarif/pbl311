package com.authentic.smartdoor.dashboard

import com.authentic.smartdoor.dashboard.domain.model.AccessLog
import com.authentic.smartdoor.dashboard.ui.components.ChartDataGenerator
import org.junit.Assert.assertEquals
import org.junit.Test

class AnalyticsChartDataTest {
    @Test
    fun `daily chart aggregates by hour of today`() {
        val cal = java.util.Calendar.getInstance()
        cal.set(java.util.Calendar.HOUR_OF_DAY, 0)
        cal.set(java.util.Calendar.MINUTE, 10)
        cal.set(java.util.Calendar.SECOND, 0)
        cal.set(java.util.Calendar.MILLISECOND, 0)
        val fmt = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.getDefault()).apply {
            timeZone = java.util.TimeZone.getTimeZone("UTC")
        }
        val ts00 = fmt.format(cal.time)
        cal.set(java.util.Calendar.HOUR_OF_DAY, 10)
        cal.set(java.util.Calendar.MINUTE, 0)
        val ts10 = fmt.format(cal.time)

        val logs = listOf(
            AccessLog("1","u","d","buka", ts00, true, "m","-",null),
            AccessLog("2","u","d","buka", ts10, true, "m","-",null)
        )

        val data = ChartDataGenerator.generateDailyData(logs)
        val points = data.dataPoints
        assertEquals(12, points.size)
        val h00 = points.first { it.label == "00" }.value
        val h10 = points.first { it.label == "10" }.value
        assertEquals(1, h00)
        assertEquals(1, h10)
    }
}
