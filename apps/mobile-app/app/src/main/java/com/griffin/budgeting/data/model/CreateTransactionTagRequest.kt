package com.griffin.budgeting.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class CreateTransactionTagRequest(
    @SerialName("transaction_tag") val transactionTag: TransactionTagCreate,
)

@Serializable
data class TransactionTagCreate(
    @SerialName("tag_id") val tagId: Int,
    @SerialName("plaid_transaction_id") val plaidTransactionId: Int,
)
