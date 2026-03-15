package com.griffin.budgeting.ui.dashboard

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.data.model.AccountBalance
import com.griffin.budgeting.ui.dashboard.components.AccountBalancesCard
import com.griffin.budgeting.ui.dashboard.components.BalanceHistorySheet
import com.griffin.budgeting.ui.dashboard.components.CategorySpendRow
import com.griffin.budgeting.ui.dashboard.components.DashboardHeader
import com.griffin.budgeting.ui.dashboard.components.HeroCashSection
import com.griffin.budgeting.ui.dashboard.components.MonthlyTrendsChart
import com.griffin.budgeting.ui.dashboard.components.ProfitAndLossChart
import com.griffin.budgeting.ui.dashboard.components.RecentTransactionsCard
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.BudgetingPremiumTheme
import com.griffin.budgeting.ui.theme.DarkBackground
import com.griffin.budgeting.ui.theme.PremiumRed
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
) {
    BudgetingPremiumTheme {
        val uiState by viewModel.uiState.collectAsState()
        val monthsBack by viewModel.profitAndLossMonthsBack.collectAsState()
        var selectedBalanceAccount by remember { mutableStateOf<AccountBalance?>(null) }

        when (val state = uiState) {
            is DashboardUiState.Loading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(DarkBackground),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator(color = AccentCyan)
                }
            }
            is DashboardUiState.Error -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(DarkBackground),
                    contentAlignment = Alignment.Center,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = state.message,
                            color = PremiumRed,
                            style = PremiumTypography.body,
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = viewModel::loadDashboard,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = AccentCyan,
                                contentColor = DarkBackground,
                            ),
                        ) {
                            Text("Retry")
                        }
                    }
                }
            }
            is DashboardUiState.Success -> {
                var visibleSections by remember { mutableStateOf(0) }

                LaunchedEffect(Unit) {
                    for (i in 1..8) {
                        delay(50)
                        visibleSections = i
                    }
                }

                PullToRefreshBox(
                    isRefreshing = false,
                    onRefresh = {
                        visibleSections = 0
                        viewModel.loadDashboard()
                    },
                ) {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(DarkBackground)
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(24.dp),
                    ) {
                        item {
                            Spacer(modifier = Modifier.height(8.dp))
                            StaggeredSection(visible = visibleSections >= 1) {
                                DashboardHeader(
                                    userName = state.userName,
                                    lastSyncAt = state.lastSyncAt,
                                )
                            }
                        }

                        item {
                            StaggeredSection(visible = visibleSections >= 2) {
                                HeroCashSection(
                                    availableCash = state.availableCash,
                                    expensesThisMonth = state.expensesThisMonth,
                                    incomeThisMonth = state.incomeThisMonth,
                                    profitThisMonth = state.profitThisMonth,
                                    expensePercentChange = state.expensePercentChange,
                                    incomePercentChange = state.incomePercentChange,
                                    profitPercentChange = state.profitPercentChange,
                                )
                            }
                        }

                        if (state.categorySpend.isNotEmpty()) {
                            item {
                                StaggeredSection(visible = visibleSections >= 3) {
                                    CategorySpendRow(
                                        categorySpend = state.categorySpend,
                                    )
                                }
                            }
                        }

                        if (state.recentTransactions.isNotEmpty()) {
                            item {
                                StaggeredSection(visible = visibleSections >= 4) {
                                    RecentTransactionsCard(
                                        transactions = state.recentTransactions,
                                    )
                                }
                            }
                        }

                        item {
                            StaggeredSection(visible = visibleSections >= 5) {
                                MonthlyTrendsChart(
                                    expenseTransactions = state.expenseTransactions,
                                    incomeTransactions = state.incomeTransactions,
                                    spendMovingAverage = state.spendMovingAverage,
                                    incomeMovingAverage = state.incomeMovingAverage,
                                )
                            }
                        }

                        item {
                            StaggeredSection(visible = visibleSections >= 6) {
                                ProfitAndLossChart(
                                    profitAndLoss = state.profitAndLoss,
                                    monthsBack = monthsBack,
                                    onMonthsBackChange = viewModel::updateProfitAndLossMonthsBack,
                                )
                            }
                        }

                        item {
                            StaggeredSection(visible = visibleSections >= 7) {
                                AccountBalancesCard(
                                    balancesByType = state.balancesByType,
                                    onChartClick = { accountBalance ->
                                        selectedBalanceAccount = accountBalance
                                    },
                                )
                            }
                        }

                        item {
                            Spacer(modifier = Modifier.height(80.dp))
                        }
                    }
                }

                selectedBalanceAccount?.let { accountBalance ->
                    BalanceHistorySheet(
                        accountBalance = accountBalance,
                        accountBalanceRepository = viewModel.accountBalanceRepository,
                        onDismiss = { selectedBalanceAccount = null },
                    )
                }
            }
        }
    }
}

@Composable
private fun StaggeredSection(
    visible: Boolean,
    content: @Composable () -> Unit,
) {
    AnimatedVisibility(
        visible = visible,
        enter = fadeIn(animationSpec = tween(300)) +
            slideInVertically(
                animationSpec = tween(300),
                initialOffsetY = { it / 4 },
            ),
    ) {
        content()
    }
}
