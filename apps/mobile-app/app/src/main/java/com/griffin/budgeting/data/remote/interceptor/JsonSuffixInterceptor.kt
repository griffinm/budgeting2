package com.griffin.budgeting.data.remote.interceptor

import okhttp3.Interceptor
import okhttp3.Response

class JsonSuffixInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val originalUrl = originalRequest.url

        val pathSegments = originalUrl.encodedPathSegments.toMutableList()
        if (pathSegments.isNotEmpty()) {
            val lastSegment = pathSegments.last()
            if (!lastSegment.endsWith(".json")) {
                pathSegments[pathSegments.lastIndex] = "$lastSegment.json"
            }
        }

        val newUrlBuilder = originalUrl.newBuilder()
            .encodedPath("/" + pathSegments.joinToString("/"))

        val newRequest = originalRequest.newBuilder()
            .url(newUrlBuilder.build())
            .build()

        return chain.proceed(newRequest)
    }
}
