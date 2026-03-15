package com.griffin.budgeting.data.model

import kotlinx.serialization.Serializable

@Serializable
data class CreateTagRequest(
    val tag: TagCreate,
)

@Serializable
data class TagCreate(
    val name: String,
)
