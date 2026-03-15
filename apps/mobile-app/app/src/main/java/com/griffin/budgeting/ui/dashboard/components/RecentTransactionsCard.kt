package com.griffin.budgeting.ui.dashboard.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.griffin.budgeting.data.model.Transaction
import com.griffin.budgeting.ui.common.GlassCard
import com.griffin.budgeting.ui.common.formatCurrency
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.InterFontFamily
import com.griffin.budgeting.ui.theme.PremiumGreen
import com.griffin.budgeting.ui.theme.PremiumRed
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextSecondary
import com.griffin.budgeting.ui.theme.TextTertiary
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

@Composable
fun RecentTransactionsCard(
    transactions: List<Transaction>,
    modifier: Modifier = Modifier,
) {
    if (transactions.isEmpty()) return

    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "RECENT TRANSACTIONS",
                style = PremiumTypography.sectionLabel,
                color = TextSecondary,
            )
            Text(
                text = "See All",
                style = TextStyle(
                    fontFamily = InterFontFamily,
                    fontWeight = FontWeight.Medium,
                    fontSize = 12.sp,
                ),
                color = AccentCyan,
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        GlassCard(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(14.dp)) {
                transactions.forEachIndexed { index, tx ->
                    TransactionRow(transaction = tx)
                    if (index < transactions.lastIndex) {
                        HorizontalDivider(
                            color = GlassBorder,
                            modifier = Modifier.padding(vertical = 8.dp),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun TransactionRow(transaction: Transaction) {
    val merchantName = transaction.merchant?.customName
        ?: transaction.merchant?.name
        ?: transaction.name
    val categoryColor = transaction.merchantTag?.color?.let { parseColor(it) } ?: TextTertiary
    val isExpense = transaction.transactionType == "expense"
    val amountColor = if (isExpense) PremiumRed else PremiumGreen
    val amountPrefix = if (isExpense) "-" else "+"

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(categoryColor),
            )
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Text(
                    text = merchantName,
                    style = TextStyle(
                        fontFamily = InterFontFamily,
                        fontWeight = FontWeight.Medium,
                        fontSize = 13.sp,
                    ),
                    color = TextPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    text = formatRelativeDate(transaction.date),
                    style = TextStyle(
                        fontFamily = InterFontFamily,
                        fontSize = 11.sp,
                    ),
                    color = TextTertiary,
                )
            }
        }
        Text(
            text = "${amountPrefix}${formatCurrency(kotlin.math.abs(transaction.amount))}",
            style = TextStyle(
                fontFamily = InterFontFamily,
                fontWeight = FontWeight.SemiBold,
                fontSize = 13.sp,
            ),
            color = amountColor,
        )
    }
}

private fun formatRelativeDate(dateString: String): String {
    return try {
        val date = LocalDate.parse(dateString.take(10))
        val today = LocalDate.now()
        val daysBetween = ChronoUnit.DAYS.between(date, today)
        when {
            daysBetween == 0L -> "Today"
            daysBetween == 1L -> "Yesterday"
            daysBetween < 7L -> "${daysBetween}d ago"
            else -> date.format(DateTimeFormatter.ofPattern("MMM d"))
        }
    } catch (_: Exception) {
        dateString.take(10)
    }
}

private fun parseColor(hex: String): Color {
    return try {
        val cleanHex = hex.removePrefix("#")
        val colorLong = cleanHex.toLong(16)
        when (cleanHex.length) {
            6 -> Color(0xFF000000 or colorLong)
            8 -> Color(colorLong)
            else -> TextTertiary
        }
    } catch (_: Exception) {
        TextTertiary
    }
}
