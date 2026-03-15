package com.griffin.budgeting.data.remote.interceptor

import com.griffin.budgeting.data.local.TokenStore
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(
    private val tokenStore: TokenStore,
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val token = tokenStore.getToken()

        val request = if (token != null) {
            originalRequest.newBuilder()
                .addHeader("x-budgeting-token", token)
                .build()
        } else {
            originalRequest
        }

        return chain.proceed(request)
    }
}
