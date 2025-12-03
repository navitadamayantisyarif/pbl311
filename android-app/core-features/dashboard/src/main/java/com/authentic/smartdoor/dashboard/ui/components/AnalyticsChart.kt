package com.authentic.smartdoor.dashboard.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalDensity
import android.graphics.Paint
import android.graphics.Typeface
import androidx.compose.ui.graphics.nativeCanvas
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

data class ChartDataPoint(
    val label: String,
    val value: Int,
    val timestamp: Long
)

data class AnalyticsChartData(
    val dataPoints: List<ChartDataPoint>,
    val maxValue: Int,
    val totalAccess: Int
)

@Composable
fun AnalyticsChart(
    chartData: AnalyticsChartData,
    modifier: Modifier = Modifier,
    minHeight: Dp = 380.dp
) {
    val dynamicHeight = remember(chartData) {
        val points = chartData.dataPoints.size
        val maxVal = chartData.maxValue
        val addByPoints = ((points - 8).coerceAtLeast(0)) * 8
        val addByMax = ((maxVal - 5).coerceAtLeast(0)) * 6
        val total = (380 + addByPoints + addByMax).coerceIn(380, 520)
        total.dp
    }
    Card(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = minHeight)
            .height(dynamicHeight),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            
            
            // Chart Content
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 220.dp)
                    .weight(1f)
                    .padding(top = 8.dp)
            ) {
                if (chartData.dataPoints.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "Tidak ada data",
                                style = MaterialTheme.typography.bodyMedium.copy(color = Color(0xFF9E9E9E))
                            )
                            Text(
                                text = "Data: ${chartData.totalAccess} akses",
                                style = MaterialTheme.typography.bodySmall.copy(color = Color(0xFF9E9E9E))
                            )
                        }
                    }
                } else {
                    BarChartCanvas(
                        chartData = chartData,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
            
            Spacer(Modifier.height(2.dp))
            
            // Summary
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Total: ${chartData.totalAccess} akses",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = Color(0xFF6B6B6B),
                        fontSize = 12.sp
                    )
                )
                Text(
                    text = "Tertinggi: ${chartData.maxValue}",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = Color(0xFF6B6B6B),
                        fontSize = 12.sp
                    )
                )
            }
        }
    }
}

