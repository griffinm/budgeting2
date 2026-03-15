package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class SyncEvent(
    val id: Int,
    val startedAt: String,
    val completedAt: String? = null,
)
