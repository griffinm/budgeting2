package com.griffin.budgeting.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.griffin.budgeting.data.local.TokenStore
import com.griffin.budgeting.data.model.AccountBalance
import com.griffin.budgeting.data.model.MovingAverage
import com.griffin.budgeting.data.model.Transaction
import com.griffin.budgeting.data.repository.AccountBalanceRepository
import com.griffin.budgeting.data.repository.DashboardRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.inject.Inject
import kotlin.math.abs
import kotlin.math.roundToLong

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val dashboardRepository: DashboardRepository,
    val accountBalanceRepository: AccountBalanceRepository,
    private val tokenStore: TokenStore,
) : ViewModel() {

    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    private val _profitAndLossMonthsBack = MutableStateFlow(12)
    val profitAndLossMonthsBack: StateFlow<Int> = _profitAndLossMonthsBack.asStateFlow()

    init {
        loadDashboard()
    }

    fun loadDashboard() {
        viewModelScope.launch {
            _uiState.value = DashboardUiState.Loading
            try {
                val today = LocalDate.now()
                val firstOfMonth = today.withDayOfMonth(1)
                val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")

                val balancesDeferred = async { dashboardRepository.getAccountBalances() }
                val pnlDeferred = async { dashboardRepository.getProfitAndLoss(_profitAndLossMonthsBack.value) }
                val spendAvgDeferred = async { dashboardRepository.getSpendMovingAverage() }
                val incomeAvgDeferred = async { dashboardRepository.getIncomeMovingAverage() }
                val expenseTxDeferred = async { dashboardRepository.getCurrentMonthTransactions("expense") }
                val incomeTxDeferred = async { dashboardRepository.getCurrentMonthTransactions("income") }
                val categorySpendDeferred = async {
                    dashboardRepository.getCategorySpendStats(
                        firstOfMonth.format(formatter),
                        today.format(formatter),
                    )
                }
                val syncEventDeferred = async { dashboardRepository.getLatestSyncEvent() }

                val balances = balancesDeferred.await().getOrThrow()
                val profitAndLoss = pnlDeferred.await().getOrThrow()
                val spendMovingAverage = spendAvgDeferred.await().getOrThrow()
                val incomeMovingAverage = incomeAvgDeferred.await().getOrThrow()
                val expenseTransactions = expenseTxDeferred.await().getOrThrow()
                val incomeTransactions = incomeTxDeferred.await().getOrThrow()

                val categorySpend = categorySpendDeferred.await().getOrDefault(emptyList())
                    .filter { it.isLeaf && (it.totalTransactionAmount ?: 0.0) != 0.0 }
                    .sortedByDescending { abs(it.totalTransactionAmount ?: 0.0) }
                    .take(10)

                val syncEvent = syncEventDeferred.await().getOrNull()

                val currentDay = today.dayOfMonth

                val availableCash = computeAvailableCash(balances)
                val expensesThisMonth = getDailyRunningTotal(expenseTransactions, currentDay, "expense")
                val incomeThisMonth = getDailyRunningTotal(incomeTransactions, currentDay, "income")
                val profitThisMonth = incomeThisMonth - expensesThisMonth

                val expenseAvgByToday = getAverageForCurrentDay(spendMovingAverage, currentDay)?.cumulativeTotal ?: 0.0
                val incomeAvgByToday = getAverageForCurrentDay(incomeMovingAverage, currentDay)?.cumulativeTotal ?: 0.0

                val expenseChange = getPercentChange(expensesThisMonth, expenseAvgByToday)
                val incomeChange = getPercentChange(incomeThisMonth, incomeAvgByToday)

                val avgProfitByToday = incomeAvgByToday - expenseAvgByToday
                val profitChange = if (avgProfitByToday != 0.0) {
                    val change = ((profitThisMonth - avgProfitByToday) / abs(avgProfitByToday)) * 100
                    if (change.isFinite()) (change * 10).roundToLong() / 10.0 else 0.0
                } else 0.0

                val balancesByType = balances
                    .filter { it.plaidAccount != null }
                    .groupBy { it.plaidAccount!!.accountType ?: "other" }

                val recentTransactions = (expenseTransactions + incomeTransactions)
                    .sortedByDescending { it.date }
                    .take(5)

                val userName = tokenStore.getUser()?.firstName ?: ""

                _uiState.value = DashboardUiState.Success(
                    availableCash = availableCash,
                    expensesThisMonth = expensesThisMonth,
                    incomeThisMonth = incomeThisMonth,
                    profitThisMonth = profitThisMonth,
                    expensePercentChange = expenseChange,
                    incomePercentChange = incomeChange,
                    profitPercentChange = profitChange,
                    balancesByType = balancesByType,
                    profitAndLoss = profitAndLoss,
                    spendMovingAverage = spendMovingAverage,
                    incomeMovingAverage = incomeMovingAverage,
                    expenseTransactions = expenseTransactions,
                    incomeTransactions = incomeTransactions,
                    categorySpend = categorySpend,
                    recentTransactions = recentTransactions,
                    lastSyncAt = syncEvent?.completedAt,
                    userName = userName,
                )
            } catch (e: Exception) {
                _uiState.value = DashboardUiState.Error(e.message ?: "Failed to load dashboard")
            }
        }
    }

    fun updateProfitAndLossMonthsBack(months: Int) {
        _profitAndLossMonthsBack.value = months
        viewModelScope.launch {
            val currentState = _uiState.value
            if (currentState is DashboardUiState.Success) {
                try {
                    val pnl = dashboardRepository.getProfitAndLoss(months).getOrThrow()
                    _uiState.value = currentState.copy(profitAndLoss = pnl)
                } catch (_: Exception) {
                    // Keep current state on failure
                }
            }
        }
    }

    companion object {
        fun getCurrentBalance(balance: AccountBalance): Double {
            return if (balance.plaidAccount?.accountType == "deposit") {
                balance.availableBalance ?: 0.0
            } else {
                balance.currentBalance
            }
        }

        fun computeAvailableCash(balances: List<AccountBalance>): Double {
            return balances.fold(0.0) { sum, ab ->
                val type = ab.plaidAccount?.accountType
                if (type != "deposit" && type != "credit") return@fold sum
                val balance = getCurrentBalance(ab)
                if (type == "credit") {
                    sum - abs(balance)
                } else {
                    sum + balance
                }
            }
        }

        fun getDailyRunningTotal(
            transactions: List<Transaction>,
            toDay: Int,
            transactionType: String,
        ): Double {
            val now = LocalDate.now()
            val currentMonth = now.monthValue
            val currentYear = now.year

            val total = transactions
                .filter { tx ->
                    val dateParts = tx.date.split("T")[0].split("-")
                    val txYear = dateParts[0].toIntOrNull() ?: return@filter false
                    val txMonth = dateParts[1].toIntOrNull() ?: return@filter false
                    val txDay = dateParts[2].toIntOrNull() ?: return@filter false
                    txYear == currentYear && txMonth == currentMonth && txDay <= toDay && tx.transactionType == transactionType
                }
                .sumOf { abs(it.amount) }

            return (total * 100).roundToLong() / 100.0
        }

        fun getAverageForCurrentDay(
            movingAverage: List<MovingAverage>,
            currentDay: Int,
        ): MovingAverage? {
            return movingAverage.find { it.dayOfMonth == currentDay }
        }

        fun getPercentChange(totalThisMonth: Double, averageByToday: Double): Double {
            if (averageByToday == 0.0) return 0.0
            val change = ((totalThisMonth - averageByToday) / averageByToday) * 100
            return if (change.isFinite()) (change * 10).roundToLong() / 10.0 else 0.0
        }
    }
}
