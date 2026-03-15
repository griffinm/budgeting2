package com.griffin.budgeting.di

import com.griffin.budgeting.data.local.TokenStore
import com.griffin.budgeting.data.remote.api.AccountBalanceApi
import com.griffin.budgeting.data.remote.api.AuthApi
import com.griffin.budgeting.data.remote.api.DataApi
import com.griffin.budgeting.data.remote.api.MerchantCategoryApi
import com.griffin.budgeting.data.remote.api.PlaidAccountApi
import com.griffin.budgeting.data.remote.api.SyncEventApi
import com.griffin.budgeting.data.remote.api.TagApi
import com.griffin.budgeting.data.remote.api.TagReportApi
import com.griffin.budgeting.data.remote.api.TransactionApi
import com.griffin.budgeting.data.remote.api.TransactionTagApi
import com.griffin.budgeting.data.remote.interceptor.AuthInterceptor
import com.griffin.budgeting.data.remote.interceptor.JsonSuffixInterceptor
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideJson(): Json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        isLenient = true
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(tokenStore: TokenStore): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(JsonSuffixInterceptor())
            .addInterceptor(AuthInterceptor(tokenStore))
            .addInterceptor(
                HttpLoggingInterceptor().apply {
                    level = HttpLoggingInterceptor.Level.BODY
                }
            )
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient, json: Json): Retrofit {
        return Retrofit.Builder()
            .baseUrl("http://10.0.2.2:3000/")
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi =
        retrofit.create(AuthApi::class.java)

    @Provides
    @Singleton
    fun provideTransactionApi(retrofit: Retrofit): TransactionApi =
        retrofit.create(TransactionApi::class.java)

    @Provides
    @Singleton
    fun provideMerchantCategoryApi(retrofit: Retrofit): MerchantCategoryApi =
        retrofit.create(MerchantCategoryApi::class.java)

    @Provides
    @Singleton
    fun provideTagApi(retrofit: Retrofit): TagApi =
        retrofit.create(TagApi::class.java)

    @Provides
    @Singleton
    fun provideTransactionTagApi(retrofit: Retrofit): TransactionTagApi =
        retrofit.create(TransactionTagApi::class.java)

    @Provides
    @Singleton
    fun provideTagReportApi(retrofit: Retrofit): TagReportApi =
        retrofit.create(TagReportApi::class.java)

    @Provides
    @Singleton
    fun providePlaidAccountApi(retrofit: Retrofit): PlaidAccountApi =
        retrofit.create(PlaidAccountApi::class.java)

    @Provides
    @Singleton
    fun provideAccountBalanceApi(retrofit: Retrofit): AccountBalanceApi =
        retrofit.create(AccountBalanceApi::class.java)

    @Provides
    @Singleton
    fun provideDataApi(retrofit: Retrofit): DataApi =
        retrofit.create(DataApi::class.java)

    @Provides
    @Singleton
    fun provideSyncEventApi(retrofit: Retrofit): SyncEventApi =
        retrofit.create(SyncEventApi::class.java)
}
