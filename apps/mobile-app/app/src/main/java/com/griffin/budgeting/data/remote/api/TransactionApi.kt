package com.griffin.budgeting.data.remote.api

import com.griffin.budgeting.data.model.PaginatedResponse
import com.griffin.budgeting.data.model.Transaction
import com.griffin.budgeting.data.model.UpdateTransactionRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.Path
import retrofit2.http.QueryMap

interface TransactionApi {
    @GET("api/transactions")
    suspend fun getTransactions(@QueryMap params: Map<String, String>): Response<PaginatedResponse<Transaction>>

    @GET("api/transactions/{id}")
    suspend fun getTransaction(@Path("id") id: Int): Response<Transaction>

    @PATCH("api/transactions/{id}")
    suspend fun updateTransaction(
        @Path("id") id: Int,
        @Body request: UpdateTransactionRequest,
    ): Response<Transaction>
}
