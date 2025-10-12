package com.authentic.smartdoor.dashboard.domain.model

data class Door(
    val id: String,
    val name: String,
    val location: String,
    val locked: Boolean,
    val batteryLevel: Int,
    val lastUpdate: Long,
    val cameraActive: Boolean,
    val wifiStrength: Int,
    val temperature: Int,
    val humidity: Int,
    val firmwareVersion: String,
    val lastMaintenance: Long
)

data class DoorStatus(
    val locked: Boolean,
    val batteryLevel: Int,
    val lastUpdate: Long,
    val cameraActive: Boolean,
    val wifiStrength: Int,
    val temperature: Int,
    val humidity: Int,
    val firmwareVersion: String,
    val lastMaintenance: Long
)
