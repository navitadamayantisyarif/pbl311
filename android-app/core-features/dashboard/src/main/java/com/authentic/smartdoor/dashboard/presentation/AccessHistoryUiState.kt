package com.authentic.smartdoor.dashboard.presentation

import com.authentic.smartdoor.dashboard.domain.model.AccessLog

data class AccessHistoryUiState(
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val accessLogs: List<AccessLog> = emptyList(),
    val isRefreshing: Boolean = false
)

sealed class AccessHistoryEvent {
    object LoadAccessHistory : AccessHistoryEvent()
    object RefreshAccessHistory : AccessHistoryEvent()
    object ClearError : AccessHistoryEvent()
}
