package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: Int,
    val email: String,
    val firstName: String,
    val lastName: String,
    val accountId: Int,
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val linkedAccounts: Int? = null,
)
