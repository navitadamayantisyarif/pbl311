package com.authentic.smartdoor.camera.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import com.authentic.smartdoor.storage.remote.datasource.CameraRemoteDataSource

data class CameraUiState(
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val doorId: Int? = null,
    val streamUrl: String? = null
)

@HiltViewModel
class CameraViewModel @Inject constructor(
    private val remote: CameraRemoteDataSource
) : ViewModel() {

    private val _uiState = MutableStateFlow(CameraUiState(isLoading = false))
    val uiState: StateFlow<CameraUiState> = _uiState

    fun loadStream(doorId: Int) {
        _uiState.value = CameraUiState(isLoading = true, doorId = doorId)
        viewModelScope.launch {
            try {
                val res = remote.getCameraStream(doorId)
                if (res.success && res.data != null) {
                    val data = res.data
                    _uiState.value = CameraUiState(
                        isLoading = false,
                        doorId = doorId,
                        streamUrl = data.stream_url,
                        errorMessage = null
                    )
                } else {
                    _uiState.value = CameraUiState(
                        isLoading = false,
                        doorId = doorId,
                        streamUrl = null,
                        errorMessage = res.message ?: "Gagal memuat stream kamera"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = CameraUiState(
                    isLoading = false,
                    doorId = doorId,
                    streamUrl = null,
                    errorMessage = e.message ?: "Terjadi kesalahan tak terduga"
                )
            }
        }
    }
}