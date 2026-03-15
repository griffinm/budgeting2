package com.griffin.budgeting.ui.dashboard.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.data.model.MovingAverage
import com.griffin.budgeting.data.model.Transaction
import com.griffin.budgeting.ui.common.GlassCard
import com.griffin.budgeting.ui.dashboard.DashboardViewModel
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.DarkSurface
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextSecondary
import com.griffin.budgeting.ui.theme.TextTertiary
import com.patrykandpatrick.vico.compose.cartesian.CartesianChartHost
import com.patrykandpatrick.vico.compose.cartesian.axis.rememberBottom
import com.patrykandpatrick.vico.compose.cartesian.axis.rememberStart
import com.patrykandpatrick.vico.compose.cartesian.layer.rememberLineCartesianLayer
import com.patrykandpatrick.vico.compose.cartesian.rememberCartesianChart
import com.patrykandpatrick.vico.compose.cartesian.rememberVicoScrollState
import com.patrykandpatrick.vico.compose.cartesian.rememberVicoZoomState
import com.patrykandpatrick.vico.compose.common.fill
import com.patrykandpatrick.vico.core.cartesian.Zoom
import com.patrykandpatrick.vico.core.cartesian.axis.HorizontalAxis
import com.patrykandpatrick.vico.core.cartesian.axis.VerticalAxis
import com.patrykandpatrick.vico.core.cartesian.data.CartesianChartModelProducer
import com.patrykandpatrick.vico.core.cartesian.data.CartesianValueFormatter
import com.patrykandpatrick.vico.core.cartesian.data.lineSeries
import com.patrykandpatrick.vico.compose.cartesian.layer.rememberLine
import com.patrykandpatrick.vico.compose.common.component.rememberTextComponent
import com.patrykandpatrick.vico.core.cartesian.layer.LineCartesianLayer
import com.patrykandpatrick.vico.core.common.component.TextComponent
import java.time.LocalDate
import java.time.YearMonth

@Composable
fun MonthlyTrendsChart(
    expenseTransactions: List<Transaction>,
    incomeTransactions: List<Transaction>,
    spendMovingAverage: List<MovingAverage>,
    incomeMovingAverage: List<MovingAverage>,
    modifier: Modifier = Modifier,
) {
    var showSpending by remember { mutableStateOf(true) }
    val modelProducer = remember { CartesianChartModelProducer() }

    val transactions = if (showSpending) expenseTransactions else incomeTransactions
    val movingAverage = if (showSpending) spendMovingAverage else incomeMovingAverage
    val transactionType = if (showSpending) "expense" else "income"

    LaunchedEffect(transactions, movingAverage, showSpending) {
        val today = LocalDate.now()
        val currentDay = today.dayOfMonth
        val daysInMonth = YearMonth.now().lengthOfMonth()

        val currentMonthX = mutableListOf<Number>()
        val currentMonthLine = mutableListOf<Number>()
        val averageX = mutableListOf<Number>()
        val averageLine = mutableListOf<Number>()

        for (day in 1..daysInMonth) {
            if (day <= currentDay) {
                currentMonthX.add(day - 1)
                currentMonthLine.add(
                    DashboardViewModel.getDailyRunningTotal(transactions, day, transactionType)
                )
            }

            averageX.add(day - 1)
            val avgEntry = movingAverage.find { it.dayOfMonth == day }
            averageLine.add(avgEntry?.cumulativeTotal ?: averageLine.lastOrNull() ?: 0)
        }

        if (currentMonthLine.isNotEmpty()) {
            modelProducer.runTransaction {
                lineSeries {
                    series(x = currentMonthX, y = currentMonthLine)
                    series(x = averageX, y = averageLine)
                }
            }
        }
    }

    val bottomAxisValueFormatter = CartesianValueFormatter { _, x, _ ->
        "${x.toInt() + 1}"
    }

    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = "MONTHLY TRENDS",
            style = PremiumTypography.sectionLabel,
            color = TextSecondary,
        )

        Spacer(modifier = Modifier.height(12.dp))

        GlassCard(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    PremiumFilterChip(
                        selected = showSpending,
                        onClick = { showSpending = true },
                        label = "Spending",
                    )
                    PremiumFilterChip(
                        selected = !showSpending,
                        onClick = { showSpending = false },
                        label = "Income",
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                CartesianChartHost(
                    chart = rememberCartesianChart(
                        rememberLineCartesianLayer(
                            lineProvider = LineCartesianLayer.LineProvider.series(
                                LineCartesianLayer.rememberLine(
                                    fill = LineCartesianLayer.LineFill.single(fill(AccentCyan)),
                                ),
                                LineCartesianLayer.rememberLine(
                                    fill = LineCartesianLayer.LineFill.single(fill(TextTertiary)),
                                ),
                            ),
                        ),
                        startAxis = VerticalAxis.rememberStart(
                            label = rememberPremiumAxisLabel(),
                            valueFormatter = CartesianValueFormatter { _, value, _ ->
                                val rounded = Math.round(value.toDouble() / 100.0) * 100
                                val thousands = rounded / 1000.0
                                if (thousands == thousands.toLong().toDouble()) {
                                    "${thousands.toLong()}k"
                                } else {
                                    "${"%.1f".format(thousands)}k"
                                }
                            },
                        ),
                        bottomAxis = HorizontalAxis.rememberBottom(
                            valueFormatter = bottomAxisValueFormatter,
                            label = rememberPremiumAxisLabel(),
                        ),
                    ),
                    modelProducer = modelProducer,
                    scrollState = rememberVicoScrollState(scrollEnabled = false),
                    zoomState = rememberVicoZoomState(initialZoom = Zoom.Content, zoomEnabled = false),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(220.dp),
                )
            }
        }
    }
}

@Composable
fun PremiumFilterChip(
    selected: Boolean,
    onClick: () -> Unit,
    label: String,
) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        label = {
            Text(
                text = label,
                color = if (selected) DarkSurface else TextSecondary,
            )
        },
        colors = FilterChipDefaults.filterChipColors(
            containerColor = Color.Transparent,
            selectedContainerColor = AccentCyan,
            selectedLabelColor = DarkSurface,
        ),
        border = FilterChipDefaults.filterChipBorder(
            borderColor = GlassBorder,
            selectedBorderColor = AccentCyan,
            enabled = true,
            selected = selected,
        ),
    )
}

@Composable
fun rememberPremiumAxisLabel(): TextComponent {
    return rememberTextComponent(
        color = TextTertiary,
    )
}
