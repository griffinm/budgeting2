package com.griffin.budgeting.ui.dashboard

import com.griffin.budgeting.data.model.AccountBalance
import com.griffin.budgeting.data.model.MovingAverage
import com.griffin.budgeting.data.model.PlaidAccount
import com.griffin.budgeting.data.model.Transaction
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import java.time.LocalDate

class DashboardComputationsTest {

    // ── computeAvailableCash ────────────────────────────────────────────

    @Test
    fun `computeAvailableCash adds deposit availableBalance and subtracts credit currentBalance`() {
        val balances = listOf(
            AccountBalance(
                id = 1,
                currentBalance = 1000.0,
                availableBalance = 950.0,
                plaidAccount = PlaidAccount(id = 1, accountType = "deposit"),
            ),
            AccountBalance(
                id = 2,
                currentBalance = 500.0,
                availableBalance = null,
                plaidAccount = PlaidAccount(id = 2, accountType = "credit"),
            ),
        )
        val result = DashboardViewModel.computeAvailableCash(balances)
        assertEquals(450.0, result, 0.01) // 950 - 500
    }

    @Test
    fun `computeAvailableCash ignores loan and investment accounts`() {
        val balances = listOf(
            AccountBalance(
                id = 1,
                currentBalance = 1000.0,
                availableBalance = 1000.0,
                plaidAccount = PlaidAccount(id = 1, accountType = "deposit"),
            ),
            AccountBalance(
                id = 2,
                currentBalance = 50000.0,
                plaidAccount = PlaidAccount(id = 2, accountType = "loan"),
            ),
            AccountBalance(
                id = 3,
                currentBalance = 25000.0,
                plaidAccount = PlaidAccount(id = 3, accountType = "investment"),
            ),
        )
        val result = DashboardViewModel.computeAvailableCash(balances)
        assertEquals(1000.0, result, 0.01)
    }

    @Test
    fun `computeAvailableCash returns zero for empty list`() {
        val result = DashboardViewModel.computeAvailableCash(emptyList())
        assertEquals(0.0, result, 0.01)
    }

    @Test
    fun `computeAvailableCash uses zero when deposit has null availableBalance`() {
        val balances = listOf(
            AccountBalance(
                id = 1,
                currentBalance = 5000.0,
                availableBalance = null,
                plaidAccount = PlaidAccount(id = 1, accountType = "deposit"),
            ),
        )
        // getCurrentBalance returns availableBalance ?: 0.0 for deposit
        val result = DashboardViewModel.computeAvailableCash(balances)
        assertEquals(0.0, result, 0.01)
    }

    @Test
    fun `computeAvailableCash skips balances with null plaidAccount`() {
        val balances = listOf(
            AccountBalance(
                id = 1,
                currentBalance = 5000.0,
                availableBalance = 5000.0,
                plaidAccount = null,
            ),
        )
        val result = DashboardViewModel.computeAvailableCash(balances)
        assertEquals(0.0, result, 0.01)
    }

    // ── getDailyRunningTotal ────────────────────────────────────────────

    @Test
    fun `getDailyRunningTotal sums absolute amounts up to given day`() {
        val today = LocalDate.now()
        val dateStr = "${today.year}-${today.monthValue.toString().padStart(2, '0')}"
        val transactions = listOf(
            Transaction(id = 1, name = "A", date = "$dateStr-01", amount = 50.0, transactionType = "expense"),
            Transaction(id = 2, name = "B", date = "$dateStr-02", amount = -30.0, transactionType = "expense"),
            Transaction(id = 3, name = "C", date = "$dateStr-05", amount = 100.0, transactionType = "expense"),
            Transaction(id = 4, name = "D", date = "$dateStr-01", amount = 200.0, transactionType = "income"),
        )
        // Only day <= 3 and type == "expense": A (abs 50) + B (abs 30) = 80
        val result = DashboardViewModel.getDailyRunningTotal(transactions, 3, "expense")
        assertEquals(80.0, result, 0.01)
    }

    @Test
    fun `getDailyRunningTotal returns zero for empty list`() {
        val result = DashboardViewModel.getDailyRunningTotal(emptyList(), 15, "expense")
        assertEquals(0.0, result, 0.01)
    }

    @Test
    fun `getDailyRunningTotal excludes transactions from wrong month`() {
        // Use a month that is NOT the current month
        val today = LocalDate.now()
        val otherMonth = if (today.monthValue == 1) 12 else today.monthValue - 1
        val otherYear = if (today.monthValue == 1) today.year - 1 else today.year
        val dateStr = "$otherYear-${otherMonth.toString().padStart(2, '0')}"
        val transactions = listOf(
            Transaction(id = 1, name = "Old", date = "$dateStr-01", amount = 999.0, transactionType = "expense"),
        )
        val result = DashboardViewModel.getDailyRunningTotal(transactions, 31, "expense")
        assertEquals(0.0, result, 0.01)
    }

