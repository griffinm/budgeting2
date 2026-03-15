package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class PlaidAccount(
    val id: Int,
    val accountType: String? = null,
    val plaidMask: String? = null,
    val plaidOfficialName: String? = null,
    val plaidType: String? = null,
    val plaidSubtype: String? = null,
    val nickname: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null,
)
