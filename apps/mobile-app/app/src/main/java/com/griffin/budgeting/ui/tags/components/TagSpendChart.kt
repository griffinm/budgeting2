package com.griffin.budgeting.ui.tags.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.data.model.TagSpendStats
import com.griffin.budgeting.ui.common.GlassCard
import com.griffin.budgeting.ui.dashboard.components.rememberPremiumAxisLabel
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextSecondary
import com.patrykandpatrick.vico.compose.cartesian.CartesianChartHost
import com.patrykandpatrick.vico.compose.cartesian.axis.rememberBottom
import com.patrykandpatrick.vico.compose.cartesian.axis.rememberStart
import com.patrykandpatrick.vico.compose.cartesian.layer.rememberColumnCartesianLayer
import com.patrykandpatrick.vico.compose.cartesian.rememberCartesianChart
import com.patrykandpatrick.vico.compose.cartesian.rememberVicoScrollState
import com.patrykandpatrick.vico.compose.cartesian.rememberVicoZoomState
import com.patrykandpatrick.vico.compose.common.component.rememberLineComponent
import com.patrykandpatrick.vico.compose.common.fill
import com.patrykandpatrick.vico.core.cartesian.Zoom
import com.patrykandpatrick.vico.core.cartesian.axis.HorizontalAxis
import com.patrykandpatrick.vico.core.cartesian.axis.VerticalAxis
import com.patrykandpatrick.vico.core.cartesian.data.CartesianChartModelProducer
import com.patrykandpatrick.vico.core.cartesian.data.CartesianValueFormatter
import com.patrykandpatrick.vico.core.cartesian.data.columnSeries
import com.patrykandpatrick.vico.core.cartesian.layer.ColumnCartesianLayer
import com.patrykandpatrick.vico.core.common.data.ExtraStore
import java.time.Month
import java.time.format.TextStyle as JavaTextStyle
import java.util.Locale

@Composable
fun TagSpendChart(
    spendStats: List<TagSpendStats>,
    modifier: Modifier = Modifier,
) {
    val modelProducer = remember { CartesianChartModelProducer() }
    val monthLabelsKey = remember { ExtraStore.Key<List<String>>() }

    LaunchedEffect(spendStats) {
        if (spendStats.isEmpty()) return@LaunchedEffect

        // Aggregate spend by month across all tags
        val byMonth = spendStats
            .groupBy { it.year * 100 + it.month }
            .toSortedMap()
            .map { (key, items) ->
                val year = key / 100
                val month = key % 100
                Triple(year, month, items.sumOf { it.totalAmount })
            }

        val amounts = byMonth.map { it.third }
        val labels = byMonth.map { (_, month, _) ->
            try {
                Month.of(month).getDisplayName(JavaTextStyle.SHORT, Locale.US)
            } catch (_: Exception) {
                month.toString()
            }
        }

        modelProducer.runTransaction {
            columnSeries {
                series(amounts)
            }
            extras { it[monthLabelsKey] = labels }
        }
    }

    val bottomAxisValueFormatter = CartesianValueFormatter { context, x, _ ->
        context.model.extraStore.getOrNull(monthLabelsKey)
            ?.getOrNull(x.toInt()) ?: ""
    }

    GlassCard(modifier = modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                "TAG SPEND",
                style = PremiumTypography.sectionLabel,
                color = TextSecondary,
            )
            Spacer(modifier = Modifier.height(12.dp))

            if (spendStats.isNotEmpty()) {
                CartesianChartHost(
                    chart = rememberCartesianChart(
                        rememberColumnCartesianLayer(
                            columnProvider = ColumnCartesianLayer.ColumnProvider.series(
                                rememberLineComponent(
                                    fill = fill(AccentCyan),
                                    thickness = 8.dp,
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
                    scrollState = rememberVicoScrollState(scrollEnabled = false),
                    zoomState = rememberVicoZoomState(initialZoom = Zoom.Content, zoomEnabled = false),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(220.dp),
                )
            } else {
                Text(
                    "Select tags to view spend data",
                    style = PremiumTypography.body,
                    color = TextSecondary,
                )
            }
        }
    }
}
