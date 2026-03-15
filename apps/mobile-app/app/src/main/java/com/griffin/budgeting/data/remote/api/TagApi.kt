package com.griffin.budgeting.data.remote.api

import com.griffin.budgeting.data.model.CreateTagRequest
import com.griffin.budgeting.data.model.Tag
import com.griffin.budgeting.data.model.TagSpendStats
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.QueryMap

interface TagApi {
    @GET("api/tags")
    suspend fun getTags(): Response<List<Tag>>

    @POST("api/tags")
    suspend fun createTag(@Body request: CreateTagRequest): Response<Tag>

    @GET("api/tags/spend_stats")
    suspend fun getSpendStats(@QueryMap params: Map<String, String>): Response<List<TagSpendStats>>
}