@Composable
private fun BarChartCanvas(chartData: AnalyticsChartData, modifier: Modifier = Modifier) {
    val density = LocalDensity.current
    Canvas(modifier = modifier) {
        val leftPad = with(density) { 24.dp.toPx() }
        val bottomPad = with(density) { 48.dp.toPx() }
        val topPad = with(density) { 14.dp.toPx() }
        val rightPad = with(density) { 10.dp.toPx() }
        val chartW = (size.width - leftPad - rightPad).coerceAtLeast(1f)
        val chartH = (size.height - topPad - bottomPad).coerceAtLeast(1f)
        val originX = leftPad
        val originY = size.height - bottomPad

        val rawMax = chartData.maxValue
        val yMax = if (rawMax <= 0) 1 else rawMax
        val desiredSpacing = with(density) { 18.dp.toPx() }
        var targetLines = kotlin.math.max(10, kotlin.math.min(18, (chartH / desiredSpacing).toInt()))
        if (targetLines <= 0) targetLines = 1
        val yStep = kotlin.math.ceil(yMax.toFloat() / targetLines).toInt()
        val gridCount = kotlin.math.max(yMax / yStep, 1)

        val minorDesired = with(density) { 12.dp.toPx() }
        var subdivisions = kotlin.math.ceil(chartH / (minorDesired * yMax)).toInt()
        subdivisions = subdivisions.coerceIn(3, 8)

        val totalMinorLines = yMax * subdivisions
        for (j in 0..totalMinorLines) {
            val y = originY - (j.toFloat() / subdivisions.toFloat()) * (chartH / yMax.toFloat())
            val isMajor = (j % subdivisions) == 0
            drawLine(
                color = if (isMajor) Color(0xFFE0E0E0) else Color(0xFFF1F1F1),
                start = Offset(originX, y),
                end = Offset(originX + chartW, y),
                strokeWidth = if (isMajor) 1f else 0.8f,
                cap = StrokeCap.Round
            )
        }

        val count = chartData.dataPoints.size
        if (count > 0) {
            val baseSlot = chartW / count
            val minBar = with(density) { 8.dp.toPx() }
            val maxBar = with(density) { 28.dp.toPx() }
            var barW = (baseSlot * 0.6f).coerceIn(minBar, maxBar)
            val minGap = with(density) { 4.dp.toPx() }
            var gap = (baseSlot - barW).coerceAtLeast(minGap)

            var occupancy = barW * count + gap * (count - 1).coerceAtLeast(0)
            if (occupancy > chartW) {
                val extra = occupancy - chartW
                val reducePerBar = extra / count
                barW = (barW - reducePerBar).coerceAtLeast(minBar)
                val remaining = chartW - barW * count
                gap = if (count > 1) kotlin.math.max(minGap, remaining / (count - 1)) else 0f
                occupancy = barW * count + gap * (count - 1).coerceAtLeast(0)
            }

            val startX = originX + (chartW - occupancy) / 2f

            chartData.dataPoints.forEachIndexed { idx, p ->
                val scaled = (p.value.coerceAtLeast(0)).toFloat() * (chartH / yMax.toFloat())
                val h = scaled.coerceAtLeast(with(density) { 12.dp.toPx() })
                val x = startX + idx * (barW + gap)
                val y = originY - h
                drawRect(
                    color = if (p.value > 0) Color(0xFF6C63FF) else Color(0xFFE0E0E0),
                    topLeft = Offset(x, y),
                    size = Size(barW, h)
                )
            }

            drawIntoCanvas { c ->
                val labelPaint = Paint().apply {
                    color = android.graphics.Color.parseColor("#6B6B6B")
                    textSize = with(density) { 11.sp.toPx() }
                    isAntiAlias = true
                    textAlign = Paint.Align.CENTER
                }
                val yPaint = Paint().apply {
                    color = android.graphics.Color.parseColor("#9E9E9E")
                    textSize = with(density) { 10.sp.toPx() }
                    isAntiAlias = true
                    typeface = Typeface.DEFAULT
                    textAlign = Paint.Align.RIGHT
                }

                for (i in 0..gridCount) {
                    val v = i * yStep
                    val y = originY - v * (chartH / yMax.toFloat())
                    c.nativeCanvas.drawText(v.toString(), originX - with(density) { 6.dp.toPx() }, y + with(density) { 3.dp.toPx() }, yPaint)
                }

                chartData.dataPoints.forEachIndexed { idx, p ->
                    val baseSlot = chartW / count
                    val minBar = with(density) { 8.dp.toPx() }
                    val maxBar = with(density) { 28.dp.toPx() }
                    var barW = (baseSlot * 0.6f).coerceIn(minBar, maxBar)
                    val minGap = with(density) { 4.dp.toPx() }
                    var gap = (baseSlot - barW).coerceAtLeast(minGap)
                    var occupancy = barW * count + gap * (count - 1).coerceAtLeast(0)
                    if (occupancy > chartW) {
                        val extra = occupancy - chartW
                        val reducePerBar = extra / count
                        barW = (barW - reducePerBar).coerceAtLeast(minBar)
                        val remaining = chartW - barW * count
                        gap = if (count > 1) kotlin.math.max(minGap, remaining / (count - 1)) else 0f
                        occupancy = barW * count + gap * (count - 1).coerceAtLeast(0)
                    }
                    val startX = originX + (chartW - occupancy) / 2f
                    val center = startX + idx * (barW + gap) + (barW / 2f)
                    c.nativeCanvas.drawText(p.label, center, originY + with(density) { 12.dp.toPx() }, labelPaint)
                }
            }
        }
        drawLine(
            color = Color(0xFFBDBDBD),
            start = Offset(originX, originY),
            end = Offset(originX + chartW, originY),
            strokeWidth = 1.5f,
            cap = StrokeCap.Round
        )
        drawLine(
            color = Color(0xFFBDBDBD),
            start = Offset(originX, originY - chartH),
            end = Offset(originX, originY),
            strokeWidth = 1.5f,
            cap = StrokeCap.Round
        )
    }
}

// Utility functions for generating chart data based on time period
object ChartDataGenerator {
    
    fun generateDailyData(accessLogs: List<com.authentic.smartdoor.dashboard.domain.model.AccessLog>): AnalyticsChartData {
        val cal = Calendar.getInstance()
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        val start = cal.timeInMillis
        val end = start + 24L * 60L * 60L * 1000L

        val buckets = IntArray(12) { 0 } // 2-jam per bucket
        var total = 0
        accessLogs.forEach { log ->
            val ts = getTimestampFromLog(log.timestamp)
            if (ts in start until end) {
                val hour = getHourFromTimestamp(ts)
                val idx = (hour / 2).coerceIn(0, 11)
                buckets[idx] = buckets[idx] + 1
                total++
            }
        }
        val points = (0..11).map { i ->
            val h = i * 2
            ChartDataPoint(label = String.format("%02d", h), value = buckets[i], timestamp = getTimestampForHour(h))
        }
        val maxValue = points.maxOfOrNull { it.value } ?: 0
        return AnalyticsChartData(points, maxValue, total)
    }

