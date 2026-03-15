package com.griffin.budgeting.data.repository

import com.griffin.budgeting.data.model.PlaidAccount
import com.griffin.budgeting.data.remote.api.PlaidAccountApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PlaidAccountRepository @Inject constructor(
    private val api: PlaidAccountApi,
) {
    private var cache: List<PlaidAccount>? = null

    suspend fun getPlaidAccounts(forceRefresh: Boolean = false): Result<List<PlaidAccount>> {
        if (!forceRefresh) cache?.let { return Result.success(it) }
        return try {
            val response = api.getPlaidAccounts()
            if (response.isSuccessful) {
                val accounts = response.body() ?: emptyList()
                cache = accounts
                Result.success(accounts)
            } else {
                Result.failure(Exception("Failed to load accounts"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
