package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class TagReport(
    val id: Int,
    val name: String,
    val description: String? = null,
    val userId: Int? = null,
    val accountId: Int? = null,
    val includedTagIds: List<Int> = emptyList(),
    val omittedTagIds: List<Int> = emptyList(),
    val createdAt: String? = null,
    val updatedAt: String? = null,
)
