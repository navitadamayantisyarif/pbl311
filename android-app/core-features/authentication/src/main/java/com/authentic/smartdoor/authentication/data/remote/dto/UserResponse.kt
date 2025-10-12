package com.authentic.smartdoor.authentication.data.remote.dto

data class UserResponse(
    val success: Boolean,
    val data: UserDto?,
    val message: String?
)


