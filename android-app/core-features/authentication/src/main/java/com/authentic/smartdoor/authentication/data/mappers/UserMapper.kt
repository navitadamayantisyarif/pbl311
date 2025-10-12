package com.authentic.smartdoor.authentication.data.mappers

import com.authentic.smartdoor.authentication.data.local.entities.UserEntity
import com.authentic.smartdoor.authentication.data.remote.dto.UserDto
import com.authentic.smartdoor.authentication.domain.model.User
import com.authentic.smartdoor.authentication.domain.model.UserRole
import java.text.SimpleDateFormat
import java.util.*

object UserMapper {
    fun UserDto.toEntity(): UserEntity {
        // Parse created_at string to timestamp
        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        val createdAtTimestamp = try {
            dateFormat.parse(created_at)?.time ?: System.currentTimeMillis()
        } catch (e: Exception) {
            System.currentTimeMillis()
        }
        
        return UserEntity(
            id = id,
            googleId = id, // Use id as googleId for mock API
            email = email,
            name = name,
            role = role,
            faceData = null, // Mock API doesn't have face data in user response
            createdAt = createdAtTimestamp,
            updatedAt = System.currentTimeMillis()
        )
    }

    fun UserEntity.toDomain(): User {
        val roleEnum = when (role.lowercase()) {
            "admin" -> UserRole.admin
            "user" -> UserRole.user
            else -> UserRole.user
        }
        return User(
            id = id,
            googleId = googleId,
            email = email,
            name = name,
            role = roleEnum,
            faceData = faceData,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }

    fun User.toEntity(): UserEntity {
        return UserEntity(
            id = id,
            googleId = googleId,
            email = email,
            name = name,
            role = role.name,
            faceData = faceData,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
}
