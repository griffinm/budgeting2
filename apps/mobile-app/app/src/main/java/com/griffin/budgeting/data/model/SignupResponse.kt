package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class SignupResponse(
    val user: User,
    val token: String,
)
