package com.griffin.budgeting.data.repository

import com.griffin.budgeting.data.model.CreateTagReportRequest
import com.griffin.budgeting.data.model.TagReport
import com.griffin.budgeting.data.model.TagReportCreate
import com.griffin.budgeting.data.model.TagReportTagAttribute
import com.griffin.budgeting.data.model.TagSpendStats
import com.griffin.budgeting.data.remote.api.TagApi
import com.griffin.budgeting.data.remote.api.TagReportApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TagReportRepository @Inject constructor(
    private val tagReportApi: TagReportApi,
    private val tagApi: TagApi,
) {
    suspend fun getTagReports(): Result<List<TagReport>> {
        return try {
            val response = tagReportApi.getTagReports()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to load tag reports"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createTagReport(
        name: String,
        description: String?,
        includedTagIds: Set<Int>,
        omittedTagIds: Set<Int>,
    ): Result<TagReport> {
        return try {
            val attributes = buildList {
                includedTagIds.forEach { tagId ->
                    add(TagReportTagAttribute(tagId = tagId, role = "included"))
                }
                omittedTagIds.forEach { tagId ->
                    add(TagReportTagAttribute(tagId = tagId, role = "omitted"))
                }
            }
            val request = CreateTagReportRequest(
                tagReport = TagReportCreate(
                    name = name,
                    description = description,
                    tagReportTagsAttributes = attributes,
                ),
            )
            val response = tagReportApi.createTagReport(request)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to create tag report"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteTagReport(id: Int): Result<Unit> {
        return try {
            val response = tagReportApi.deleteTagReport(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to delete tag report"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getSpendStats(
        tagIds: Set<Int>,
        omitTagIds: Set<Int>,
        monthsBack: Int,
    ): Result<List<TagSpendStats>> {
        return try {
            val params = mutableMapOf<String, String>()
            params["months_back"] = monthsBack.toString()
            tagIds.forEachIndexed { i, id -> params["tag_ids[$i]"] = id.toString() }
            omitTagIds.forEachIndexed { i, id -> params["omit_tag_ids[$i]"] = id.toString() }
            val response = tagApi.getSpendStats(params)
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to load spend stats"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
