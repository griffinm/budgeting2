package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class MovingAverage(
    val dayOfMonth: Int,
    val dayAverage: Double,
    val cumulativeTotal: Double,
    val cumulativeAveragePerDay: Double,
)
