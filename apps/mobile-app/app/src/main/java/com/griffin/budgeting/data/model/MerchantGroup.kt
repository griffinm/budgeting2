package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class MerchantGroup(
    val id: Int,
    val name: String,
    val description: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val primaryMerchant: MerchantSummary? = null,
    val merchants: List<MerchantSummary>? = null,
    val merchantCount: Int? = null,
)

@Serializable
data class MerchantSummary(
    val id: Int,
    val name: String,
    val customName: String? = null,
)
