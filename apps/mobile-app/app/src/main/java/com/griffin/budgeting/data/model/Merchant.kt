package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Merchant(
    val id: Int,
    val name: String,
    val customName: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val logoUrl: String? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    val zip: String? = null,
    val plaidEntityId: String? = null,
    val website: String? = null,
    val defaultTransactionType: String? = null,
    val defaultMerchantTagId: Int? = null,
    val defaultMerchantTag: MerchantCategory? = null,
    val defaultTags: List<Tag>? = null,
    val merchantGroup: MerchantGroup? = null,
)
