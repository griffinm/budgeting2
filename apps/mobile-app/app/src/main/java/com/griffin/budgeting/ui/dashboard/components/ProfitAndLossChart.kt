package com.griffin.budgeting.ui.dashboard.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.data.model.ProfitAndLossItem
import com.griffin.budgeting.ui.common.GlassCard
import com.griffin.budgeting.ui.theme.PremiumGreen
import com.griffin.budgeting.ui.theme.PremiumRed
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextSecondary
import com.patrykandpatrick.vico.compose.cartesian.CartesianChartHost
import com.patrykandpatrick.vico.compose.cartesian.axis.rememberBottom
import com.patrykandpatrick.vico.compose.cartesian.axis.rememberStart
import com.patrykandpatrick.vico.compose.cartesian.layer.rememberColumnCartesianLayer
import com.patrykandpatrick.vico.compose.cartesian.rememberCartesianChart
import com.patrykandpatrick.vico.compose.common.component.rememberLineComponent
import com.patrykandpatrick.vico.compose.common.fill
import com.patrykandpatrick.vico.core.cartesian.axis.HorizontalAxis
import com.patrykandpatrick.vico.core.cartesian.axis.VerticalAxis
import com.patrykandpatrick.vico.core.cartesian.data.CartesianChartModelProducer
import com.patrykandpatrick.vico.core.cartesian.data.CartesianValueFormatter
import com.patrykandpatrick.vico.core.cartesian.data.columnSeries
import com.patrykandpatrick.vico.core.cartesian.layer.ColumnCartesianLayer
import com.patrykandpatrick.vico.core.common.data.ExtraStore
import java.time.LocalDate
import java.time.format.TextStyle as JavaTextStyle
import java.util.Locale

private val MONTHS_BACK_OPTIONS = listOf(3, 6, 12, 24)

@Composable
fun ProfitAndLossChart(
    profitAndLoss: List<ProfitAndLossItem>,
    monthsBack: Int,
    onMonthsBackChange: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    val modelProducer = remember { CartesianChartModelProducer() }
    val monthLabelsKey = remember { ExtraStore.Key<List<String>>() }

    LaunchedEffect(profitAndLoss) {
        if (profitAndLoss.isEmpty()) return@LaunchedEffect
        val expenses = profitAndLoss.map { it.expense }
        val incomes = profitAndLoss.map { it.income }
        val labels = profitAndLoss.map { item ->
            try {
                val date = LocalDate.parse(item.date.take(10))
                date.month.getDisplayName(JavaTextStyle.SHORT, Locale.US)
            } catch (_: Exception) {
                item.date.take(7)
            }
        }
        modelProducer.runTransaction {
            columnSeries {
                series(expenses)
                series(incomes)
            }
            extras { it[monthLabelsKey] = labels }
        }
    }

    val bottomAxisValueFormatter = CartesianValueFormatter { context, x, _ ->
        context.model.extraStore.getOrNull(monthLabelsKey)
            ?.getOrNull(x.toInt()) ?: ""
    }

    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = "PROFIT & LOSS",
            style = PremiumTypography.sectionLabel,
            color = TextSecondary,
        )

        Spacer(modifier = Modifier.height(12.dp))

        GlassCard(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    MONTHS_BACK_OPTIONS.forEach { months ->
                        PremiumFilterChip(
                            selected = monthsBack == months,
                            onClick = { onMonthsBackChange(months) },
                            label = "${months}m",
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                if (profitAndLoss.isNotEmpty()) {
                    CartesianChartHost(
                        chart = rememberCartesianChart(
                            rememberColumnCartesianLayer(
                                columnProvider = ColumnCartesianLayer.ColumnProvider.series(
                                    rememberLineComponent(
                                        fill = fill(PremiumRed),
                                        thickness = 12.dp,
                                    ),
                                    rememberLineComponent(
                                        fill = fill(PremiumGreen),
                                        thickness = 12.dp,
                                    ),
                                ),
                            ),
                            startAxis = VerticalAxis.rememberStart(
                                label = rememberPremiumAxisLabel(),
                            ),
                            bottomAxis = HorizontalAxis.rememberBottom(
                                valueFormatter = bottomAxisValueFormatter,
                                label = rememberPremiumAxisLabel(),
                            ),
                        ),
                        modelProducer = modelProducer,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(220.dp),
                    )
                } else {
                    Text(
                        "No data available",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary,
                    )
                }
            }
        }
    }
}
