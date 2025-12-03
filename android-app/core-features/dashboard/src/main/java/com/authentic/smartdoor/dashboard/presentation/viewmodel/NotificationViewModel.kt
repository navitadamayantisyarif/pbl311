package com.authentic.smartdoor.dashboard.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.authentic.smartdoor.dashboard.domain.model.Notification
import com.authentic.smartdoor.dashboard.domain.repository.DashboardRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class NotificationViewModel @Inject constructor(
    private val dashboardRepository: DashboardRepository,
    private val networkMonitor: com.authentic.smartdoor.storage.network.NetworkMonitor
) : ViewModel() {

    private val _uiState = MutableStateFlow(NotificationUiState())
    val uiState: StateFlow<NotificationUiState> = _uiState.asStateFlow()

    private val _notifications = MutableStateFlow<List<Notification>>(emptyList())
    val notifications: StateFlow<List<Notification>> = _notifications.asStateFlow()

    init {
        loadNotifications()
    }

    private fun loadNotifications() {
        viewModelScope.launch {
            val showLoading = networkMonitor.isOnline()
            _uiState.value = _uiState.value.copy(isLoading = showLoading, error = null)
            
            dashboardRepository.refreshNotifications()
                .onSuccess { notifications ->
                    _notifications.value = notifications
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Failed to load notifications"
                    )
                }
        }
    }

    fun markNotificationAsRead(notificationIds: List<String>) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = networkMonitor.isOnline(), error = null)
            
            dashboardRepository.markNotificationsAsRead(notificationIds)
                .onSuccess {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                    // Refresh notifications after marking as read
                    loadNotifications()
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Failed to mark notifications as read"
                    )
                }
        }
    }

    fun refreshNotifications() {
        loadNotifications()
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}

data class NotificationUiState(
    val isLoading: Boolean = false,
    val error: String? = null
)
