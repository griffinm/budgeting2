package com.griffin.budgeting.ui.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.griffin.budgeting.data.model.SyncEvent
import com.griffin.budgeting.data.model.User
import com.griffin.budgeting.data.remote.api.SyncEventApi
import com.griffin.budgeting.data.repository.AuthRepository
import com.griffin.budgeting.data.repository.AuthState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfileUiState(
    val user: User? = null,
    val lastSync: SyncEvent? = null,
    val isLoading: Boolean = true,
)

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val syncEventApi: SyncEventApi,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            authRepository.authState.collect { state ->
                if (state is AuthState.Authenticated) {
                    _uiState.value = _uiState.value.copy(user = state.user)
                }
            }
        }
        loadLastSync()
    }

    private fun loadLastSync() {
        viewModelScope.launch {
            try {
                val response = syncEventApi.getLatestSyncEvent()
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        lastSync = response.body(),
                        isLoading = false,
                    )
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
            } catch (_: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false)
            }
        }
    }

    fun logout() {
        authRepository.logout()
    }
}
