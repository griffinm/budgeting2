package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class LoginResponse(
    val user: User,
    val token: String,
)
