package com.griffin.budgeting.data.repository

import com.griffin.budgeting.data.model.CreateTagRequest
import com.griffin.budgeting.data.model.Tag
import com.griffin.budgeting.data.model.TagCreate
import com.griffin.budgeting.data.remote.api.TagApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TagRepository @Inject constructor(
    private val api: TagApi,
) {
    private var cache: List<Tag>? = null

    suspend fun getTags(forceRefresh: Boolean = false): Result<List<Tag>> {
        if (!forceRefresh) cache?.let { return Result.success(it) }
        return try {
            val response = api.getTags()
            if (response.isSuccessful) {
                val tags = response.body() ?: emptyList()
                cache = tags
                Result.success(tags)
            } else {
                Result.failure(Exception("Failed to load tags"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createTag(name: String): Result<Tag> {
        return try {
            val response = api.createTag(CreateTagRequest(tag = TagCreate(name = name)))
            if (response.isSuccessful) {
                val tag = response.body()!!
                cache = cache?.plus(tag)
                Result.success(tag)
            } else {
                Result.failure(Exception("Failed to create tag"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
