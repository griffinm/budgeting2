package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class TagSpendStats(
    val month: Int,
    val year: Int,
    val tagId: Int,
    val totalAmount: Double,
)
