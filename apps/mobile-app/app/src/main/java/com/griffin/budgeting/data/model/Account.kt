package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Account(
    val id: Int,
    val createdAt: String,
    val updatedAt: String,
)
