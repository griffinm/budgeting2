package com.griffin.budgeting.data.remote.api

import com.griffin.budgeting.data.model.MovingAverage
import com.griffin.budgeting.data.model.ProfitAndLossItem
import com.griffin.budgeting.data.model.TotalForDateRange
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface DataApi {
    @GET("api/data/total_for_date_range")
    suspend fun getTotalForDateRange(
        @Query("transaction_type") transactionType: String? = null,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null,
    ): Response<TotalForDateRange>

    @GET("api/data/profit_and_loss")
    suspend fun getProfitAndLoss(
        @Query("months_back") monthsBack: Int? = null,
    ): Response<List<ProfitAndLossItem>>

    @GET("api/data/spend_moving_average")
    suspend fun getSpendMovingAverage(): Response<List<MovingAverage>>

    @GET("api/data/income_moving_average")
    suspend fun getIncomeMovingAverage(): Response<List<MovingAverage>>
}
