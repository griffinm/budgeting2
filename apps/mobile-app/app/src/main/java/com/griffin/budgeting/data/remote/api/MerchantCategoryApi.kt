package com.griffin.budgeting.data.remote.api

import com.griffin.budgeting.data.model.MerchantCategory
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface MerchantCategoryApi {
    @GET("api/merchant_tags")
    suspend fun getCategories(): Response<List<MerchantCategory>>

    @GET("api/merchant_tags/spend_stats")
    suspend fun getSpendStats(
        @Query("start_date") startDate: String,
        @Query("end_date") endDate: String,
    ): Response<List<MerchantCategory>>
}
