package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class TotalForDateRange(
    val transactionType: String,
    val startDate: String,
    val endDate: String,
    val total: Double,
)