    fun generateWeeklyData(accessLogs: List<com.authentic.smartdoor.dashboard.domain.model.AccessLog>): AnalyticsChartData {
        val cal = Calendar.getInstance()
        cal.firstDayOfWeek = Calendar.MONDAY
        // Move to start of week (Monday)
        while (cal.get(Calendar.DAY_OF_WEEK) != Calendar.MONDAY) {
            cal.add(Calendar.DAY_OF_YEAR, -1)
        }
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        val start = cal.timeInMillis
        val end = start + 7L * 24L * 60L * 60L * 1000L

        val days = listOf("Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min")
        val daily = IntArray(7) { 0 }
        var total = 0
        accessLogs.forEach { log ->
            val ts = getTimestampFromLog(log.timestamp)
            if (ts in start until end) {
                val d = getDayOfWeekFromTimestamp(ts)
                val idx = days.indexOf(d)
                if (idx >= 0) {
                    daily[idx] = daily[idx] + 1
                    total++
                }
            }
        }
        val points = days.mapIndexed { i, label ->
            ChartDataPoint(label = label, value = daily[i], timestamp = getTimestampForDay(label))
        }
        val maxValue = points.maxOfOrNull { it.value } ?: 0
        return AnalyticsChartData(points, maxValue, total)
    }

    fun generateMonthlyData(accessLogs: List<com.authentic.smartdoor.dashboard.domain.model.AccessLog>): AnalyticsChartData {
        val cal = Calendar.getInstance()
        cal.set(Calendar.DAY_OF_MONTH, 1)
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        val start = cal.timeInMillis
        val end = cal.apply { add(Calendar.MONTH, 1) }.timeInMillis

        val weeks = (1..5).toList()
        val weekly = IntArray(5) { 0 }
        var total = 0
        accessLogs.forEach { log ->
            val ts = getTimestampFromLog(log.timestamp)
            if (ts in start until end) {
                val w = getWeekOfMonthFromTimestamp(ts)
                if (w in 1..5) {
                    weekly[w - 1] = weekly[w - 1] + 1
                    total++
                }
            }
        }
        val points = weeks.map { w ->
            ChartDataPoint(label = "M$w", value = weekly[w - 1], timestamp = getTimestampForWeek(w))
        }
        val maxValue = points.maxOfOrNull { it.value } ?: 0
        return AnalyticsChartData(points, maxValue, total)
    }
    
    // Helper functions to extract data from access logs
    private fun getTimestampFromLog(timestamp: String): Long {
        return try {
            SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.getDefault()).parse(timestamp)?.time ?: 0L
        } catch (_: Exception) {
            try {
                SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssX", Locale.getDefault()).parse(timestamp)?.time ?: 0L
            } catch (_: Exception) {
                0L
            }
        }
    }
    
    private fun getHourFromTimestamp(timestamp: Long): Int {
        val calendar = Calendar.getInstance()
        calendar.timeInMillis = timestamp
        return calendar.get(Calendar.HOUR_OF_DAY)
    }
    
    private fun getDayOfWeekFromTimestamp(timestamp: Long): String {
        val calendar = Calendar.getInstance()
        calendar.timeInMillis = timestamp
        val dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK)
        return when (dayOfWeek) {
            Calendar.MONDAY -> "Sen"
            Calendar.TUESDAY -> "Sel"
            Calendar.WEDNESDAY -> "Rab"
            Calendar.THURSDAY -> "Kam"
            Calendar.FRIDAY -> "Jum"
            Calendar.SATURDAY -> "Sab"
            Calendar.SUNDAY -> "Min"
            else -> "Sen"
        }
    }
    
    private fun getWeekOfMonthFromTimestamp(timestamp: Long): Int {
        val calendar = Calendar.getInstance()
        calendar.timeInMillis = timestamp
        return calendar.get(Calendar.WEEK_OF_MONTH)
    }
    
    private fun getMonthOfYearFromTimestamp(timestamp: Long): Int {
        val calendar = Calendar.getInstance()
        calendar.timeInMillis = timestamp
        return calendar.get(Calendar.MONTH) + 1
    }
    
    private fun tsForMonth(month: Int): Long {
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.MONTH, month - 1)
        calendar.set(Calendar.DAY_OF_MONTH, 1)
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        return calendar.timeInMillis
    }
    
    private fun getTimestampForHour(hour: Int): Long {
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.HOUR_OF_DAY, hour)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        return calendar.timeInMillis
    }
    
    private fun getTimestampForDay(day: String): Long {
        val calendar = Calendar.getInstance()
        val dayOfWeek = when (day) {
            "Sen" -> Calendar.MONDAY
            "Sel" -> Calendar.TUESDAY
            "Rab" -> Calendar.WEDNESDAY
            "Kam" -> Calendar.THURSDAY
            "Jum" -> Calendar.FRIDAY
            "Sab" -> Calendar.SATURDAY
            "Min" -> Calendar.SUNDAY
            else -> Calendar.MONDAY
        }
        calendar.set(Calendar.DAY_OF_WEEK, dayOfWeek)
        return calendar.timeInMillis
    }
    
    private fun getTimestampForWeek(week: Int): Long {
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.WEEK_OF_MONTH, week)
        return calendar.timeInMillis
    }
}