    // ── getPercentChange ────────────────────────────────────────────────

    @Test
    fun `getPercentChange returns zero when average is zero`() {
        val result = DashboardViewModel.getPercentChange(100.0, 0.0)
        assertEquals(0.0, result)
    }

    @Test
    fun `getPercentChange computes correct positive percentage`() {
        // 150 vs avg of 100 = +50%
        val result = DashboardViewModel.getPercentChange(150.0, 100.0)
        assertEquals(50.0, result, 0.01)
    }

    @Test
    fun `getPercentChange computes correct negative percentage`() {
        // 75 vs avg of 100 = -25%
        val result = DashboardViewModel.getPercentChange(75.0, 100.0)
        assertEquals(-25.0, result, 0.01)
    }

    @Test
    fun `getPercentChange rounds to one decimal`() {
        // 133 vs avg of 100 = +33.0%
        val result = DashboardViewModel.getPercentChange(133.0, 100.0)
        assertEquals(33.0, result, 0.01)
    }

    @Test
    fun `getPercentChange handles zero total this month`() {
        // 0 vs avg of 200 = -100%
        val result = DashboardViewModel.getPercentChange(0.0, 200.0)
        assertEquals(-100.0, result, 0.01)
    }

    // ── getAverageForCurrentDay ─────────────────────────────────────────

    @Test
    fun `getAverageForCurrentDay returns matching entry`() {
        val averages = listOf(
            MovingAverage(dayOfMonth = 1, dayAverage = 10.0, cumulativeTotal = 10.0, cumulativeAveragePerDay = 10.0),
            MovingAverage(dayOfMonth = 15, dayAverage = 20.0, cumulativeTotal = 300.0, cumulativeAveragePerDay = 20.0),
        )
        val result = DashboardViewModel.getAverageForCurrentDay(averages, 15)
        assertEquals(300.0, result?.cumulativeTotal)
        assertEquals(20.0, result?.dayAverage)
    }

    @Test
    fun `getAverageForCurrentDay returns null for missing day`() {
        val averages = listOf(
            MovingAverage(dayOfMonth = 1, dayAverage = 10.0, cumulativeTotal = 10.0, cumulativeAveragePerDay = 10.0),
        )
        assertNull(DashboardViewModel.getAverageForCurrentDay(averages, 31))
    }

    @Test
    fun `getAverageForCurrentDay returns null for empty list`() {
        assertNull(DashboardViewModel.getAverageForCurrentDay(emptyList(), 1))
    }

    // ── getCurrentBalance ───────────────────────────────────────────────

    @Test
    fun `getCurrentBalance returns availableBalance for deposit accounts`() {
        val balance = AccountBalance(
            id = 1,
            currentBalance = 1000.0,
            availableBalance = 950.0,
            plaidAccount = PlaidAccount(id = 1, accountType = "deposit"),
        )
        assertEquals(950.0, DashboardViewModel.getCurrentBalance(balance))
    }

    @Test
    fun `getCurrentBalance returns currentBalance for credit accounts`() {
        val balance = AccountBalance(
            id = 1,
            currentBalance = 500.0,
            availableBalance = 1000.0,
            plaidAccount = PlaidAccount(id = 1, accountType = "credit"),
        )
        assertEquals(500.0, DashboardViewModel.getCurrentBalance(balance))
    }

    @Test
    fun `getCurrentBalance returns zero when deposit has null availableBalance`() {
        val balance = AccountBalance(
            id = 1,
            currentBalance = 1000.0,
            availableBalance = null,
            plaidAccount = PlaidAccount(id = 1, accountType = "deposit"),
        )
        assertEquals(0.0, DashboardViewModel.getCurrentBalance(balance))
    }

    @Test
    fun `getCurrentBalance returns currentBalance for loan accounts`() {
        val balance = AccountBalance(
            id = 1,
            currentBalance = 25000.0,
            availableBalance = 0.0,
            plaidAccount = PlaidAccount(id = 1, accountType = "loan"),
        )
        assertEquals(25000.0, DashboardViewModel.getCurrentBalance(balance))
    }

    @Test
    fun `getCurrentBalance returns currentBalance when plaidAccount is null`() {
        val balance = AccountBalance(
            id = 1,
            currentBalance = 750.0,
            availableBalance = 500.0,
            plaidAccount = null,
        )
        assertEquals(750.0, DashboardViewModel.getCurrentBalance(balance))
    }
}
