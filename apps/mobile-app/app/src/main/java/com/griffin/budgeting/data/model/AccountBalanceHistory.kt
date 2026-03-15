package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class AccountBalanceHistory(
    val id: Int? = null,
    val currentBalance: Double,
    val createdAt: String,
)
