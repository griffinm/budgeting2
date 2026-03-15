package com.griffin.budgeting.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class CreateTagReportRequest(
    @SerialName("tag_report") val tagReport: TagReportCreate,
)

@Serializable
data class TagReportCreate(
    val name: String,
    val description: String? = null,
    @SerialName("tag_report_tags_attributes") val tagReportTagsAttributes: List<TagReportTagAttribute>,
)

@Serializable
data class TagReportTagAttribute(
    @SerialName("tag_id") val tagId: Int,
    val role: String,
)
