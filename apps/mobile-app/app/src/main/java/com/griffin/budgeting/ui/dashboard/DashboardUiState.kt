package com.griffin.budgeting.ui.dashboard

import com.griffin.budgeting.data.model.AccountBalance
import com.griffin.budgeting.data.model.MerchantCategory
import com.griffin.budgeting.data.model.MovingAverage
import com.griffin.budgeting.data.model.ProfitAndLossItem
import com.griffin.budgeting.data.model.Transaction

sealed class DashboardUiState {
    data object Loading : DashboardUiState()
    data class Success(
        val availableCash: Double,
        val expensesThisMonth: Double,
        val incomeThisMonth: Double,
        val profitThisMonth: Double,
        val expensePercentChange: Double,
        val incomePercentChange: Double,
        val profitPercentChange: Double,
        val balancesByType: Map<String, List<AccountBalance>>,
        val profitAndLoss: List<ProfitAndLossItem>,
        val spendMovingAverage: List<MovingAverage>,
        val incomeMovingAverage: List<MovingAverage>,
        val expenseTransactions: List<Transaction>,
        val incomeTransactions: List<Transaction>,
        val categorySpend: List<MerchantCategory> = emptyList(),
        val recentTransactions: List<Transaction> = emptyList(),
        val lastSyncAt: String? = null,
        val userName: String = "",
    ) : DashboardUiState()
    data class Error(val message: String) : DashboardUiState()
}
