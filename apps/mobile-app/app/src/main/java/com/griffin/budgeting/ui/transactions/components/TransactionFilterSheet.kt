package com.griffin.budgeting.ui.transactions.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.data.model.MerchantCategory
import com.griffin.budgeting.data.model.PlaidAccount
import com.griffin.budgeting.data.model.Tag
import com.griffin.budgeting.data.repository.MerchantCategoryRepository
import com.griffin.budgeting.data.repository.PlaidAccountRepository
import com.griffin.budgeting.data.repository.TagRepository
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.DarkBackground
import com.griffin.budgeting.ui.theme.DarkSurface
import com.griffin.budgeting.ui.theme.DarkSurfaceElevated
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextSecondary
import com.griffin.budgeting.ui.theme.TextTertiary
import com.griffin.budgeting.ui.transactions.TransactionSearchParams

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun TransactionFilterSheet(
    currentParams: TransactionSearchParams,
    merchantCategoryRepository: MerchantCategoryRepository,
    tagRepository: TagRepository,
    plaidAccountRepository: PlaidAccountRepository,
    onApply: (TransactionSearchParams) -> Unit,
    onDismiss: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    var startDate by remember { mutableStateOf(currentParams.startDate ?: "") }
    var endDate by remember { mutableStateOf(currentParams.endDate ?: "") }
    var amountMin by remember { mutableStateOf(currentParams.amountGreaterThan?.toString() ?: "") }
    var amountMax by remember { mutableStateOf(currentParams.amountLessThan?.toString() ?: "") }
    var transactionType by remember { mutableStateOf(currentParams.transactionType) }
    var merchantTagId by remember { mutableStateOf(currentParams.merchantTagId) }
    var hasNoCategory by remember { mutableStateOf(currentParams.hasNoCategory) }
    var selectedTagIds by remember { mutableStateOf(currentParams.tagIds.toSet()) }
    var omittedTagIds by remember { mutableStateOf(currentParams.omitTagIds.toSet()) }
    var selectedAccountIds by remember { mutableStateOf(currentParams.plaidAccountIds.toSet()) }

    var categories by remember { mutableStateOf<List<MerchantCategory>>(emptyList()) }
    var tags by remember { mutableStateOf<List<Tag>>(emptyList()) }
    var accounts by remember { mutableStateOf<List<PlaidAccount>>(emptyList()) }

    LaunchedEffect(Unit) {
        merchantCategoryRepository.getCategories().onSuccess { categories = it }
        tagRepository.getTags().onSuccess { tags = it }
        plaidAccountRepository.getPlaidAccounts().onSuccess { accounts = it }
    }

    val textFieldColors = OutlinedTextFieldDefaults.colors(
        focusedTextColor = TextPrimary,
        unfocusedTextColor = TextPrimary,
        cursorColor = AccentCyan,
        focusedBorderColor = AccentCyan,
        unfocusedBorderColor = GlassBorder,
        focusedLabelColor = AccentCyan,
        unfocusedLabelColor = TextTertiary,
    )

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = DarkSurfaceElevated,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp)
                .padding(bottom = 32.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("Filters", style = PremiumTypography.metricValue, color = TextPrimary)
                TextButton(onClick = {
                    startDate = ""
                    endDate = ""
                    amountMin = ""
                    amountMax = ""
                    transactionType = null
                    merchantTagId = null
                    hasNoCategory = false
                    selectedTagIds = emptySet()
                    omittedTagIds = emptySet()
                    selectedAccountIds = emptySet()
                }) {
                    Text("Clear All", color = AccentCyan)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text("Type", style = PremiumTypography.sectionLabel, color = TextSecondary)
            Spacer(modifier = Modifier.height(4.dp))
            val typeOptions = listOf(null to "All", "expense" to "Expense", "income" to "Income")
            SingleChoiceSegmentedButtonRow(modifier = Modifier.fillMaxWidth()) {
                typeOptions.forEachIndexed { index, (value, label) ->
                    SegmentedButton(
                        selected = transactionType == value,
                        onClick = { transactionType = value },
                        shape = SegmentedButtonDefaults.itemShape(index, typeOptions.size),
                        colors = SegmentedButtonDefaults.colors(
                            activeContainerColor = AccentCyan,
                            activeContentColor = DarkBackground,
                            inactiveContainerColor = Color.Transparent,
                            inactiveContentColor = TextSecondary,
                            activeBorderColor = AccentCyan,
                            inactiveBorderColor = GlassBorder,
                        ),
                    ) {
                        Text(label)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider(color = GlassBorder)
            Spacer(modifier = Modifier.height(12.dp))

            Text("Date Range", style = PremiumTypography.sectionLabel, color = TextSecondary)
            Spacer(modifier = Modifier.height(4.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = startDate,
                    onValueChange = { startDate = it },
                    label = { Text("Start (YYYY-MM-DD)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    colors = textFieldColors,
                )
                OutlinedTextField(
                    value = endDate,
                    onValueChange = { endDate = it },
                    label = { Text("End (YYYY-MM-DD)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    colors = textFieldColors,
                )
            }

            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider(color = GlassBorder)
            Spacer(modifier = Modifier.height(12.dp))

            Text("Amount Range", style = PremiumTypography.sectionLabel, color = TextSecondary)
            Spacer(modifier = Modifier.height(4.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = amountMin,
                    onValueChange = { amountMin = it },
                    label = { Text("Min") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    colors = textFieldColors,
                )
                OutlinedTextField(
                    value = amountMax,
                    onValueChange = { amountMax = it },
                    label = { Text("Max") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    colors = textFieldColors,
                )
            }

            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider(color = GlassBorder)
            Spacer(modifier = Modifier.height(12.dp))

            if (categories.isNotEmpty()) {
                Text("Category", style = PremiumTypography.sectionLabel, color = TextSecondary)
                Spacer(modifier = Modifier.height(4.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    categories.filter { it.isLeaf }.forEach { category ->
                        PremiumFilterChip(
                            selected = merchantTagId == category.id,
                            onClick = {
                                merchantTagId = if (merchantTagId == category.id) null else category.id
                            },
                            label = category.name,
                        )
                    }
                }
                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = GlassBorder)
                Spacer(modifier = Modifier.height(12.dp))
            }

            if (tags.isNotEmpty()) {
                Text("Include Tags", style = PremiumTypography.sectionLabel, color = TextSecondary)
                Spacer(modifier = Modifier.height(4.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    tags.forEach { tag ->
                        PremiumFilterChip(
                            selected = tag.id in selectedTagIds,
                            onClick = {
                                selectedTagIds = if (tag.id in selectedTagIds) {
                                    selectedTagIds - tag.id
                                } else {
                                    selectedTagIds + tag.id
                                }
                            },
                            label = tag.name,
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text("Omit Tags", style = PremiumTypography.sectionLabel, color = TextSecondary)
                Spacer(modifier = Modifier.height(4.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    tags.forEach { tag ->
                        PremiumFilterChip(
                            selected = tag.id in omittedTagIds,
                            onClick = {
                                omittedTagIds = if (tag.id in omittedTagIds) {
                                    omittedTagIds - tag.id
                                } else {
                                    omittedTagIds + tag.id
                                }
                            },
                            label = tag.name,
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = GlassBorder)
                Spacer(modifier = Modifier.height(12.dp))
            }

            if (accounts.isNotEmpty()) {
                Text("Accounts", style = PremiumTypography.sectionLabel, color = TextSecondary)
                Spacer(modifier = Modifier.height(4.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    accounts.forEach { account ->
                        val name = account.nickname?.takeIf { it.isNotBlank() }
                            ?: account.plaidOfficialName ?: "Account"
                        PremiumFilterChip(
                            selected = account.id in selectedAccountIds,
                            onClick = {
                                selectedAccountIds = if (account.id in selectedAccountIds) {
                                    selectedAccountIds - account.id
                                } else {
                                    selectedAccountIds + account.id
                                }
                            },
                            label = name,
                        )
                    }
                }
                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = GlassBorder)
                Spacer(modifier = Modifier.height(12.dp))
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("Uncategorized only", style = PremiumTypography.body, color = TextPrimary)
                Switch(
                    checked = hasNoCategory,
                    onCheckedChange = { hasNoCategory = it },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = DarkBackground,
                        checkedTrackColor = AccentCyan,
                        uncheckedThumbColor = TextTertiary,
                        uncheckedTrackColor = DarkSurface,
                        uncheckedBorderColor = GlassBorder,
                    ),
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    onApply(
                        currentParams.copy(
                            startDate = startDate.takeIf { it.isNotBlank() },
                            endDate = endDate.takeIf { it.isNotBlank() },
                            amountGreaterThan = amountMin.toDoubleOrNull(),
                            amountLessThan = amountMax.toDoubleOrNull(),
                            transactionType = transactionType,
                            merchantTagId = merchantTagId,
                            hasNoCategory = hasNoCategory,
                            tagIds = selectedTagIds.toList(),
                            omitTagIds = omittedTagIds.toList(),
                            plaidAccountIds = selectedAccountIds.toList(),
                        )
                    )
                    onDismiss()
                },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = AccentCyan,
                    contentColor = DarkBackground,
                ),
            ) {
                Text("Apply Filters")
            }
        }
    }
}

@Composable
private fun PremiumFilterChip(
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
