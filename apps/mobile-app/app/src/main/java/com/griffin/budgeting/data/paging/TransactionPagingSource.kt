package com.griffin.budgeting.data.paging

import androidx.paging.PagingSource
import androidx.paging.PagingState
import com.griffin.budgeting.data.model.Transaction
import com.griffin.budgeting.data.remote.api.TransactionApi

class TransactionPagingSource(
    private val transactionApi: TransactionApi,
    private val params: Map<String, String>,
) : PagingSource<Int, Transaction>() {

    override fun getRefreshKey(state: PagingState<Int, Transaction>): Int? {
        return state.anchorPosition?.let { position ->
            state.closestPageToPosition(position)?.prevKey?.plus(1)
                ?: state.closestPageToPosition(position)?.nextKey?.minus(1)
        }
    }

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Transaction> {
        val page = params.key ?: 1
        return try {
            val queryParams = this.params.toMutableMap().apply {
                put("currentPage", page.toString())
                put("perPage", "25")
            }
            val response = transactionApi.getTransactions(queryParams)
            if (response.isSuccessful) {
                val body = response.body()!!
                val pageInfo = body.page
                LoadResult.Page(
                    data = body.items,
                    prevKey = if (page > 1) page - 1 else null,
                    nextKey = if (pageInfo.currentPage < pageInfo.totalPages) page + 1 else null,
                )
            } else {
                LoadResult.Error(Exception("Failed to load transactions"))
            }
        } catch (e: Exception) {
            LoadResult.Error(e)
        }
    }
}
