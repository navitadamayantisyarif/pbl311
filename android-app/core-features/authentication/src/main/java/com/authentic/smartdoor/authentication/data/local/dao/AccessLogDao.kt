package com.authentic.smartdoor.authentication.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.authentic.smartdoor.authentication.data.local.entities.AccessLogEntity

@Dao
interface AccessLogDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLog(log: AccessLogEntity)

    @Query("SELECT * FROM access_logs WHERE user_id = :userId ORDER BY timestamp DESC")
    suspend fun getLogsForUser(userId: String): List<AccessLogEntity>

    @Query("DELETE FROM access_logs")
    suspend fun clear()
}