package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class MerchantCategory(
    val id: Int,
    val name: String,
    val parentMerchantTagId: Int? = null,
    val color: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val targetBudget: Double? = null,
    val isLeaf: Boolean = false,
    val children: List<MerchantCategory>? = null,
    val totalTransactionAmount: Double? = null,
)
