package com.authentic.smartdoor.dashboard.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.authentic.smartdoor.dashboard.presentation.AnalyticsEvent
import com.authentic.smartdoor.dashboard.presentation.AnalyticsViewModel
import com.authentic.smartdoor.dashboard.ui.components.BottomBar
import com.authentic.smartdoor.dashboard.ui.DashboardScreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsScreen(
    modifier: Modifier = Modifier,
    onBackClick: () -> Unit = {},
    onNavigateToHome: () -> Unit = {},
    onNavigateToAccessHistory: () -> Unit = {},
    onNavigateToNotifications: () -> Unit = {},
    viewModel: AnalyticsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTab by remember { mutableStateOf("Harian") }

    LaunchedEffect(Unit) {
        viewModel.handleEvent(AnalyticsEvent.LoadAnalyticsData())
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
                modifier = Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Color(0xFF6C63FF))
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFF7F6FF))
                    .padding(horizontal = 20.dp)
                    .padding(padding),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                item {
                    Spacer(Modifier.height(8.dp))
                }

                // Summary Cards
                uiState.analyticsData?.let { data ->
                    item {
                        SummaryCardsSection(summary = data.summary)
                    }

                    // Access Activity Section
                    item {
                        AccessActivitySection(
                            dailyData = data.dailyActivity,
                            weeklyData = data.weeklyActivity,
                            monthlyData = data.monthlyActivity,
                            selectedTab = selectedTab,
                            onTabSelected = { selectedTab = it }
                        )
                    }

                    // Active Hours Section
                    item {
                        ActiveHoursSection(activeHours = data.activeHours)
                    }
                } ?: run {
                    // Fallback UI when no analytics data is available
                    item {
                        EmptyAnalyticsState(viewModel = viewModel)
                    }
                }

                item {
                    Spacer(Modifier.height(20.dp))
                }
            }
        }

        // Error message
        uiState.errorMessage?.let { errorMessage ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                contentAlignment = Alignment.BottomCenter
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
private fun SummaryCardsSection(
    summary: com.authentic.smartdoor.dashboard.domain.model.AnalyticsSummary
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Total Akses - Full width card
        SummaryCard(
            title = "Total Akses",
            value = summary.totalAccess.toString(),
            change = summary.totalAccessChange,
            icon = Icons.Default.Assessment,
            modifier = Modifier.fillMaxWidth()
        )

        // Second row - Akses Ditolak & Akses Diterima
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            SummaryCard(
                title = "Akses Ditolak",
                value = summary.accessDenied.toString(),
                change = summary.accessDeniedChange,
                icon = Icons.Default.Assessment,
                modifier = Modifier.weight(1f)
            )
            SummaryCard(
                title = "Akses Diterima",
                value = summary.accessAccepted.toString(),
                change = summary.accessAcceptedChange,
                icon = Icons.Default.Assessment,
                modifier = Modifier.weight(1f)
            )
        }
        
        // Third row - Pintu Dibuka & Pintu Ditutup
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            SummaryCard(
                title = "Pintu Dibuka",
                value = summary.doorsOpened.toString(),
                change = summary.doorsOpenedChange,
                icon = Icons.Default.Assessment,
                modifier = Modifier.weight(1f)
            )
            SummaryCard(
                title = "Pintu Ditutup",
                value = summary.doorsClosed.toString(),
                change = summary.doorsClosedChange,
                icon = Icons.Default.Assessment,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun SummaryCard(
    title: String,
    value: String,
    change: String,
    icon: ImageVector,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = value,
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1A1A1A),
                            fontSize = 24.sp
                        )
                    )
                    Spacer(Modifier.height(4.dp))
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
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    )
                }

                // Icon
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFE8E6FF)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = Color(0xFF6C63FF),
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun AccessActivitySection(
    dailyData: List<com.authentic.smartdoor.dashboard.domain.model.AccessActivityData>,
    weeklyData: List<com.authentic.smartdoor.dashboard.domain.model.AccessActivityData>,
    monthlyData: List<com.authentic.smartdoor.dashboard.domain.model.AccessActivityData>,
    selectedTab: String,
    onTabSelected: (String) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            Text(
                text = "Aktivitas Akses",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1A1A1A),
                    fontSize = 18.sp
                )
            )

            Spacer(Modifier.height(16.dp))

            // Tabs
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val tabs = listOf("Harian", "Mingguan", "Bulanan")
                tabs.forEach { tab ->
                    TabButton(
                        text = tab,
                        isSelected = selectedTab == tab,
                        onClick = { onTabSelected(tab) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            Spacer(Modifier.height(20.dp))

            // Chart placeholder
            val currentData = when (selectedTab) {
                "Harian" -> dailyData
                "Mingguan" -> weeklyData
                "Bulanan" -> monthlyData
                else -> dailyData
            }

            AccessActivityChart(data = currentData)
        }
    }
}

