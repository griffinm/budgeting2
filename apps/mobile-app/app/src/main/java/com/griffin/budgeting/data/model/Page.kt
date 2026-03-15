package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Page(
    val currentPage: Int,
    val totalPages: Int,
    val totalCount: Int,
)
