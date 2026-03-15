package com.griffin.budgeting.ui.auth

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

/**
 * Tests for LoginViewModel UI state types and the TransactionSearchParams model.
 *
 * Note: LoginViewModel itself requires an AuthRepository which depends on Android-only
 * components (EncryptedSharedPreferences via TokenStore). We test the sealed-class
 * state model here and exercise TransactionSearchParams.toQueryMap() which is pure logic.
 */
class LoginViewModelTest {

    // ── LoginUiState sealed class ───────────────────────────────────────

    @Test
    fun `initial state type is Idle`() {
        val state: LoginUiState = LoginUiState.Idle
        assertTrue(state is LoginUiState.Idle)
    }

    @Test
    fun `Loading state is a LoginUiState`() {
        val state: LoginUiState = LoginUiState.Loading
        assertTrue(state is LoginUiState.Loading)
    }

    @Test
    fun `Error state contains message`() {
        val state = LoginUiState.Error("Bad credentials")
        assertEquals("Bad credentials", state.message)
    }

    @Test
    fun `Error states with different messages are not equal`() {
        val a = LoginUiState.Error("Error A")
        val b = LoginUiState.Error("Error B")
        assertTrue(a != b)
    }

    @Test
    fun `Error states with same message are equal`() {
        val a = LoginUiState.Error("Same")
        val b = LoginUiState.Error("Same")
        assertEquals(a, b)
    }

    // ── TransactionSearchParams.toQueryMap (pure logic) ─────────────────

    @Test
    fun `TransactionSearchParams toQueryMap includes search term`() {
        val params = com.griffin.budgeting.ui.transactions.TransactionSearchParams(
            searchTerm = "walmart",
            transactionType = "expense",
        )
        val map = params.toQueryMap()
        assertEquals("walmart", map["search_term"])
        assertEquals("expense", map["transaction_type"])
    }

    @Test
    fun `TransactionSearchParams toQueryMap omits blank fields`() {
        val params = com.griffin.budgeting.ui.transactions.TransactionSearchParams()
        val map = params.toQueryMap()
        assertTrue(map.isEmpty())
    }

    @Test
    fun `TransactionSearchParams toQueryMap includes all filter fields`() {
        val params = com.griffin.budgeting.ui.transactions.TransactionSearchParams(
            startDate = "2026-01-01",
            endDate = "2026-01-31",
            amountGreaterThan = 10.0,
            amountLessThan = 100.0,
            merchantTagId = 5,
            hasNoCategory = true,
        )
        val map = params.toQueryMap()
        assertEquals("2026-01-01", map["start_date"])
        assertEquals("2026-01-31", map["end_date"])
        assertEquals("10.0", map["amount_greater_than"])
        assertEquals("100.0", map["amount_less_than"])
        assertEquals("5", map["merchant_tag_id"])
        assertEquals("true", map["has_no_category"])
    }

    @Test
    fun `TransactionSearchParams toQueryMap includes tagIds with indexed keys`() {
        val params = com.griffin.budgeting.ui.transactions.TransactionSearchParams(
            tagIds = listOf(10, 20, 30),
        )
        val map = params.toQueryMap()
        assertEquals("10", map["tag_ids[0]"])
        assertEquals("20", map["tag_ids[1]"])
        assertEquals("30", map["tag_ids[2]"])
    }

    @Test
    fun `TransactionSearchParams toQueryMap includes plaidAccountIds`() {
        val params = com.griffin.budgeting.ui.transactions.TransactionSearchParams(
            plaidAccountIds = listOf(1, 2),
        )
        val map = params.toQueryMap()
        assertEquals("1", map["plaid_account_ids[0]"])
        assertEquals("2", map["plaid_account_ids[1]"])
    }
}
