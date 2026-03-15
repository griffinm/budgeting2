package com.griffin.budgeting.ui.dashboard.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Percent
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.data.model.AccountBalance
import com.griffin.budgeting.ui.common.GlassCard
import com.griffin.budgeting.ui.common.formatCurrency
import com.griffin.budgeting.ui.dashboard.DashboardViewModel
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextSecondary
import com.griffin.budgeting.ui.theme.TextTertiary

private val ACCOUNT_TYPE_ORDER = listOf("deposit", "credit", "loan", "investment")

private val ACCOUNT_TYPE_LABELS = mapOf(
    "deposit" to "Deposit",
    "credit" to "Credit",
    "loan" to "Loan",
    "investment" to "Investment",
)

private val ACCOUNT_TYPE_ICONS: Map<String, ImageVector> = mapOf(
    "deposit" to Icons.Default.AccountBalance,
    "credit" to Icons.Default.CreditCard,
    "loan" to Icons.Default.Percent,
    "investment" to Icons.AutoMirrored.Filled.TrendingUp,
)

@Composable
fun AccountBalancesCard(
    balancesByType: Map<String, List<AccountBalance>>,
    onChartClick: (AccountBalance) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = "ACCOUNTS",
            style = PremiumTypography.sectionLabel,
            color = TextSecondary,
        )

        Spacer(modifier = Modifier.height(12.dp))

        ACCOUNT_TYPE_ORDER.forEach { type ->
            val accounts = balancesByType[type]
            if (!accounts.isNullOrEmpty()) {
                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    AccountTypeGroup(
                        typeName = ACCOUNT_TYPE_LABELS[type] ?: type,
                        typeIcon = ACCOUNT_TYPE_ICONS[type] ?: Icons.Default.AccountBalance,
                        accounts = accounts,
                        onChartClick = onChartClick,
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

@Composable
private fun AccountTypeGroup(
    typeName: String,
    typeIcon: ImageVector,
    accounts: List<AccountBalance>,
    onChartClick: (AccountBalance) -> Unit,
) {
    var expanded by remember { mutableStateOf(true) }
    val totalBalance = accounts.sumOf { DashboardViewModel.getCurrentBalance(it) }

    Column(modifier = Modifier.padding(14.dp)) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { expanded = !expanded }
                .padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = typeIcon,
                    contentDescription = typeName,
                    modifier = Modifier.size(18.dp),
                    tint = AccentCyan,
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = typeName,
                    style = PremiumTypography.body.copy(fontWeight = FontWeight.SemiBold),
                    color = TextPrimary,
                )
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = formatCurrency(totalBalance),
                    style = PremiumTypography.body.copy(fontWeight = FontWeight.Medium),
                    color = TextPrimary,
                )
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                    imageVector = if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = if (expanded) "Collapse" else "Expand",
                    modifier = Modifier.size(20.dp),
                    tint = TextTertiary,
                )
            }
        }

        AnimatedVisibility(visible = expanded) {
            Column {
                accounts.forEach { balance ->
                    HorizontalDivider(
                        color = GlassBorder,
                        modifier = Modifier.padding(vertical = 2.dp),
                    )
                    AccountRow(
                        balance = balance,
                        onChartClick = { onChartClick(balance) },
                    )
                }
            }
        }
    }
}

@Composable
private fun AccountRow(
    balance: AccountBalance,
    onChartClick: () -> Unit,
) {
    val account = balance.plaidAccount
    val displayName = account?.nickname?.takeIf { it.isNotBlank() }
        ?: account?.plaidOfficialName
        ?: "Account"
    val mask = account?.plaidMask?.let { "****$it" } ?: ""
    val displayBalance = DashboardViewModel.getCurrentBalance(balance)

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = displayName,
                style = PremiumTypography.body,
                color = TextPrimary,
            )
            if (mask.isNotEmpty()) {
                Text(
                    text = mask,
                    style = PremiumTypography.caption,
                    color = TextTertiary,
                )
            }
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = formatCurrency(displayBalance),
                style = PremiumTypography.body.copy(fontWeight = FontWeight.Medium),
                color = TextPrimary,
            )
            IconButton(
                onClick = onChartClick,
                modifier = Modifier.size(32.dp),
            ) {
                Icon(
                    imageVector = Icons.Default.BarChart,
                    contentDescription = "Balance history",
                    modifier = Modifier.size(18.dp),
                    tint = AccentCyan,
                )
            }
        }
    }
}
