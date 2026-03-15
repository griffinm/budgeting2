package com.griffin.budgeting.data.repository

import com.griffin.budgeting.data.model.CreateTransactionTagRequest
import com.griffin.budgeting.data.model.TransactionTag
import com.griffin.budgeting.data.model.TransactionTagCreate
import com.griffin.budgeting.data.remote.api.TransactionTagApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TransactionTagRepository @Inject constructor(
    private val api: TransactionTagApi,
) {
    suspend fun addTag(tagId: Int, transactionId: Int): Result<TransactionTag> {
        return try {
            val request = CreateTransactionTagRequest(
                transactionTag = TransactionTagCreate(
                    tagId = tagId,
                    plaidTransactionId = transactionId,
                ),
            )
            val response = api.createTransactionTag(request)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to add tag"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun removeTag(transactionTagId: Int): Result<Unit> {
        return try {
            val response = api.deleteTransactionTag(transactionTagId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to remove tag"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
