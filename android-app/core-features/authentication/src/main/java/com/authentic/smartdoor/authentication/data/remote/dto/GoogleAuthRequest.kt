package com.authentic.smartdoor.authentication.data.remote.dto

data class GoogleAuthRequest(
    val id_token: String,
    val email: String? = null,
    val name: String? = null,
    val picture: String? = null
)

data class GoogleAuthResponse(
    val success: Boolean,
    val message: String?,
    val data: AuthData?
)

data class AuthData(
    val user: UserDto,
    val tokens: TokenData
)

data class TokenData(
    val access_token: String,
    val refresh_token: String,
    val token_type: String,
    val expires_in: Int
)

data class UserDto(
    val id: String,
    val name: String,
    val email: String,
    val role: String,
    val face_registered: Boolean,
    val avatar: String?,
    val created_at: String
)
