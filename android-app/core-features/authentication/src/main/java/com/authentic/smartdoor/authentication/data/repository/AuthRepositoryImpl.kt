package com.authentic.smartdoor.authentication.data.repository

import com.authentic.smartdoor.authentication.data.local.dao.UserDao
import com.authentic.smartdoor.authentication.data.local.dao.AccessLogDao
import com.authentic.smartdoor.authentication.data.local.entities.AccessLogEntity
import com.authentic.smartdoor.authentication.data.local.entities.UserEntity
import com.authentic.smartdoor.authentication.data.mappers.UserMapper.toDomain
import com.authentic.smartdoor.authentication.data.mappers.UserMapper.toEntity
import com.authentic.smartdoor.authentication.data.remote.AuthApiService
import com.authentic.smartdoor.authentication.data.remote.dto.GoogleAuthRequest
import com.authentic.smartdoor.authentication.data.remote.dto.UserDto
import com.authentic.smartdoor.authentication.domain.model.User
import com.authentic.smartdoor.authentication.domain.model.UserRole
import com.authentic.smartdoor.authentication.domain.repository.AuthRepository
import com.authentic.smartdoor.authentication.utils.PreferencesManager
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import java.util.UUID
import javax.inject.Inject

class AuthRepositoryImpl @Inject constructor(
    private val apiService: AuthApiService,
    private val userDao: UserDao,
    private val googleSignInClient: GoogleSignInClient,
    private val preferencesManager: PreferencesManager,
    private val accessLogDao: AccessLogDao
) : AuthRepository {

    override suspend fun signInWithGoogle(): Result<User> {
        return try {
            val signInIntent = googleSignInClient.signInIntent
            // This would be handled in the Activity/Fragment
            Result.failure(Exception("Use signInWithGoogleAccount for complete flow"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun handleGoogleSignInResult(account: GoogleSignInAccount): Result<User> {
        return try {
            val googleId = account.id
            val email = account.email
            val name = account.displayName
            val picture = account.photoUrl?.toString()

            if (googleId.isNullOrEmpty() || email.isNullOrEmpty()) {
                return Result.failure(Exception("Google account data is incomplete"))
            }

            // Create request for mock API
            val request = GoogleAuthRequest(
                id_token = "mock_id_token_${System.currentTimeMillis()}", // Mock ID token
                email = email,
                name = name,
                picture = picture
            )

            // Call mock API
            val response = apiService.authenticateWithGoogle(request)
            
            if (response.isSuccessful) {
                val authResponse = response.body()
                if (authResponse?.success == true && authResponse.data != null) {
                    val userDto = authResponse.data.user
                    val tokens = authResponse.data.tokens
                    
                    // Save user to local database
                    val userEntity = userDto.toEntity()
                    userDao.insertUser(userEntity)
                    
                    // Save tokens and user session
                    preferencesManager.saveAuthToken(tokens.access_token)
                    preferencesManager.saveRefreshToken(tokens.refresh_token)
                    preferencesManager.saveUserId(userEntity.id)
                    preferencesManager.setLoggedIn(true)
                    
                    // Access log (LOGIN success)
                    val log = AccessLogEntity(
                        id = UUID.randomUUID().toString(),
                        userId = userEntity.id,
                        action = "LOGIN",
                        timestamp = System.currentTimeMillis(),
                        success = true,
                        method = "GOOGLE_API",
                        ipAddress = "127.0.0.1"
                    )
                    accessLogDao.insertLog(log)
                    
                    return Result.success(userEntity.toDomain())
                } else {
                    return Result.failure(Exception(authResponse?.message ?: "Authentication failed"))
                }
            } else {
                val errorBody = response.errorBody()?.string() ?: "Unknown error"
                return Result.failure(Exception("API Error: ${response.code()} - $errorBody"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Google Sign-In failed: ${e.message}", e))
        }
    }

    override suspend fun getCurrentUser(): Result<User?> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token.isNullOrEmpty()) {
                Result.success(null)
            } else {
                // Try to get user from API first
                val response = apiService.getUserProfile("Bearer $token")
                if (response.isSuccessful) {
                    val userResponse = response.body()
                    if (userResponse?.success == true && userResponse.data != null) {
                        val userDto = userResponse.data
                        val userEntity = userDto.toEntity()
                        userDao.insertUser(userEntity)
                        return Result.success(userEntity.toDomain())
                    }
                }
                
                // If API fails, try to get from local database
                val userId = preferencesManager.getUserId()
                if (!userId.isNullOrEmpty()) {
                    val userEntity = userDao.getUserById(userId)
                    userEntity?.let {
                        return Result.success(it.toDomain())
                    }
                }
                
                Result.success(null)
            }
        } catch (e: Exception) {
            // If API fails, try to get from local database
            val userId = preferencesManager.getUserId()
            if (!userId.isNullOrEmpty()) {
                val userEntity = userDao.getUserById(userId)
                userEntity?.let {
                    return Result.success(it.toDomain())
                }
            }
            Result.failure(e)
        }
    }

    override suspend fun signOut(): Result<Unit> {
        return try {
            // Call logout API
            try {
                apiService.logout()
            } catch (e: Exception) {
                // Continue with local logout even if API fails
            }
            
            googleSignInClient.signOut()
            
            // Access log (LOGOUT)
            val currentUserId = preferencesManager.getUserId() ?: ""
            val log = AccessLogEntity(
                id = UUID.randomUUID().toString(),
                userId = currentUserId,
                action = "LOGOUT",
                timestamp = System.currentTimeMillis(),
                success = true,
                method = "GOOGLE_API",
                ipAddress = ""
            )
            accessLogDao.insertLog(log)

            preferencesManager.clearAuthData()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun isLoggedIn(): Boolean {
        return preferencesManager.isLoggedIn()
    }
}
