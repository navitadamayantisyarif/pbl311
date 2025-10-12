package com.authentic.smartdoor.authentication.data.remote.dto

data class RegisterUserRequest(
    val googleId: String,
    val email: String,
    val name: String,
    val role: String? = null,
    val faceData: String? = null
)