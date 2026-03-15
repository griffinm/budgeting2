package com.griffin.budgeting.data.repository

import com.griffin.budgeting.data.model.AccountBalance
import com.griffin.budgeting.data.model.MerchantCategory
import com.griffin.budgeting.data.model.MovingAverage
import com.griffin.budgeting.data.model.ProfitAndLossItem
import com.griffin.budgeting.data.model.SyncEvent
import com.griffin.budgeting.data.model.Transaction
import com.griffin.budgeting.data.remote.api.AccountBalanceApi
import com.griffin.budgeting.data.remote.api.DataApi
import com.griffin.budgeting.data.remote.api.MerchantCategoryApi
import com.griffin.budgeting.data.remote.api.SyncEventApi
import com.griffin.budgeting.data.remote.api.TransactionApi
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DashboardRepository @Inject constructor(
    private val accountBalanceApi: AccountBalanceApi,
    private val dataApi: DataApi,
    private val transactionApi: TransactionApi,
    private val merchantCategoryApi: MerchantCategoryApi,
    private val syncEventApi: SyncEventApi,
) {
    suspend fun getAccountBalances(): Result<List<AccountBalance>> {
        return try {
            val response = accountBalanceApi.getAccountBalances()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to load account balances"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getProfitAndLoss(monthsBack: Int): Result<List<ProfitAndLossItem>> {
        return try {
            val response = dataApi.getProfitAndLoss(monthsBack)
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to load profit and loss"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getSpendMovingAverage(): Result<List<MovingAverage>> {
        return try {
            val response = dataApi.getSpendMovingAverage()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to load spend moving average"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getIncomeMovingAverage(): Result<List<MovingAverage>> {
        return try {
            val response = dataApi.getIncomeMovingAverage()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to load income moving average"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCurrentMonthTransactions(transactionType: String): Result<List<Transaction>> {
        return try {
            val today = LocalDate.now()
            val firstOfMonth = today.withDayOfMonth(1)
            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
            val params = mapOf(
                "transaction_type" to transactionType,
                "start_date" to firstOfMonth.format(formatter),
                "end_date" to today.format(formatter),
                "perPage" to "1000",
            )
            val response = transactionApi.getTransactions(params)
            if (response.isSuccessful) {
                Result.success(response.body()?.items ?: emptyList())
            } else {
                Result.failure(Exception("Failed to load transactions"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCategorySpendStats(startDate: String, endDate: String): Result<List<MerchantCategory>> {
        return try {
            val response = merchantCategoryApi.getSpendStats(startDate, endDate)
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to load category spend stats"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getLatestSyncEvent(): Result<SyncEvent?> {
        return try {
            val response = syncEventApi.getLatestSyncEvent()
            if (response.isSuccessful) {
                Result.success(response.body())
            } else {
                Result.success(null)
            }
        } catch (_: Exception) {
            Result.success(null)
        }
    }
}
