package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ErrorResponse(
    val error: String? = null,
    val errors: List<String>? = null,
    val messages: List<String>? = null,
)
