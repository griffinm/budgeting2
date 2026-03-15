package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class TransactionTag(
    val id: Int,
    val tagId: Int,
    val tag: Tag? = null,
    val plaidTransactionId: Int? = null,
    val userId: Int? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null,
)
