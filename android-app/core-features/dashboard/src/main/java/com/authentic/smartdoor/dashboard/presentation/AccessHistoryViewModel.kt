package com.authentic.smartdoor.dashboard.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.authentic.smartdoor.dashboard.domain.repository.DashboardRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AccessHistoryViewModel @Inject constructor(
    private val repository: DashboardRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AccessHistoryUiState())
    val uiState: StateFlow<AccessHistoryUiState> = _uiState.asStateFlow()

    fun handleEvent(event: AccessHistoryEvent) {
        when (event) {
            is AccessHistoryEvent.LoadAccessHistory -> loadAccessHistory()
            is AccessHistoryEvent.RefreshAccessHistory -> refreshAccessHistory()
            is AccessHistoryEvent.ClearError -> clearError()
        }
    }

    private fun loadAccessHistory() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            
            repository.getAccessHistory()
                .onSuccess { accessLogs ->
                    println("DEBUG: AccessHistory loaded successfully, count: ${accessLogs.size}")
                    if (accessLogs.isNotEmpty()) {
                        println("DEBUG: First access log - door: ${accessLogs[0].location}, action: ${accessLogs[0].action}")
                    }
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        accessLogs = accessLogs,
                        errorMessage = null
                    )
                }
                .onFailure { exception ->
                    println("DEBUG: AccessHistory failed: ${exception.message}")
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = "Gagal memuat riwayat akses: ${exception.message}"
                    )
                }
        }
    }

    private fun refreshAccessHistory() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isRefreshing = true, errorMessage = null)
            
            repository.getAccessHistory()
                .onSuccess { accessLogs ->
                    _uiState.value = _uiState.value.copy(
                        isRefreshing = false,
                        accessLogs = accessLogs,
                        errorMessage = null
                    )
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isRefreshing = false,
                        errorMessage = "Gagal memuat riwayat akses: ${exception.message}"
                    )
                }
        }
    }

    private fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
}
