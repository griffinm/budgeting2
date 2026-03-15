package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Tag(
    val id: Int,
    val name: String,
    val color: String,
    val userId: Int? = null,
    val accountId: Int? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null,
)
