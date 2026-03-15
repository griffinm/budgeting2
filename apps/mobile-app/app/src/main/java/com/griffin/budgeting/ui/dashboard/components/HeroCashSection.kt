package com.griffin.budgeting.ui.dashboard.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.griffin.budgeting.ui.common.AnimatedCounter
import com.griffin.budgeting.ui.common.formatCurrency
import com.griffin.budgeting.ui.common.formatCurrencyCompact
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.AccentPurple
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.InterFontFamily
import com.griffin.budgeting.ui.theme.PremiumGreen
import com.griffin.budgeting.ui.theme.PremiumRed
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextSecondary
import com.griffin.budgeting.ui.theme.TextTertiary

@Composable
fun HeroCashSection(
    availableCash: Double,
    expensesThisMonth: Double,
    incomeThisMonth: Double,
    profitThisMonth: Double,
    expensePercentChange: Double,
    incomePercentChange: Double,
    profitPercentChange: Double,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = "AVAILABLE CASH",
            style = TextStyle(
                fontFamily = InterFontFamily,
                fontWeight = FontWeight.Medium,
                fontSize = 11.sp,
                letterSpacing = 1.5.sp,
            ),
            color = TextTertiary,
        )

        Spacer(modifier = Modifier.height(8.dp))

        AnimatedCounter(
            targetValue = availableCash,
            formatFn = ::formatCurrency,
            style = PremiumTypography.hero.copy(color = AccentCyan),
        )

        Spacer(modifier = Modifier.height(12.dp))

        GradientDivider()

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            MetricPill(
                label = "Expenses",
                value = expensesThisMonth,
                percentChange = expensePercentChange,
                isPositive = expensePercentChange <= 0,
                modifier = Modifier.weight(1f),
            )
            MetricPill(
                label = "Income",
                value = incomeThisMonth,
                percentChange = incomePercentChange,
                isPositive = incomePercentChange >= 0,
                modifier = Modifier.weight(1f),
            )
            MetricPill(
                label = "Profit",
                value = profitThisMonth,
                percentChange = profitPercentChange,
                isPositive = profitPercentChange >= 0,
                modifier = Modifier.weight(1f),
            )
        }
    }
}

@Composable
private fun GradientDivider() {
    val infiniteTransition = rememberInfiniteTransition(label = "divider")
    val offset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(3000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "dividerOffset",
    )

    Box(
        modifier = Modifier
            .fillMaxWidth(0.6f)
            .height(2.dp)
            .clip(RoundedCornerShape(1.dp))
            .background(
                Brush.linearGradient(
                    colors = listOf(AccentCyan, AccentPurple),
                    start = Offset(offset, 0f),
                    end = Offset(offset + 400f, 0f),
                )
            )
    )
}

@Composable
private fun MetricPill(
    label: String,
    value: Double,
    percentChange: Double,
    isPositive: Boolean,
    modifier: Modifier = Modifier,
) {
    val badgeColor = if (isPositive) PremiumGreen else PremiumRed

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(
                Brush.linearGradient(
                    colors = listOf(
                        Color.White.copy(alpha = 0.06f),
                        Color.White.copy(alpha = 0.02f),
                    ),
                )
            )
            .background(GlassBorder)
            .padding(10.dp),
    ) {
        Column {
            Text(
                text = label,
                style = TextStyle(
                    fontFamily = InterFontFamily,
                    fontWeight = FontWeight.Medium,
                    fontSize = 10.sp,
                ),
                color = TextSecondary,
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = formatCurrencyCompact(value),
                style = TextStyle(
                    fontFamily = InterFontFamily,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 15.sp,
                ),
                color = TextPrimary,
            )
            Spacer(modifier = Modifier.height(4.dp))
            val sign = if (percentChange >= 0) "+" else ""
            Text(
                text = "${sign}${percentChange}%",
                style = TextStyle(
                    fontFamily = InterFontFamily,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 10.sp,
                ),
                color = badgeColor,
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(badgeColor.copy(alpha = 0.15f))
                    .padding(horizontal = 4.dp, vertical = 1.dp),
            )
        }
    }
}
