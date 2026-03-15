package com.griffin.budgeting.data.remote.api

import com.griffin.budgeting.data.model.SyncEvent
import retrofit2.Response
import retrofit2.http.GET

interface SyncEventApi {
    @GET("api/sync_events/latest")
    suspend fun getLatestSyncEvent(): Response<SyncEvent>
}
