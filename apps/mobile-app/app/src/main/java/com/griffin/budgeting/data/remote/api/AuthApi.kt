package com.griffin.budgeting.data.remote.api

import com.griffin.budgeting.data.model.LoginRequest
import com.griffin.budgeting.data.model.LoginResponse
import com.griffin.budgeting.data.model.SignupRequest
import com.griffin.budgeting.data.model.SignupResponse
import com.griffin.budgeting.data.model.User
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface AuthApi {
    @POST("api/users/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("api/signup")
    suspend fun signup(@Body request: SignupRequest): Response<SignupResponse>

    @GET("api/users/current")
    suspend fun getCurrentUser(): Response<User>
}
