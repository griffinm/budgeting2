package com.griffin.budgeting.data.repository

import com.griffin.budgeting.data.model.MerchantCategory
import com.griffin.budgeting.data.remote.api.MerchantCategoryApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MerchantCategoryRepository @Inject constructor(
    private val api: MerchantCategoryApi,
) {
    private var cache: List<MerchantCategory>? = null

    suspend fun getCategories(forceRefresh: Boolean = false): Result<List<MerchantCategory>> {
        if (!forceRefresh) cache?.let { return Result.success(it) }
        return try {
            val response = api.getCategories()
            if (response.isSuccessful) {
                val categories = response.body() ?: emptyList()
                cache = categories
                Result.success(categories)
            } else {
                Result.failure(Exception("Failed to load categories"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
