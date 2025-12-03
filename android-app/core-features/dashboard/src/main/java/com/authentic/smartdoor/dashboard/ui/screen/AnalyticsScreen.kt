package com.authentic.smartdoor.dashboard.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.ArrowDropUp
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.authentic.smartdoor.dashboard.presentation.viewmodel.AnalyticsEvent
import com.authentic.smartdoor.dashboard.presentation.viewmodel.AnalyticsViewModel
import com.authentic.smartdoor.dashboard.ui.components.BottomBar
import com.authentic.smartdoor.dashboard.ui.components.AnalyticsChart
import com.authentic.smartdoor.dashboard.ui.components.ChartDataGenerator
import com.authentic.smartdoor.dashboard.ui.DashboardScreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsScreen(
    modifier: Modifier = Modifier,
    onBackClick: () -> Unit = {},
    onNavigateToHome: () -> Unit = {},
    onNavigateToAccessHistory: () -> Unit = {},
    onNavigateToAnalytics: () -> Unit = {},
    onNavigateToNotifications: () -> Unit = {},
    viewModel: AnalyticsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTimePeriod by remember { mutableStateOf("Hari Ini") }
    var isDropdownExpanded by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        viewModel.handleEvent(AnalyticsEvent.LoadAnalyticsData)
    }

    Scaffold(
        modifier = modifier,
        containerColor = Color(0xFFF7F6FF),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Analitik",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1A1A1A)
                        )
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color(0xFF6C63FF)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFFF7F6FF)
                )
            )
        },
        bottomBar = { 
            BottomBar(
                onHomeClick = onNavigateToHome,
                onAccessHistoryClick = onNavigateToAccessHistory,
                onNotificationsClick = onNavigateToNotifications,
                onAnalyticsClick = { /* Already on analytics */ },
                currentScreen = DashboardScreen.Analytics
            ) 
        }
        ) { padding ->
        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Color(0xFF6C63FF))
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .background(Color(0xFFF7F6FF))
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp)
            ) {
            Spacer(Modifier.height(8.dp))

            // Door Selection Dropdown
            Box {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { isDropdownExpanded = !isDropdownExpanded },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = uiState.selectedDoorName,
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = Color(0xFF1A1A1A),
                                fontSize = 16.sp
                            ),
                            modifier = Modifier.weight(1f)
                        )
                        Icon(
                            if (isDropdownExpanded) Icons.Default.ArrowDropUp else Icons.Default.ArrowDropDown,
                            contentDescription = "Dropdown",
                            tint = Color(0xFF9E9E9E)
                        )
                    }
                }
                
                // Dropdown Menu
                DropdownMenu(
                    expanded = isDropdownExpanded,
                    onDismissRequest = { isDropdownExpanded = false },
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White, RoundedCornerShape(12.dp))
                ) {
                    // Option untuk "Semua Pintu"
                    DropdownMenuItem(
                        text = {
                            Text(
                                text = "Semua Pintu",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    color = if (uiState.selectedDoorId == null) Color(0xFF6C63FF) else Color(0xFF1A1A1A),
                                    fontWeight = if (uiState.selectedDoorId == null) FontWeight.Bold else FontWeight.Normal
                                )
                            )
                        },
                        onClick = {
                            viewModel.handleEvent(AnalyticsEvent.SelectDoor(null, "Semua Pintu"))
                            val tzUtc = java.util.TimeZone.getTimeZone("UTC")
                            val fmt = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.getDefault()).apply { timeZone = tzUtc }
                            val cal = java.util.Calendar.getInstance()
                            val startIso = when (selectedTimePeriod) {
                                "Hari Ini" -> {
                                    cal.set(java.util.Calendar.HOUR_OF_DAY, 0)
                                    cal.set(java.util.Calendar.MINUTE, 0)
                                    cal.set(java.util.Calendar.SECOND, 0)
                                    cal.set(java.util.Calendar.MILLISECOND, 0)
                                    fmt.format(cal.time)
                                }
                                "Minggu Ini" -> {
                                    cal.firstDayOfWeek = java.util.Calendar.MONDAY
                                    while (cal.get(java.util.Calendar.DAY_OF_WEEK) != java.util.Calendar.MONDAY) {
                                        cal.add(java.util.Calendar.DAY_OF_YEAR, -1)
                                    }
                                    cal.set(java.util.Calendar.HOUR_OF_DAY, 0)
                                    cal.set(java.util.Calendar.MINUTE, 0)
                                    cal.set(java.util.Calendar.SECOND, 0)
                                    cal.set(java.util.Calendar.MILLISECOND, 0)
                                    fmt.format(cal.time)
                                }
                                else -> {
                                    cal.set(java.util.Calendar.DAY_OF_MONTH, 1)
                                    cal.set(java.util.Calendar.HOUR_OF_DAY, 0)
                                    cal.set(java.util.Calendar.MINUTE, 0)
                                    cal.set(java.util.Calendar.SECOND, 0)
                                    cal.set(java.util.Calendar.MILLISECOND, 0)
                                    fmt.format(cal.time)
                                }
                            }
                            val endIso = when (selectedTimePeriod) {
                                "Hari Ini" -> {
                                    val endCal = java.util.Calendar.getInstance().apply {
                                        timeInMillis = cal.timeInMillis
                                        add(java.util.Calendar.DAY_OF_YEAR, 1)
                                    }
                                    fmt.format(endCal.time)
                                }
                                "Minggu Ini" -> {
                                    val endCal = java.util.Calendar.getInstance().apply {
                                        timeInMillis = cal.timeInMillis
                                        add(java.util.Calendar.DAY_OF_YEAR, 7)
                                    }
                                    fmt.format(endCal.time)
                                }
                                else -> {
                                    val endCal = java.util.Calendar.getInstance().apply {
                                        timeInMillis = cal.timeInMillis
                                        add(java.util.Calendar.MONTH, 1)
                                    }
                                    fmt.format(endCal.time)
                                }
                            }
                            viewModel.handleEvent(AnalyticsEvent.FilterByDateRange(startIso, endIso))
                            isDropdownExpanded = false
                        }
                    )
                    
                    // Options untuk setiap pintu yang tersedia
                    uiState.availableDoors.forEach { door ->
                        DropdownMenuItem(
                            text = {
                                Text(
                                    text = door.name,
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        color = if (uiState.selectedDoorId == door.id) Color(0xFF6C63FF) else Color(0xFF1A1A1A),
                                        fontWeight = if (uiState.selectedDoorId == door.id) FontWeight.Bold else FontWeight.Normal
                                    )
                                )
                            },
                            onClick = {
                                viewModel.handleEvent(AnalyticsEvent.SelectDoor(door.id, door.name))
                                val tzUtc = java.util.TimeZone.getTimeZone("UTC")
                                val fmt = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.getDefault()).apply { timeZone = tzUtc }
                                val cal = java.util.Calendar.getInstance()
                                val startIso = when (selectedTimePeriod) {
                                    "Hari Ini" -> {
                                        cal.set(java.util.Calendar.HOUR_OF_DAY, 0)
                                        cal.set(java.util.Calendar.MINUTE, 0)
                                        cal.set(java.util.Calendar.SECOND, 0)
                                        cal.set(java.util.Calendar.MILLISECOND, 0)
                                        fmt.format(cal.time)
                                    }
                                    "Minggu Ini" -> {
                                        cal.firstDayOfWeek = java.util.Calendar.MONDAY
                                        while (cal.get(java.util.Calendar.DAY_OF_WEEK) != java.util.Calendar.MONDAY) {
                                            cal.add(java.util.Calendar.DAY_OF_YEAR, -1)
                                        }
                                        cal.set(java.util.Calendar.HOUR_OF_DAY, 0)
                                        cal.set(java.util.Calendar.MINUTE, 0)
                                        cal.set(java.util.Calendar.SECOND, 0)
                                        cal.set(java.util.Calendar.MILLISECOND, 0)
                                        fmt.format(cal.time)
                                    }
                                    else -> {
                                        cal.set(java.util.Calendar.DAY_OF_MONTH, 1)
                                        cal.set(java.util.Calendar.HOUR_OF_DAY, 0)
                                        cal.set(java.util.Calendar.MINUTE, 0)
                                        cal.set(java.util.Calendar.SECOND, 0)
                                        cal.set(java.util.Calendar.MILLISECOND, 0)
                                        fmt.format(cal.time)
                                    }
                                }
                                val endIso = when (selectedTimePeriod) {
                                    "Hari Ini" -> {
                                        val endCal = java.util.Calendar.getInstance().apply {
                                            timeInMillis = cal.timeInMillis
                                            add(java.util.Calendar.DAY_OF_YEAR, 1)
                                        }
                                        fmt.format(endCal.time)
                                    }
                                    "Minggu Ini" -> {
                                        val endCal = java.util.Calendar.getInstance().apply {
                                            timeInMillis = cal.timeInMillis
                                            add(java.util.Calendar.DAY_OF_YEAR, 7)
                                        }
                                        fmt.format(endCal.time)
                                    }
                                    else -> {
                                        val endCal = java.util.Calendar.getInstance().apply {
                                            timeInMillis = cal.timeInMillis
                                            add(java.util.Calendar.MONTH, 1)
                                        }
                                        fmt.format(endCal.time)
                                    }
                                }
                                viewModel.handleEvent(AnalyticsEvent.FilterByDateRange(startIso, endIso))
                                isDropdownExpanded = false
                            }
                        )
                    }
                }
            }

            Spacer(Modifier.height(20.dp))

            // Metrics Cards
            uiState.analyticsData?.let { data ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Total Akses Card
                    MetricCard(
                        title = "Total Akses",
                        value = data.metrics.totalAccess.value.toString(),
                        change = data.metrics.totalAccess.change,
                        icon = Icons.Default.TrendingUp,
                        iconColor = Color(0xFF9C27B0),
                        modifier = Modifier.weight(1f)
                    )
                    
                    // Akses Ditolak Card
                    MetricCard(
                        title = "Akses Ditolak",
                        value = data.metrics.deniedAccess.value.toString(),
                        change = data.metrics.deniedAccess.change,
                        icon = Icons.Default.Block,
                        iconColor = Color(0xFFFF5252),
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Pintu Di Kunci Card
                    MetricCard(
                        title = "Pintu Di Kunci",
                        value = data.metrics.lockedDoors.value.toString(),
                        change = data.metrics.lockedDoors.change,
                        icon = Icons.Default.Lock,
                        iconColor = Color(0xFF9C27B0),
                        modifier = Modifier.weight(1f)
                    )
                    
                    // Pintu Dibuka Card
                    MetricCard(
                        title = "Pintu Dibuka",
                        value = data.metrics.openedDoors.value.toString(),
                        change = data.metrics.openedDoors.change,
                        icon = Icons.Default.LockOpen,
                        iconColor = Color(0xFF4CAF50),
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            Spacer(Modifier.height(24.dp))

            // Aktivitas Akses Section
            Text(
                text = "Aktivitas Akses",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1A1A1A),
                    fontSize = 18.sp
                )
            )

            Spacer(Modifier.height(12.dp))

            // Time Period Tabs
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val timePeriods = listOf("Hari Ini", "Minggu Ini", "Bulan Ini")
                timePeriods.forEach { period ->
                    TimePeriodTab(
                        text = period,
                        isSelected = selectedTimePeriod == period,
                        onClick = {
                            selectedTimePeriod = period
                            val tzUtc = java.util.TimeZone.getTimeZone("UTC")
                            val fmt = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.getDefault()).apply { timeZone = tzUtc }
                            val cal = java.util.Calendar.getInstance() // local timezone for logical period boundaries
                            val startIso = when (period) {
                                "Hari Ini" -> {
                                    cal.timeInMillis = System.currentTimeMillis()
                                    cal.set(java.util.Calendar.HOUR_OF_DAY, 0)
                                    cal.set(java.util.Calendar.MINUTE, 0)
                                    cal.set(java.util.Calendar.SECOND, 0)
                                    cal.set(java.util.Calendar.MILLISECOND, 0)
                                    fmt.format(cal.time)
                                }
                                "Minggu Ini" -> {
                                    cal.timeInMillis = System.currentTimeMillis()
                                    cal.firstDayOfWeek = java.util.Calendar.MONDAY
                                    while (cal.get(java.util.Calendar.DAY_OF_WEEK) != java.util.Calendar.MONDAY) {
                                        cal.add(java.util.Calendar.DAY_OF_YEAR, -1)
                                    }
                                    cal.set(java.util.Calendar.HOUR_OF_DAY, 0)
                                    cal.set(java.util.Calendar.MINUTE, 0)
                                    cal.set(java.util.Calendar.SECOND, 0)
                                    cal.set(java.util.Calendar.MILLISECOND, 0)
                                    fmt.format(cal.time)
                                }
                                else -> { // Bulan Ini
                                    cal.timeInMillis = System.currentTimeMillis()
                                    cal.set(java.util.Calendar.DAY_OF_MONTH, 1)
                                    cal.set(java.util.Calendar.HOUR_OF_DAY, 0)
                                    cal.set(java.util.Calendar.MINUTE, 0)
                                    cal.set(java.util.Calendar.SECOND, 0)
                                    cal.set(java.util.Calendar.MILLISECOND, 0)
                                    fmt.format(cal.time)
                                }
                            }
                            val endIso = when (period) {
                                "Hari Ini" -> {
                                    val endCal = java.util.Calendar.getInstance().apply {
                                        timeInMillis = cal.timeInMillis
                                        add(java.util.Calendar.DAY_OF_YEAR, 1)
                                    }
                                    fmt.format(endCal.time)
                                }
                                "Minggu Ini" -> {
                                    val endCal = java.util.Calendar.getInstance().apply {
                                        timeInMillis = cal.timeInMillis
                                        add(java.util.Calendar.DAY_OF_YEAR, 7)
                                    }
                                    fmt.format(endCal.time)
                                }
                                else -> {
                                    val endCal = java.util.Calendar.getInstance().apply {
                                        timeInMillis = cal.timeInMillis
                                        add(java.util.Calendar.MONTH, 1)
                                    }
                                    fmt.format(endCal.time)
                                }
                            }
                            viewModel.handleEvent(AnalyticsEvent.FilterByDateRange(startIso, endIso))
                        },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // Activity Chart
            uiState.analyticsData?.let { data ->
                val chartData = remember(selectedTimePeriod, data) {
                    when (selectedTimePeriod) {
                        "Hari Ini" -> ChartDataGenerator.generateDailyData(data.accessLogs ?: emptyList())
                        "Minggu Ini" -> ChartDataGenerator.generateWeeklyData(data.accessLogs ?: emptyList())
                        "Bulan Ini" -> ChartDataGenerator.generateMonthlyData(data.accessLogs ?: emptyList())
                        else -> ChartDataGenerator.generateDailyData(data.accessLogs ?: emptyList())
                    }
                }
                
                AnalyticsChart(
                    chartData = chartData,
                    modifier = Modifier.fillMaxWidth()
                )
            } ?: run {
                // Fallback chart when no data
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                Icons.Default.BarChart,
                                contentDescription = "Chart",
                                tint = Color(0xFF6C63FF),
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(Modifier.height(8.dp))
                            Text(
                                text = "Area Chart",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    color = Color(0xFF6B6B6B)
                                )
                            )
                            Text(
                                text = "Loading chart data...",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = Color(0xFF9E9E9E)
                                )
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.height(16.dp))
            }
        }

        // Error message
        uiState.errorMessage?.let { errorMessage ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFE60023)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = errorMessage,
                        color = Color.White,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun MetricCard(
    title: String,
    value: String,
    change: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = value,
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1A1A1A),
                        fontSize = 24.sp
                    )
                )
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(iconColor),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            
            Spacer(Modifier.height(8.dp))
            
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = Color(0xFF6B6B6B),
                    fontSize = 14.sp
                )
            )
            
            Spacer(Modifier.height(4.dp))
            
            Text(
                text = change,
                style = MaterialTheme.typography.bodySmall.copy(
                    color = if (change.startsWith("+")) Color(0xFF4CAF50) else Color(0xFFFF5252),
                    fontSize = 12.sp
                )
            )
        }
    }
}

@Composable
private fun TimePeriodTab(
    text: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) Color(0xFF6C63FF) else Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isSelected) 4.dp else 2.dp)
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.bodyMedium.copy(
                color = if (isSelected) Color.White else Color(0xFF6B6B6B),
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                fontSize = 14.sp
            ),
            modifier = Modifier.padding(vertical = 12.dp, horizontal = 16.dp)
        )
    }
}

@Preview(showBackground = true, backgroundColor = 0xFFF7F6FF)
@Composable
private fun AnalyticsScreenPreview() {
    AnalyticsScreen()
}
