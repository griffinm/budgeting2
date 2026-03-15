package com.griffin.budgeting.ui.transactions.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.StickyNote2
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.data.model.Transaction
import com.griffin.budgeting.ui.common.formatCurrency
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.PremiumGreen
import com.griffin.budgeting.ui.theme.PremiumRed
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextSecondary
import com.griffin.budgeting.ui.theme.TextTertiary
import com.griffin.budgeting.ui.theme.TransferBlue

@Composable
fun TransactionRow(
    transaction: Transaction,
    onTransactionTypeChanged: (transactionId: Int, newType: String, merchantId: Int?) -> Unit,
    onNoteClick: (Transaction) -> Unit,
    onTagAreaClick: (Transaction) -> Unit,
    modifier: Modifier = Modifier,
) {
    val merchantName = transaction.merchant?.customName
        ?: transaction.merchant?.name
        ?: transaction.name
    val accountName = transaction.plaidAccount?.nickname
        ?: transaction.plaidAccount?.plaidOfficialName
        ?: ""

    val amountColor = when (transaction.transactionType) {
        "expense" -> PremiumRed
        "income" -> PremiumGreen
        "transfer" -> TransferBlue
        else -> TextPrimary
    }

    val amountPrefix = when (transaction.transactionType) {
        "income" -> "+"
        else -> ""
    }

    Column {
        Row(
            modifier = modifier
                .fillMaxWidth()
                .clickable { onNoteClick(transaction) }
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = merchantName,
                        style = PremiumTypography.body.copy(fontWeight = FontWeight.Medium),
                        color = TextPrimary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    if (transaction.pending) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Pending",
                            style = PremiumTypography.caption,
                            color = TextTertiary,
                            modifier = Modifier
                                .background(GlassBorder, RoundedCornerShape(4.dp))
                                .padding(horizontal = 4.dp, vertical = 1.dp),
                        )
                    }
                }
                if (accountName.isNotBlank()) {
                    Text(
                        text = accountName,
                        style = PremiumTypography.caption,
                        color = TextTertiary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
                Spacer(modifier = Modifier.height(2.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    val category = transaction.merchantTag
                    if (category != null && category.name.isNotBlank()) {
                        CategoryChip(
                            name = category.name,
                            colorHex = category.color ?: "#9E9E9E",
                        )
                    } else {
                        CategoryChip(name = "Uncategorized", colorHex = "#9E9E9E")
                    }
                    TransactionTypeBadge(
                        transactionType = transaction.transactionType,
                        onTypeSelected = { newType ->
                            onTransactionTypeChanged(
                                transaction.id,
                                newType,
                                transaction.merchant?.id,
                            )
                        },
                    )
                    Row(
                        modifier = Modifier
                            .clickable { onTagAreaClick(transaction) },
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        if (transaction.transactionTags.isEmpty()) {
                            Icon(
                                Icons.Default.Add,
                                contentDescription = "Add tag",
                                tint = TextTertiary,
                                modifier = Modifier.size(14.dp),
                            )
                        } else {
                            transaction.transactionTags.take(2).forEach { tt ->
                                val tag = tt.tag
                                if (tag != null) {
                                    TagChip(name = tag.name, colorHex = tag.color)
                                }
                            }
                            if (transaction.transactionTags.size > 2) {
                                Text(
                                    "+${transaction.transactionTags.size - 2}",
                                    style = PremiumTypography.caption,
                                    color = TextTertiary,
                                )
                            }
                        }
                    }
                }
            }

            if (!transaction.note.isNullOrBlank()) {
                Icon(
                    imageVector = Icons.AutoMirrored.Outlined.StickyNote2,
                    contentDescription = "Has note",
                    tint = AccentCyan,
                    modifier = Modifier
                        .padding(end = 8.dp)
                        .size(16.dp),
                )
            }

            Text(
                text = "$amountPrefix${formatCurrency(transaction.amount)}",
                style = PremiumTypography.body.copy(fontWeight = FontWeight.SemiBold),
                color = amountColor,
            )
        }
        HorizontalDivider(color = GlassBorder, modifier = Modifier.padding(horizontal = 16.dp))
    }
}

@Composable
fun CategoryChip(name: String, colorHex: String) {
    val color = try {
        Color(android.graphics.Color.parseColor(colorHex))
    } catch (_: Exception) {
        Color.Gray
    }
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .background(color.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
            .padding(horizontal = 6.dp, vertical = 2.dp),
    ) {
        Box(
            modifier = Modifier
                .size(6.dp)
                .clip(CircleShape)
                .background(color),
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = name,
            style = PremiumTypography.caption,
            color = color,
            maxLines = 1,
        )
    }
}

@Composable
fun TagChip(name: String, colorHex: String) {
    val color = try {
        Color(android.graphics.Color.parseColor(colorHex))
    } catch (_: Exception) {
        Color.Gray
    }
    Text(
        text = name,
        style = PremiumTypography.caption,
        color = color,
        modifier = Modifier
            .background(color.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
            .padding(horizontal = 6.dp, vertical = 2.dp),
        maxLines = 1,
    )
}
