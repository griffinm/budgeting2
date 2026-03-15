package com.griffin.budgeting.ui.dashboard.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.griffin.budgeting.data.model.MerchantCategory
import com.griffin.budgeting.ui.common.formatCurrencyCompact
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.InterFontFamily
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextSecondary
import com.griffin.budgeting.ui.theme.TextTertiary
import kotlin.math.abs
import kotlin.math.min

@Composable
fun CategorySpendRow(
    categorySpend: List<MerchantCategory>,
    modifier: Modifier = Modifier,
) {
    if (categorySpend.isEmpty()) return

    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = "SPENDING",
            style = PremiumTypography.sectionLabel,
            color = TextSecondary,
            modifier = Modifier.padding(horizontal = 0.dp),
        )

        Spacer(modifier = Modifier.height(12.dp))

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(end = 16.dp),
        ) {
            items(categorySpend) { category ->
                CategoryCard(category = category)
            }
        }
    }
}

@Composable
private fun CategoryCard(
    category: MerchantCategory,
) {
    val categoryColor = category.color?.let { parseHexColor(it) } ?: AccentCyan
    val spendAmount = abs(category.totalTransactionAmount ?: 0.0)
    val budgetRatio = if (category.targetBudget != null && category.targetBudget > 0) {
        min(spendAmount / category.targetBudget, 1.0).toFloat()
    } else null

    Box(
        modifier = Modifier
            .width(120.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(
                Brush.linearGradient(
                    colors = listOf(
                        Color.White.copy(alpha = 0.06f),
                        Color.White.copy(alpha = 0.02f),
                    ),
                )
            )
            .background(GlassBorder)
            .padding(12.dp),
    ) {
        Column {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(categoryColor),
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = category.name,
                style = TextStyle(
                    fontFamily = InterFontFamily,
                    fontWeight = FontWeight.Medium,
                    fontSize = 12.sp,
                ),
                color = TextPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = formatCurrencyCompact(spendAmount),
                style = TextStyle(
                    fontFamily = InterFontFamily,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp,
                ),
                color = TextPrimary,
            )

            if (budgetRatio != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Box(contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(
                        progress = { budgetRatio },
                        modifier = Modifier.size(28.dp),
                        color = categoryColor,
                        trackColor = Color.White.copy(alpha = 0.1f),
                        strokeWidth = 3.dp,
                    )
                    Text(
                        text = "${(budgetRatio * 100).toInt()}%",
                        style = TextStyle(
                            fontFamily = InterFontFamily,
                            fontSize = 7.sp,
                            fontWeight = FontWeight.Bold,
                        ),
                        color = TextTertiary,
                    )
                }
            }
        }
    }
}

private fun parseHexColor(hex: String): Color {
    return try {
        val cleanHex = hex.removePrefix("#")
        val colorLong = cleanHex.toLong(16)
        when (cleanHex.length) {
            6 -> Color(0xFF000000 or colorLong)
            8 -> Color(colorLong)
            else -> AccentCyan
        }
    } catch (_: Exception) {
        AccentCyan
    }
}
