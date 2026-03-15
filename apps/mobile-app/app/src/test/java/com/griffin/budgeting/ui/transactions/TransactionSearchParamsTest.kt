package com.griffin.budgeting.ui.transactions

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class TransactionSearchParamsTest {

    @Test
    fun `empty params produces empty map`() {
        val params = TransactionSearchParams()
        assertTrue(params.toQueryMap().isEmpty())
    }

    @Test
    fun `search term is included`() {
        val params = TransactionSearchParams(searchTerm = "grocery")
        assertEquals("grocery", params.toQueryMap()["search_term"])
    }

    @Test
    fun `blank search term is excluded`() {
        val params = TransactionSearchParams(searchTerm = "  ")
        assertTrue(params.toQueryMap().isEmpty())
    }

    @Test
    fun `all filter fields mapped correctly`() {
        val params = TransactionSearchParams(
            searchTerm = "test",
            startDate = "2026-01-01",
            endDate = "2026-12-31",
            transactionType = "expense",
            merchantTagId = 42,
            amountGreaterThan = 5.0,
            amountLessThan = 500.0,
            hasNoCategory = true,
        )
        val map = params.toQueryMap()
        assertEquals("test", map["search_term"])
        assertEquals("2026-01-01", map["start_date"])
        assertEquals("2026-12-31", map["end_date"])
        assertEquals("expense", map["transaction_type"])
        assertEquals("42", map["merchant_tag_id"])
        assertEquals("5.0", map["amount_greater_than"])
        assertEquals("500.0", map["amount_less_than"])
        assertEquals("true", map["has_no_category"])
    }

    @Test
    fun `hasNoCategory false is excluded`() {
        val params = TransactionSearchParams(hasNoCategory = false)
        assertTrue("has_no_category" !in params.toQueryMap())
    }

    @Test
    fun `tagIds are mapped with indexed keys`() {
        val params = TransactionSearchParams(tagIds = listOf(1, 2, 3))
        val map = params.toQueryMap()
        assertEquals("1", map["tag_ids[0]"])
        assertEquals("2", map["tag_ids[1]"])
        assertEquals("3", map["tag_ids[2]"])
        assertEquals(3, map.size)
    }

    @Test
    fun `omitTagIds are mapped with indexed keys`() {
        val params = TransactionSearchParams(omitTagIds = listOf(10, 20))
        val map = params.toQueryMap()
        assertEquals("10", map["omit_tag_ids[0]"])
        assertEquals("20", map["omit_tag_ids[1]"])
        assertEquals(2, map.size)
    }

    @Test
    fun `plaidAccountIds are mapped with indexed keys`() {
        val params = TransactionSearchParams(plaidAccountIds = listOf(100))
        val map = params.toQueryMap()
        assertEquals("100", map["plaid_account_ids[0]"])
        assertEquals(1, map.size)
    }

    @Test
    fun `empty list fields produce no entries`() {
        val params = TransactionSearchParams(
            tagIds = emptyList(),
            omitTagIds = emptyList(),
            plaidAccountIds = emptyList(),
        )
        assertTrue(params.toQueryMap().isEmpty())
    }

    @Test
    fun `combined scalar and list fields produce correct map`() {
        val params = TransactionSearchParams(
            searchTerm = "coffee",
            transactionType = "expense",
            tagIds = listOf(5),
            plaidAccountIds = listOf(10, 20),
        )
        val map = params.toQueryMap()
        assertEquals(5, map.size)
        assertEquals("coffee", map["search_term"])
        assertEquals("expense", map["transaction_type"])
        assertEquals("5", map["tag_ids[0]"])
        assertEquals("10", map["plaid_account_ids[0]"])
        assertEquals("20", map["plaid_account_ids[1]"])
    }

    @Test
    fun `null optional fields are excluded`() {
        val params = TransactionSearchParams(
            startDate = null,
            endDate = null,
            transactionType = null,
            merchantTagId = null,
            amountGreaterThan = null,
            amountLessThan = null,
        )
        assertTrue(params.toQueryMap().isEmpty())
    }
}
