package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class PaginatedResponse<T>(
    val items: List<T>,
    val page: Page,
)
