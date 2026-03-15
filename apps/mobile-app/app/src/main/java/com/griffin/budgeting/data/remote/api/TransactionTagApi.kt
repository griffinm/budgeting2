package com.griffin.budgeting.data.remote.api

import com.griffin.budgeting.data.model.CreateTransactionTagRequest
import com.griffin.budgeting.data.model.TransactionTag
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.POST
import retrofit2.http.Path

interface TransactionTagApi {
    @POST("api/transaction_tags")
    suspend fun createTransactionTag(@Body request: CreateTransactionTagRequest): Response<TransactionTag>

    @DELETE("api/transaction_tags/{id}")
    suspend fun deleteTransactionTag(@Path("id") id: Int): Response<Unit>
}
