package com.griffin.budgeting.data.repository

import androidx.paging.Pager
import androidx.paging.PagingConfig
import androidx.paging.PagingData
import com.griffin.budgeting.data.model.Transaction
import com.griffin.budgeting.data.model.TransactionUpdate
import com.griffin.budgeting.data.model.UpdateTransactionRequest
import com.griffin.budgeting.data.paging.TransactionPagingSource
import com.griffin.budgeting.data.remote.api.TransactionApi
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TransactionRepository @Inject constructor(
    private val transactionApi: TransactionApi,
) {
    fun getTransactions(params: Map<String, String>): Flow<PagingData<Transaction>> {
        return Pager(
            config = PagingConfig(
                pageSize = 25,
                enablePlaceholders = false,
            ),
            pagingSourceFactory = { TransactionPagingSource(transactionApi, params) },
        ).flow
    }

    suspend fun updateTransactionType(
        transactionId: Int,
        transactionType: String,
        merchantId: Int?,
    ): Result<Transaction> {
        return try {
            val request = UpdateTransactionRequest(
                transaction = TransactionUpdate(transactionType = transactionType),
                merchantId = merchantId,
            )
            val response = transactionApi.updateTransaction(transactionId, request)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to update transaction type"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateNote(
        transactionId: Int,
        note: String,
    ): Result<Transaction> {
        return try {
            val request = UpdateTransactionRequest(
                transaction = TransactionUpdate(note = note),
            )
            val response = transactionApi.updateTransaction(transactionId, request)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to update note"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
