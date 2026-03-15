package com.griffin.budgeting.ui.tags

import com.griffin.budgeting.data.model.Tag
import com.griffin.budgeting.data.model.TagReport
import com.griffin.budgeting.data.model.TagSpendStats

data class TagsUiState(
    val allTags: List<Tag> = emptyList(),
    val includedTagIds: Set<Int> = emptySet(),
    val omittedTagIds: Set<Int> = emptySet(),
    val monthsBack: Int = 6,
    val savedReports: List<TagReport> = emptyList(),
    val spendStats: List<TagSpendStats> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null,
)
