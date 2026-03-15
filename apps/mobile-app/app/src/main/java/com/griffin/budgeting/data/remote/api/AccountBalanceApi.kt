package com.griffin.budgeting.data.remote.api

import com.griffin.budgeting.data.model.AccountBalance
import com.griffin.budgeting.data.model.AccountBalanceHistory
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface AccountBalanceApi {
    @GET("api/plaid_accounts/account_balance")
    suspend fun getAccountBalances(): Response<List<AccountBalance>>

    @GET("api/plaid_accounts/account_balance_history")
    suspend fun getAccountBalanceHistory(
        @Query("plaid_account_id") plaidAccountId: Int,
        @Query("time_range") timeRange: String? = null,
    ): Response<List<AccountBalanceHistory>>
}
