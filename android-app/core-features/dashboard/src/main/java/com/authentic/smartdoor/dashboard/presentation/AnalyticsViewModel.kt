package com.authentic.smartdoor.dashboard.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.authentic.smartdoor.dashboard.data.repository.AnalyticsRepository
import com.authentic.smartdoor.dashboard.domain.model.AnalyticsData
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AnalyticsViewModel @Inject constructor(
    private val analyticsRepository: AnalyticsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AnalyticsUiState())
    val uiState: StateFlow<AnalyticsUiState> = _uiState.asStateFlow()

    fun handleEvent(event: AnalyticsEvent) {
        when (event) {
            is AnalyticsEvent.LoadAnalyticsData -> {
                loadAnalyticsData(event.period)
            }
            is AnalyticsEvent.ChangePeriod -> {
                loadAnalyticsData(event.period)
            }
        }
    }

    private fun loadAnalyticsData(period: String = "7d") {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            
            analyticsRepository.getAnalyticsData(period)
                .onSuccess { analyticsData ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        analyticsData = analyticsData,
                        selectedPeriod = period
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = error.message ?: "Failed to load analytics data"
                    )
                }
        }
    }
}

data class AnalyticsUiState(
    val isLoading: Boolean = false,
    val analyticsData: AnalyticsData? = null,
    val selectedPeriod: String = "7d",
    val errorMessage: String? = null
)

sealed class AnalyticsEvent {
    data class LoadAnalyticsData(val period: String = "7d") : AnalyticsEvent()
    data class ChangePeriod(val period: String) : AnalyticsEvent()
}
