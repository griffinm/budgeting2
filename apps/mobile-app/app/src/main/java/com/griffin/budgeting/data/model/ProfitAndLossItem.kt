package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ProfitAndLossItem(
    val date: String,
    val expense: Double,
    val income: Double,
    val profit: Double,
    val profitPercentage: Double,
)
