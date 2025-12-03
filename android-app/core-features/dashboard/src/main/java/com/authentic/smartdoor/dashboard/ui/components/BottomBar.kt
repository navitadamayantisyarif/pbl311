package com.authentic.smartdoor.dashboard.ui.components

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.*
import androidx.compose.ui.unit.dp
import com.authentic.smartdoor.dashboard.ui.DashboardScreen
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.drawscope.clipPath

@Composable
fun BottomBar(
    onHomeClick: () -> Unit,
    onAccessHistoryClick: () -> Unit,
    onNotificationsClick: () -> Unit,
    onAnalyticsClick: () -> Unit,
    currentScreen: DashboardScreen = DashboardScreen.Home
) {
    val barColor = MaterialTheme.colorScheme.primary

    val selectedIndex = when (currentScreen) {
        is DashboardScreen.Home -> 0
        is DashboardScreen.AccessHistory -> 1
        is DashboardScreen.Notifications -> 2
        is DashboardScreen.Analytics -> 3
        else -> 0
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(75.dp)
    ) {
        // Background bar dengan cutout
        androidx.compose.foundation.Canvas(
            modifier = Modifier
                .fillMaxSize()
                .shadow(8.dp)
        ) {
            val width = size.width
            val height = size.height

            // Hitung posisi cutout berdasarkan item yang dipilih
            val sectionWidth = width / 4f
            val cutoutCenterX = sectionWidth * (selectedIndex + 0.5f)
            val cutoutRadius = 35.dp.toPx()
            val curveControl = 20.dp.toPx()

            val path = Path().apply {
                // Mulai dari kiri atas
                moveTo(0f, 0f)

                // Garis horizontal ke sebelum cutout
                lineTo(cutoutCenterX - cutoutRadius - curveControl, 0f)

                // Kurva kiri - smooth transition ke cutout
                quadraticBezierTo(
                    x1 = cutoutCenterX - cutoutRadius,
                    y1 = 0f,
                    x2 = cutoutCenterX - cutoutRadius * 0.55f,
                    y2 = -cutoutRadius * 0.4f
                )

                // Kurva atas - semicircle cutout
                quadraticBezierTo(
                    x1 = cutoutCenterX,
                    y1 = -cutoutRadius * 0.85f,
                    x2 = cutoutCenterX + cutoutRadius * 0.55f,
                    y2 = -cutoutRadius * 0.4f
                )

                // Kurva kanan - smooth transition kembali
                quadraticBezierTo(
                    x1 = cutoutCenterX + cutoutRadius,
                    y1 = 0f,
                    x2 = cutoutCenterX + cutoutRadius + curveControl,
                    y2 = 0f
                )

                // Garis horizontal ke kanan
                lineTo(width, 0f)

                // Sisi kanan, bawah, dan kiri
                lineTo(width, height)
                lineTo(0f, height)
                lineTo(0f, 0f)

                close()
            }

            drawPath(
                path = path,
                color = barColor
            )
        }

        // Navigation items
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight()
                .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            NavItem(
                icon = Icons.Default.Home,
                isSelected = selectedIndex == 0,
                onClick = onHomeClick,
                contentDescription = "Home",
                barColor = barColor
            )

            NavItem(
                icon = Icons.Default.Timer,
                isSelected = selectedIndex == 1,
                onClick = onAccessHistoryClick,
                contentDescription = "Access History",
                barColor = barColor
            )

            NavItem(
                icon = Icons.Default.Notifications,
                isSelected = selectedIndex == 2,
                onClick = onNotificationsClick,
                contentDescription = "Notifications",
                barColor = barColor
            )

            NavItem(
                icon = Icons.Default.BarChart,
                isSelected = selectedIndex == 3,
                onClick = onAnalyticsClick,
                contentDescription = "Analytics",
                barColor = barColor
            )
        }
    }
}

@Composable
private fun NavItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isSelected: Boolean,
    onClick: () -> Unit,
    contentDescription: String,
    barColor: Color
) {
    val offsetY by animateDpAsState(
        targetValue = if (isSelected) (-30).dp else 0.dp,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "offsetY"
    )

    val bubbleSize by animateDpAsState(
        targetValue = if (isSelected) 58.dp else 48.dp,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessMedium
        ),
        label = "bubbleSize"
    )

    val iconSize by animateDpAsState(
        targetValue = if (isSelected) 32.dp else 28.dp,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessMedium
        ),
        label = "iconSize"
    )

    Box(
        modifier = Modifier
            .size(65.dp)
            .offset(y = offsetY),
        contentAlignment = Alignment.Center
    ) {
        if (isSelected) {
            // Outer circle dengan warna navbar (ungu)
            Box(
                modifier = Modifier
                    .size(bubbleSize + 8.dp)
                    .shadow(
                        elevation = 12.dp,
                        shape = CircleShape,
                        clip = false
                    )
                    .clip(CircleShape)
                    .background(barColor),
                contentAlignment = Alignment.Center
            ) {
                // Inner circle putih
                Box(
                    modifier = Modifier
                        .size(bubbleSize)
                        .clip(CircleShape)
                        .background(Color.White),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = contentDescription,
                        tint = barColor,
                        modifier = Modifier.size(iconSize)
                    )
                }
            }
        } else {
            // Item tidak terpilih
            IconButton(
                onClick = onClick,
                modifier = Modifier.size(bubbleSize)
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = contentDescription,
                    tint = Color.White.copy(alpha = 0.65f),
                    modifier = Modifier.size(iconSize)
                )
            }
        }
    }
}