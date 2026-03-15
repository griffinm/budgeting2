package com.griffin.budgeting.ui.transactions

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.paging.PagingData
import androidx.paging.cachedIn
import androidx.paging.map
import com.griffin.budgeting.data.model.Transaction
import com.griffin.budgeting.data.repository.TransactionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TransactionSearchParams(
    val searchTerm: String = "",
    val startDate: String? = null,
    val endDate: String? = null,
    val transactionType: String? = null,
    val merchantTagId: Int? = null,
    val amountGreaterThan: Double? = null,
    val amountLessThan: Double? = null,
    val hasNoCategory: Boolean = false,
    val tagIds: List<Int> = emptyList(),
    val omitTagIds: List<Int> = emptyList(),
    val plaidAccountIds: List<Int> = emptyList(),
) {
    fun toQueryMap(): Map<String, String> {
        val map = mutableMapOf<String, String>()
        if (searchTerm.isNotBlank()) map["search_term"] = searchTerm
        startDate?.let { map["start_date"] = it }
        endDate?.let { map["end_date"] = it }
        transactionType?.let { map["transaction_type"] = it }
        merchantTagId?.let { map["merchant_tag_id"] = it.toString() }
        amountGreaterThan?.let { map["amount_greater_than"] = it.toString() }
        amountLessThan?.let { map["amount_less_than"] = it.toString() }
        if (hasNoCategory) map["has_no_category"] = "true"
        tagIds.forEachIndexed { i, id -> map["tag_ids[$i]"] = id.toString() }
        omitTagIds.forEachIndexed { i, id -> map["omit_tag_ids[$i]"] = id.toString() }
        plaidAccountIds.forEachIndexed { i, id -> map["plaid_account_ids[$i]"] = id.toString() }
        return map
    }
}

@HiltViewModel
class TransactionsViewModel @Inject constructor(
    private val transactionRepository: TransactionRepository,
) : ViewModel() {

    private val _searchParams = MutableStateFlow(TransactionSearchParams())
    val searchParams: StateFlow<TransactionSearchParams> = _searchParams.asStateFlow()

    private val _searchText = MutableStateFlow("")
    val searchText: StateFlow<String> = _searchText.asStateFlow()

    private val _transactions = MutableStateFlow<PagingData<Transaction>>(PagingData.empty())
    val transactions: StateFlow<PagingData<Transaction>> = _transactions.asStateFlow()

    init {
        viewModelScope.launch {
            @OptIn(ExperimentalCoroutinesApi::class, FlowPreview::class)
            _searchParams
                .debounce(300)
                .flatMapLatest { params ->
                    transactionRepository.getTransactions(params.toQueryMap())
                }
                .cachedIn(viewModelScope)
                .collectLatest { _transactions.value = it }
        }
    }

    fun onSearchTextChange(text: String) {
        _searchText.value = text
        _searchParams.value = _searchParams.value.copy(searchTerm = text)
    }

    fun updateFilters(params: TransactionSearchParams) {
        _searchParams.value = params.copy(searchTerm = _searchText.value)
    }

    fun clearFilters() {
        _searchText.value = ""
        _searchParams.value = TransactionSearchParams()
    }

    fun updateTransactionType(transactionId: Int, transactionType: String, merchantId: Int?) {
        _transactions.value = _transactions.value.map { transaction ->
            if (transaction.id == transactionId) {
                transaction.copy(transactionType = transactionType)
            } else {
                transaction
            }
        }
        viewModelScope.launch {
            transactionRepository.updateTransactionType(transactionId, transactionType, merchantId)
        }
    }

    fun updateNote(transactionId: Int, note: String) {
        _transactions.value = _transactions.value.map { transaction ->
            if (transaction.id == transactionId) {
                transaction.copy(note = note.ifBlank { null })
            } else {
                transaction
            }
        }
        viewModelScope.launch {
            transactionRepository.updateNote(transactionId, note)
        }
    }
}
