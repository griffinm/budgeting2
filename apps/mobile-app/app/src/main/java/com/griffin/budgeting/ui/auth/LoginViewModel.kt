package com.griffin.budgeting.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.griffin.budgeting.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class LoginUiState {
    data object Idle : LoginUiState()
    data object Loading : LoginUiState()
    data class Error(val message: String) : LoginUiState()
}

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    private val _email = MutableStateFlow("")
    val email: StateFlow<String> = _email.asStateFlow()

    private val _password = MutableStateFlow("")
    val password: StateFlow<String> = _password.asStateFlow()

    fun onEmailChange(value: String) {
        _email.value = value
        if (_uiState.value is LoginUiState.Error) _uiState.value = LoginUiState.Idle
    }

    fun onPasswordChange(value: String) {
        _password.value = value
        if (_uiState.value is LoginUiState.Error) _uiState.value = LoginUiState.Idle
    }

    fun login() {
        val emailVal = _email.value.trim()
        val passwordVal = _password.value

        if (emailVal.isBlank()) {
            _uiState.value = LoginUiState.Error("Email is required")
            return
        }
        if (passwordVal.isBlank()) {
            _uiState.value = LoginUiState.Error("Password is required")
            return
        }

        viewModelScope.launch {
            _uiState.value = LoginUiState.Loading
            val result = authRepository.login(emailVal, passwordVal)
            result.fold(
                onSuccess = { /* Auth state change handled by repository */ },
                onFailure = { e ->
                    _uiState.value = LoginUiState.Error(
                        e.message ?: "Login failed"
                    )
                },
            )
        }
    }
}
