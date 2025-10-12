package com.authentic.smartdoor.authentication.data.remote.dto

data class RefreshTokenRequest(
    val refresh_token: String
)

data class RefreshTokenResponse(
    val success: Boolean,
    val data: RefreshTokenData?,
    val message: String?
)

data class RefreshTokenData(
    val access_token: String,
    val token_type: String,
    val expires_in: Int
)
