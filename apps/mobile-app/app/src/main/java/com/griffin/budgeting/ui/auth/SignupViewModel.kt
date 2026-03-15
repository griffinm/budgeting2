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

sealed class SignupUiState {
    data object Idle : SignupUiState()
    data object Loading : SignupUiState()
    data class Error(val message: String) : SignupUiState()
}

@HiltViewModel
class SignupViewModel @Inject constructor(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow<SignupUiState>(SignupUiState.Idle)
    val uiState: StateFlow<SignupUiState> = _uiState.asStateFlow()

    private val _firstName = MutableStateFlow("")
    val firstName: StateFlow<String> = _firstName.asStateFlow()

    private val _lastName = MutableStateFlow("")
    val lastName: StateFlow<String> = _lastName.asStateFlow()

    private val _email = MutableStateFlow("")
    val email: StateFlow<String> = _email.asStateFlow()

    private val _password = MutableStateFlow("")
    val password: StateFlow<String> = _password.asStateFlow()

    private val _confirmPassword = MutableStateFlow("")
    val confirmPassword: StateFlow<String> = _confirmPassword.asStateFlow()

    fun onFirstNameChange(value: String) {
        _firstName.value = value
        clearError()
    }

    fun onLastNameChange(value: String) {
        _lastName.value = value
        clearError()
    }

    fun onEmailChange(value: String) {
        _email.value = value
        clearError()
    }

    fun onPasswordChange(value: String) {
        _password.value = value
        clearError()
    }

    fun onConfirmPasswordChange(value: String) {
        _confirmPassword.value = value
        clearError()
    }

    private fun clearError() {
        if (_uiState.value is SignupUiState.Error) _uiState.value = SignupUiState.Idle
    }

    fun signup() {
        val first = _firstName.value.trim()
        val last = _lastName.value.trim()
        val emailVal = _email.value.trim()
        val pass = _password.value
        val confirm = _confirmPassword.value

        if (first.isBlank()) {
            _uiState.value = SignupUiState.Error("First name is required")
            return
        }
        if (last.isBlank()) {
            _uiState.value = SignupUiState.Error("Last name is required")
            return
        }
        if (emailVal.isBlank()) {
            _uiState.value = SignupUiState.Error("Email is required")
            return
        }
        if (pass.length < 8) {
            _uiState.value = SignupUiState.Error("Password must be at least 8 characters")
            return
        }
        if (pass != confirm) {
            _uiState.value = SignupUiState.Error("Passwords do not match")
            return
        }

        viewModelScope.launch {
            _uiState.value = SignupUiState.Loading
            val result = authRepository.signup(emailVal, first, last, pass)
            result.fold(
                onSuccess = { /* Auth state change handled by repository */ },
                onFailure = { e ->
                    _uiState.value = SignupUiState.Error(
                        e.message ?: "Signup failed"
                    )
                },
            )
        }
    }
}
