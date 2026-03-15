package com.griffin.budgeting.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class UpdateTransactionRequest(
    val transaction: TransactionUpdate,
    @SerialName("merchant_id") val merchantId: Int? = null,
    @SerialName("use_as_default") val useAsDefault: Boolean? = null,
)

@Serializable
data class TransactionUpdate(
    @SerialName("merchant_tag_id") val merchantTagId: Int? = null,
    val note: String? = null,
    @SerialName("transaction_type") val transactionType: String? = null,
)
