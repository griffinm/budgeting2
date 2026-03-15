package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class AccountBalance(
    val id: Int,
    val currentBalance: Double,
    val availableBalance: Double? = null,
    val limit: Double? = null,
    val plaidAccount: PlaidAccount? = null,
    val createdAt: String? = null,
)
