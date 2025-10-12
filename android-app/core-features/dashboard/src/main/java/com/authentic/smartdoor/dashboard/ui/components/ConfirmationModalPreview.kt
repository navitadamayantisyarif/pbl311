package com.authentic.smartdoor.dashboard.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

@Preview(showBackground = true, backgroundColor = 0xFFF7F6FF)
@Composable
fun ConfirmationModalPreview() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF7F6FF))
            .padding(16.dp)
    ) {
        ConfirmationModal(
            isVisible = true,
            doorName = "Pintu A",
            action = "buka",
            onConfirm = { /* Preview action */ },
            onDismiss = { /* Preview action */ }
        )
    }
}

@Preview(showBackground = true, backgroundColor = 0xFFF7F6FF)
@Composable
fun ConfirmationModalLockPreview() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF7F6FF))
            .padding(16.dp)
    ) {
        ConfirmationModal(
            isVisible = true,
            doorName = "Pintu B",
            action = "tutup",
            onConfirm = { /* Preview action */ },
            onDismiss = { /* Preview action */ }
        )
    }
}
