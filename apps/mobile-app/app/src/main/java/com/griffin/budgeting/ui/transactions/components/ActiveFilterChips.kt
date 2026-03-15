package com.griffin.budgeting.ui.transactions.components

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.DarkSurfaceBright
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextTertiary
import com.griffin.budgeting.ui.transactions.TransactionSearchParams

@Composable
fun ActiveFilterChips(
    params: TransactionSearchParams,
    onUpdateParams: (TransactionSearchParams) -> Unit,
    modifier: Modifier = Modifier,
) {
    val chips = buildList {
        params.transactionType?.let { type ->
            add("${type.replaceFirstChar { it.uppercase() }}s only" to {
                onUpdateParams(params.copy(transactionType = null))
            })
        }
        params.startDate?.let { date ->
            add("After $date" to { onUpdateParams(params.copy(startDate = null)) })
        }
        params.endDate?.let { date ->
            add("Before $date" to { onUpdateParams(params.copy(endDate = null)) })
        }
        params.amountGreaterThan?.let { amount ->
            add("Min $$amount" to { onUpdateParams(params.copy(amountGreaterThan = null)) })
        }
        params.amountLessThan?.let { amount ->
            add("Max $$amount" to { onUpdateParams(params.copy(amountLessThan = null)) })
        }
        params.merchantTagId?.let {
            add("Category filter" to { onUpdateParams(params.copy(merchantTagId = null)) })
        }
        if (params.hasNoCategory) {
            add("Uncategorized" to { onUpdateParams(params.copy(hasNoCategory = false)) })
        }
        if (params.tagIds.isNotEmpty()) {
            add("${params.tagIds.size} tag(s)" to { onUpdateParams(params.copy(tagIds = emptyList())) })
        }
        if (params.omitTagIds.isNotEmpty()) {
            add("Omitting ${params.omitTagIds.size} tag(s)" to { onUpdateParams(params.copy(omitTagIds = emptyList())) })
        }
        if (params.plaidAccountIds.isNotEmpty()) {
            add("${params.plaidAccountIds.size} account(s)" to { onUpdateParams(params.copy(plaidAccountIds = emptyList())) })
        }
    }

    if (chips.isNotEmpty()) {
        Row(
            modifier = modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            chips.forEach { (label, onDismiss) ->
                AssistChip(
                    onClick = onDismiss,
                    label = { Text(label, color = TextPrimary) },
                    trailingIcon = {
                        Icon(
                            Icons.Default.Close,
                            contentDescription = "Remove filter",
                            modifier = Modifier.size(14.dp),
                            tint = TextTertiary,
                        )
                    },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = DarkSurfaceBright,
                    ),
                    border = AssistChipDefaults.assistChipBorder(
                        borderColor = GlassBorder,
                        enabled = true,
                    ),
                )
            }
        }
    }
}
