package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Transaction(
    val id: Int,
    val name: String,
    val accountId: Int? = null,
    val authorizedAt: String? = null,
    val date: String,
    val amount: Double,
    val pending: Boolean = false,
    val plaidCategoryPrimary: String? = null,
    val plaidCategoryDetail: String? = null,
    val paymentChannel: String? = null,
    val transactionType: String,
    val isCheck: Boolean = false,
    val checkNumber: String? = null,
    val currencyCode: String? = null,
    val hasDefaultMerchantTag: Boolean? = null,
    val note: String? = null,
    val recurring: Boolean = false,
    val categoryPrimary: String? = null,
    val categoryDetail: String? = null,
    val categoryConfidenceLevel: String? = null,
    val merchant: Merchant? = null,
    val plaidAccount: PlaidAccount? = null,
    val merchantTag: MerchantCategory? = null,
    val transactionTags: List<TransactionTag> = emptyList(),
)
