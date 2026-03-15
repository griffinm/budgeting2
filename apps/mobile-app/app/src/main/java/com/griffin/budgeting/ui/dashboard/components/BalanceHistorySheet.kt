package com.griffin.budgeting.ui.dashboard.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.griffin.budgeting.data.model.AccountBalance
import com.griffin.budgeting.data.model.AccountBalanceHistory
import com.griffin.budgeting.data.repository.AccountBalanceRepository
import com.griffin.budgeting.ui.common.formatCurrency
import com.griffin.budgeting.ui.dashboard.DashboardViewModel
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.DarkSurfaceElevated
import com.griffin.budgeting.ui.theme.InterFontFamily
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextSecondary
import com.patrykandpatrick.vico.compose.cartesian.CartesianChartHost
import com.patrykandpatrick.vico.compose.cartesian.axis.rememberBottom
import com.patrykandpatrick.vico.compose.cartesian.axis.rememberStart
import com.patrykandpatrick.vico.compose.cartesian.layer.rememberLineCartesianLayer
import com.patrykandpatrick.vico.compose.cartesian.rememberCartesianChart
import com.patrykandpatrick.vico.compose.common.fill
import com.patrykandpatrick.vico.core.cartesian.axis.HorizontalAxis
import com.patrykandpatrick.vico.core.cartesian.axis.VerticalAxis
import com.patrykandpatrick.vico.core.cartesian.data.CartesianChartModelProducer
import com.patrykandpatrick.vico.core.cartesian.data.lineSeries
import com.patrykandpatrick.vico.compose.cartesian.layer.rememberLine
import com.patrykandpatrick.vico.core.cartesian.layer.LineCartesianLayer
import androidx.compose.ui.text.TextStyle

private val TIME_RANGES = listOf("1m", "3m", "6m", "12m", "all")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BalanceHistorySheet(
    accountBalance: AccountBalance,
    accountBalanceRepository: AccountBalanceRepository,
    onDismiss: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var timeRange by remember { mutableStateOf("3m") }
    var history by remember { mutableStateOf<List<AccountBalanceHistory>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    val modelProducer = remember { CartesianChartModelProducer() }

    val plaidAccountId = accountBalance.plaidAccount?.id ?: return

    LaunchedEffect(plaidAccountId, timeRange) {
        loading = true
        val result = accountBalanceRepository.getBalanceHistory(plaidAccountId, timeRange)
        result.onSuccess { data ->
            history = data
            if (data.isNotEmpty()) {
                modelProducer.runTransaction {
                    lineSeries {
                        series(data.map { it.currentBalance })
                    }
                }
            }
        }
        loading = false
    }

    val displayName = accountBalance.plaidAccount?.nickname?.takeIf { it.isNotBlank() }
        ?: accountBalance.plaidAccount?.plaidOfficialName
        ?: "Account"
    val currentBal = DashboardViewModel.getCurrentBalance(accountBalance)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = DarkSurfaceElevated,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp)
                .padding(bottom = 32.dp),
        ) {
            Text(
                displayName,
                style = PremiumTypography.body.copy(fontWeight = FontWeight.Medium),
                color = TextSecondary,
            )
            Text(
                formatCurrency(currentBal),
                style = TextStyle(
                    fontFamily = InterFontFamily,
                    fontWeight = FontWeight.Bold,
                    fontSize = 28.sp,
                ),
                color = AccentCyan,
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                TIME_RANGES.forEach { range ->
                    PremiumFilterChip(
                        selected = timeRange == range,
                        onClick = { timeRange = range },
                        label = range,
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (loading) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.CenterHorizontally),
                    color = AccentCyan,
                )
            } else if (history.isNotEmpty()) {
                CartesianChartHost(
                    chart = rememberCartesianChart(
                        rememberLineCartesianLayer(
                            lineProvider = LineCartesianLayer.LineProvider.series(
                                LineCartesianLayer.rememberLine(
                                    fill = LineCartesianLayer.LineFill.single(fill(AccentCyan)),
                                ),
                            ),
                        ),
                        startAxis = VerticalAxis.rememberStart(
                            label = rememberPremiumAxisLabel(),
                        ),
                        bottomAxis = HorizontalAxis.rememberBottom(
                            label = rememberPremiumAxisLabel(),
                        ),
                    ),
                    modelProducer = modelProducer,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(250.dp),
                )
            } else {
                Text(
                    "No balance history available",
                    style = PremiumTypography.body,
                    color = TextSecondary,
                    modifier = Modifier.align(Alignment.CenterHorizontally),
                )
            }
        }
    }
}
