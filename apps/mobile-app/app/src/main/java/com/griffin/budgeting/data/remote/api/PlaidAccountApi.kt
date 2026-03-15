package com.griffin.budgeting.data.remote.api

import com.griffin.budgeting.data.model.PlaidAccount
import retrofit2.Response
import retrofit2.http.GET

interface PlaidAccountApi {
    @GET("api/plaid_accounts")
    suspend fun getPlaidAccounts(): Response<List<PlaidAccount>>
}
