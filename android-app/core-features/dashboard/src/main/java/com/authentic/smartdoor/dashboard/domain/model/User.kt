package com.authentic.smartdoor.dashboard.domain.model

data class User(
    val id: String,
    val name: String,
    val email: String,
    val role: String,
    val faceRegistered: Boolean,
    val avatar: String?,
    val phone: String?,
    val createdAt: Long
)
