package com.griffin.budgeting.ui.transactions.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.ui.theme.PremiumGreen
import com.griffin.budgeting.ui.theme.PremiumRed
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TransferBlue

private data class TypeOption(
    val value: String,
    val label: String,
    val color: Color,
)

private val typeOptions = listOf(
    TypeOption("expense", "Expense", PremiumRed),
    TypeOption("income", "Income", PremiumGreen),
    TypeOption("transfer", "Transfer", TransferBlue),
)

@Composable
fun TransactionTypeBadge(
    transactionType: String,
    onTypeSelected: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val current = typeOptions.find { it.value == transactionType } ?: typeOptions[0]
    var expanded by remember { mutableStateOf(false) }

    Box(modifier = modifier) {
        Text(
            text = current.label,
            style = PremiumTypography.caption,
            color = current.color,
            modifier = Modifier
                .clip(RoundedCornerShape(4.dp))
                .background(current.color.copy(alpha = 0.15f))
                .clickable { expanded = true }
                .padding(horizontal = 6.dp, vertical = 2.dp),
            maxLines = 1,
        )

        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
        ) {
            typeOptions.forEach { option ->
                DropdownMenuItem(
                    text = {
                        Text(
                            text = option.label,
                            color = option.color,
                        )
                    },
                    onClick = {
                        expanded = false
                        if (option.value != transactionType) {
                            onTypeSelected(option.value)
                        }
                    },
                )
            }
        }
    }
}
