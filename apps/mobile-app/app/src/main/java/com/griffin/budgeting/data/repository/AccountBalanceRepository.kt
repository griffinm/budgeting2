package com.griffin.budgeting.data.repository

import com.griffin.budgeting.data.model.AccountBalanceHistory
import com.griffin.budgeting.data.remote.api.AccountBalanceApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AccountBalanceRepository @Inject constructor(
    private val accountBalanceApi: AccountBalanceApi,
) {
    suspend fun getBalanceHistory(
        plaidAccountId: Int,
        timeRange: String? = null,
    ): Result<List<AccountBalanceHistory>> {
        return try {
            val response = accountBalanceApi.getAccountBalanceHistory(plaidAccountId, timeRange)
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to load balance history"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