@Composable
private fun TabButton(
    text: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(
                if (isSelected) Color(0xFF6C63FF).copy(alpha = 0.1f) else Color.Transparent
            )
            .clickable { onClick() }
            .padding(vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.bodyMedium.copy(
                color = if (isSelected) Color(0xFF6C63FF) else Color(0xFF6B6B6B),
                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                fontSize = 14.sp
            )
        )
    }
}

@Composable
private fun AccessActivityChart(
    data: List<com.authentic.smartdoor.dashboard.domain.model.AccessActivityData>
) {
    // Simple chart representation
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .height(200.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFFF8F9FA))
            .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Y-axis labels
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            repeat(5) { index ->
                Text(
                    text = "${(index * 4)}",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = Color(0xFF9E9E9E),
                        fontSize = 10.sp
                    )
                )
            }
        }

        // Chart area
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .clip(RoundedCornerShape(8.dp))
                .background(Color(0xFFE8E6FF)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Chart Area\n${data.size} data points",
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = Color(0xFF6C63FF),
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            )
        }

        // X-axis labels
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            data.forEach { item ->
                Text(
                    text = item.timeLabel,
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = Color(0xFF9E9E9E),
                        fontSize = 10.sp
                    )
                )
            }
        }
    }
}

@Composable
private fun ActiveHoursSection(
    activeHours: List<com.authentic.smartdoor.dashboard.domain.model.ActiveHourData>
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Timer,
                    contentDescription = null,
                    tint = Color(0xFF6C63FF),
                    modifier = Modifier.size(20.dp)
                )
                Text(
                    text = "Jam Aktif",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1A1A1A),
                        fontSize = 18.sp
                    )
                )
            }

            Spacer(Modifier.height(16.dp))

            // Active hours bars
            activeHours.forEach { hourData ->
                ActiveHourBar(
                    timeRange = hourData.timeRange,
                    count = hourData.count,
                    modifier = Modifier.fillMaxWidth()
                )
                if (hourData != activeHours.last()) {
                    Spacer(Modifier.height(12.dp))
                }
            }
        }
    }
}

@Composable
private fun ActiveHourBar(
    timeRange: String,
    count: Int,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = timeRange,
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = Color(0xFF1A1A1A),
                    fontSize = 14.sp
                )
            )
            Text(
                text = count.toString(),
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = Color(0xFF1A1A1A),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
            )
        }

        Spacer(Modifier.height(8.dp))

        // Bar
        val maxCount = 50 // Maximum count for scaling
        val barWidth = (count.toFloat() / maxCount).coerceIn(0f, 1f)
        
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(Color(0xFFE8E6FF))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(barWidth)
                    .background(Color(0xFF6C63FF))
            )
        }
    }
}

@Composable
private fun EmptyAnalyticsState(
    viewModel: AnalyticsViewModel
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(40.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Empty state icon
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(40.dp))
                    .background(Color(0xFFE8E6FF)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.BarChart,
                    contentDescription = null,
                    tint = Color(0xFF6C63FF).copy(alpha = 0.6f),
                    modifier = Modifier.size(40.dp)
                )
            }

            Spacer(Modifier.height(24.dp))

            Text(
                text = "Belum Ada Data Analitik",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1A1A1A),
                    fontSize = 18.sp
                ),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )

            Spacer(Modifier.height(8.dp))

            Text(
                text = "Data analitik akan tersedia setelah ada aktivitas akses pintu. Silakan coba lagi nanti.",
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = Color(0xFF6B6B6B),
                    fontSize = 14.sp
                ),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )

            Spacer(Modifier.height(24.dp))

            // Refresh button
            Button(
                onClick = { 
                    viewModel.handleEvent(AnalyticsEvent.LoadAnalyticsData())
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF6C63FF),
                    contentColor = Color.White
                )
            ) {
                Text(
                    text = "Refresh",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFFF7F6FF)
@Composable
private fun AnalyticsScreenPreview() {
    AnalyticsScreen()
}
