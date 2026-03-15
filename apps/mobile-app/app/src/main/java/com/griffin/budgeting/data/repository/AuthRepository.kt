package com.griffin.budgeting.data.repository

import com.griffin.budgeting.data.local.TokenStore
import com.griffin.budgeting.data.model.ErrorResponse
import com.griffin.budgeting.data.model.User
import com.griffin.budgeting.data.remote.api.AuthApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

sealed class AuthState {
    data object Loading : AuthState()
    data class Authenticated(val user: User, val token: String) : AuthState()
    data object Unauthenticated : AuthState()
}

@Singleton
class AuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val tokenStore: TokenStore,
    private val json: Json,
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val _authState = MutableStateFlow<AuthState>(AuthState.Loading)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    init {
        scope.launch { validateToken() }
    }

    suspend fun login(email: String, password: String): Result<User> {
        return try {
            val response = authApi.login(
                com.griffin.budgeting.data.model.LoginRequest(email, password)
            )
            if (response.isSuccessful) {
                val body = response.body()!!
                tokenStore.saveToken(body.token)
                tokenStore.saveUser(body.user)
                _authState.value = AuthState.Authenticated(body.user, body.token)
                Result.success(body.user)
            } else {
                val errorBody = response.errorBody()?.string()
                val message = parseError(errorBody)
                Result.failure(Exception(message))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signup(
        email: String,
        firstName: String,
        lastName: String,
        password: String,
    ): Result<User> {
        return try {
            val request = com.griffin.budgeting.data.model.SignupRequest(
                user = com.griffin.budgeting.data.model.SignupUser(
                    email = email,
                    firstName = firstName,
                    lastName = lastName,
                    password = password,
                )
            )
            val response = authApi.signup(request)
            if (response.isSuccessful) {
                val body = response.body()!!
                tokenStore.saveToken(body.token)
                tokenStore.saveUser(body.user)
                _authState.value = AuthState.Authenticated(body.user, body.token)
                Result.success(body.user)
            } else {
                val errorBody = response.errorBody()?.string()
                val message = parseError(errorBody)
                Result.failure(Exception(message))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun validateToken() {
        val token = tokenStore.getToken()
        if (token == null) {
            _authState.value = AuthState.Unauthenticated
            return
        }
        try {
            val response = authApi.getCurrentUser()
            if (response.isSuccessful) {
                val user = response.body()!!
                tokenStore.saveUser(user)
                _authState.value = AuthState.Authenticated(user, token)
            } else {
                tokenStore.clear()
                _authState.value = AuthState.Unauthenticated
            }
        } catch (e: Exception) {
            // Network error - try to use cached user
            val cachedUser = tokenStore.getUser()
            if (cachedUser != null) {
                _authState.value = AuthState.Authenticated(cachedUser, token)
            } else {
                _authState.value = AuthState.Unauthenticated
            }
        }
    }

    fun logout() {
        tokenStore.clear()
        _authState.value = AuthState.Unauthenticated
    }

    private fun parseError(errorBody: String?): String {
        if (errorBody == null) return "An unknown error occurred"
        return try {
            val errorResponse = json.decodeFromString<com.griffin.budgeting.data.model.ErrorResponse>(errorBody)
            errorResponse.errors?.firstOrNull()
                ?: errorResponse.messages?.firstOrNull()
                ?: errorResponse.error
                ?: "An unknown error occurred"
        } catch (e: Exception) {
            "An unknown error occurred"
        }
    }
}
