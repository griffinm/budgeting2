package com.griffin.budgeting.data.remote.api

import com.griffin.budgeting.data.model.CreateTagReportRequest
import com.griffin.budgeting.data.model.TagReport
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface TagReportApi {
    @GET("api/tag_reports")
    suspend fun getTagReports(): Response<List<TagReport>>

    @POST("api/tag_reports")
    suspend fun createTagReport(@Body request: CreateTagReportRequest): Response<TagReport>

    @DELETE("api/tag_reports/{id}")
    suspend fun deleteTagReport(@Path("id") id: Int): Response<Unit>
}
