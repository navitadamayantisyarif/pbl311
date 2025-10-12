package com.authentic.smartdoor.authentication.data.remote

import com.authentic.smartdoor.authentication.data.remote.dto.GoogleAuthRequest
import com.authentic.smartdoor.authentication.data.remote.dto.GoogleAuthResponse
import com.authentic.smartdoor.authentication.data.remote.dto.UserResponse
import com.authentic.smartdoor.authentication.data.remote.dto.RefreshTokenRequest
import com.authentic.smartdoor.authentication.data.remote.dto.RefreshTokenResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.Response

interface AuthApiService {
    @POST("auth/google")
    suspend fun authenticateWithGoogle(
        @Body request: GoogleAuthRequest
    ): Response<GoogleAuthResponse>

    @POST("auth/refresh")
    suspend fun refreshToken(
        @Body request: RefreshTokenRequest
    ): Response<RefreshTokenResponse>

    @POST("auth/logout")
    suspend fun logout(): Response<Map<String, Any>>

    @GET("auth/me")
    suspend fun getUserProfile(
        @Header("Authorization") token: String
    ): Response<UserResponse>
}