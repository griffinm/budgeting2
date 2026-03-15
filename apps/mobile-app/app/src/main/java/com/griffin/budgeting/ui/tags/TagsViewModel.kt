package com.griffin.budgeting.ui.tags

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.paging.PagingData
import androidx.paging.cachedIn
import com.griffin.budgeting.data.model.TagReport
import com.griffin.budgeting.data.model.Transaction
import com.griffin.budgeting.data.repository.TagRepository
import com.griffin.budgeting.data.repository.TagReportRepository
import com.griffin.budgeting.data.repository.TransactionRepository
import com.griffin.budgeting.ui.transactions.TransactionSearchParams
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class TagsViewModel @Inject constructor(
    private val tagRepository: TagRepository,
    private val tagReportRepository: TagReportRepository,
    private val transactionRepository: TransactionRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(TagsUiState())
    val uiState: StateFlow<TagsUiState> = _uiState.asStateFlow()

    private val _transactionParams = MutableStateFlow(TransactionSearchParams())

    val transactions: Flow<PagingData<Transaction>> = _transactionParams
        .flatMapLatest { params ->
            transactionRepository.getTransactions(params.toQueryMap())
        }
        .cachedIn(viewModelScope)

    init {
        loadInitialData()
    }

    private fun loadInitialData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                val tagsResult = tagRepository.getTags(forceRefresh = true)
                val reportsResult = tagReportRepository.getTagReports()

                val tags = tagsResult.getOrThrow()
                val reports = reportsResult.getOrThrow()

                _uiState.update {
                    it.copy(
                        allTags = tags,
                        savedReports = reports,
                        isLoading = false,
                    )
                }

                refreshSpendStats()
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Failed to load data",
                    )
                }
            }
        }
    }

    fun toggleIncludeTag(tagId: Int) {
        _uiState.update { state ->
            val included = state.includedTagIds.toMutableSet()
            val omitted = state.omittedTagIds.toMutableSet()
            if (tagId in included) {
                included.remove(tagId)
            } else {
                included.add(tagId)
                omitted.remove(tagId)
            }
            state.copy(includedTagIds = included, omittedTagIds = omitted)
        }
        onFiltersChanged()
    }

    fun toggleOmitTag(tagId: Int) {
        _uiState.update { state ->
            val included = state.includedTagIds.toMutableSet()
            val omitted = state.omittedTagIds.toMutableSet()
            if (tagId in omitted) {
                omitted.remove(tagId)
            } else {
                omitted.add(tagId)
                included.remove(tagId)
            }
            state.copy(includedTagIds = included, omittedTagIds = omitted)
        }
        onFiltersChanged()
    }

    fun setMonthsBack(months: Int) {
        _uiState.update { it.copy(monthsBack = months) }
        onFiltersChanged()
    }

    fun loadReport(report: TagReport) {
        _uiState.update {
            it.copy(
                includedTagIds = report.includedTagIds.toSet(),
                omittedTagIds = report.omittedTagIds.toSet(),
            )
        }
        onFiltersChanged()
    }

    fun createReport(name: String, description: String?) {
        viewModelScope.launch {
            val state = _uiState.value
            val result = tagReportRepository.createTagReport(
                name = name,
                description = description,
                includedTagIds = state.includedTagIds,
                omittedTagIds = state.omittedTagIds,
            )
            result.onSuccess { report ->
                _uiState.update {
                    it.copy(savedReports = it.savedReports + report)
                }
            }.onFailure { e ->
                _uiState.update {
                    it.copy(error = e.message ?: "Failed to create report")
                }
            }
        }
    }

    fun deleteReport(reportId: Int) {
        viewModelScope.launch {
            val result = tagReportRepository.deleteTagReport(reportId)
            result.onSuccess {
                _uiState.update {
                    it.copy(savedReports = it.savedReports.filter { r -> r.id != reportId })
                }
            }.onFailure { e ->
                _uiState.update {
                    it.copy(error = e.message ?: "Failed to delete report")
                }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }

    private fun onFiltersChanged() {
        val state = _uiState.value
        _transactionParams.value = TransactionSearchParams(
            tagIds = state.includedTagIds.toList(),
            omitTagIds = state.omittedTagIds.toList(),
        )
        refreshSpendStats()
    }

    private fun refreshSpendStats() {
        viewModelScope.launch {
            val state = _uiState.value
            val result = tagReportRepository.getSpendStats(
                tagIds = state.includedTagIds,
                omitTagIds = state.omittedTagIds,
                monthsBack = state.monthsBack,
            )
            result.onSuccess { stats ->
                _uiState.update { it.copy(spendStats = stats) }
            }
        }
    }
}
