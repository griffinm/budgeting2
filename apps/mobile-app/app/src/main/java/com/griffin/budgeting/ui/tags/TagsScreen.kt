package com.griffin.budgeting.ui.tags

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.paging.LoadState
import androidx.paging.compose.collectAsLazyPagingItems
import com.griffin.budgeting.ui.tags.components.SavedReportsRow
import com.griffin.budgeting.ui.tags.components.TagFilterCard
import com.griffin.budgeting.ui.tags.components.TagSpendChart
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.DarkBackground
import com.griffin.budgeting.ui.theme.DarkSurfaceElevated
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.PremiumRed
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextSecondary
import com.griffin.budgeting.ui.theme.TextTertiary
import com.griffin.budgeting.ui.transactions.components.DayHeader
import com.griffin.budgeting.ui.transactions.components.TransactionRow

@Composable
fun TagsScreen(
    viewModel: TagsViewModel,
    modifier: Modifier = Modifier,
) {
    val uiState by viewModel.uiState.collectAsState()
    val pagingItems = viewModel.transactions.collectAsLazyPagingItems()
    val snackbarHostState = remember { SnackbarHostState() }
    var showCreateDialog by remember { mutableStateOf(false) }

    LaunchedEffect(uiState.error) {
        uiState.error?.let { error ->
            snackbarHostState.showSnackbar(error)
            viewModel.clearError()
        }
    }

    Scaffold(
        modifier = modifier,
        containerColor = DarkBackground,
        snackbarHost = {
            SnackbarHost(
                hostState = snackbarHostState,
                snackbar = { data ->
                    androidx.compose.material3.Snackbar(
                        snackbarData = data,
                        containerColor = DarkSurfaceElevated,
                        contentColor = TextPrimary,
                    )
                },
            )
        },
        floatingActionButton = {
            if (uiState.includedTagIds.isNotEmpty() || uiState.omittedTagIds.isNotEmpty()) {
                FloatingActionButton(
                    onClick = { showCreateDialog = true },
                    containerColor = AccentCyan,
                    contentColor = DarkBackground,
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Save report")
                }
            }
        },
    ) { paddingValues ->
        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center,
            ) {
                CircularProgressIndicator(color = AccentCyan)
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
            ) {
                // Tag filter card
                item(key = "filter_card") {
                    TagFilterCard(
                        allTags = uiState.allTags,
                        includedTagIds = uiState.includedTagIds,
                        omittedTagIds = uiState.omittedTagIds,
                        monthsBack = uiState.monthsBack,
                        onToggleInclude = viewModel::toggleIncludeTag,
                        onToggleOmit = viewModel::toggleOmitTag,
                        onMonthsBackChange = viewModel::setMonthsBack,
                        modifier = Modifier.padding(16.dp),
                    )
                }

                // Saved reports row
                item(key = "saved_reports") {
                    SavedReportsRow(
                        reports = uiState.savedReports,
                        onLoadReport = viewModel::loadReport,
                        onDeleteReport = viewModel::deleteReport,
                        modifier = Modifier.padding(vertical = 8.dp),
                    )
                }

                // Spend chart
                item(key = "spend_chart") {
                    TagSpendChart(
                        spendStats = uiState.spendStats,
                        modifier = Modifier.padding(16.dp),
                    )
                }

                // Transactions header
                item(key = "transactions_header") {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "TRANSACTIONS",
                        style = PremiumTypography.sectionLabel,
                        color = TextSecondary,
                        modifier = Modifier.padding(horizontal = 16.dp),
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }

                // Transaction list with paging
                when (pagingItems.loadState.refresh) {
                    is LoadState.Loading -> {
                        item(key = "tx_loading") {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(32.dp),
                                contentAlignment = Alignment.Center,
                            ) {
                                CircularProgressIndicator(color = AccentCyan)
                            }
                        }
                    }
                    is LoadState.Error -> {
                        item(key = "tx_error") {
                            val error = (pagingItems.loadState.refresh as LoadState.Error).error
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(32.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                            ) {
                                Text(
                                    error.message ?: "Failed to load transactions",
                                    color = PremiumRed,
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Button(
                                    onClick = { pagingItems.retry() },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = AccentCyan,
                                        contentColor = DarkBackground,
                                    ),
                                ) {
                                    Text("Retry")
                                }
                            }
                        }
                    }
                    is LoadState.NotLoading -> {
                        if (pagingItems.itemCount == 0) {
                            item(key = "tx_empty") {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(32.dp),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Text(
                                        "No transactions found",
                                        color = TextSecondary,
                                    )
                                }
                            }
                        } else {
                            items(
                                count = pagingItems.itemCount,
                                key = { index -> "tx_${pagingItems.peek(index)?.id ?: index}" },
                            ) { index ->
                                val transaction = pagingItems[index] ?: return@items
                                val txDate = transaction.date.take(10)
                                val prevDate = if (index > 0) {
                                    pagingItems.peek(index - 1)?.date?.take(10)
                                } else null

                                if (txDate != prevDate) {
                                    DayHeader(date = txDate)
                                }
                                TransactionRow(
                                    transaction = transaction,
                                    onTransactionTypeChanged = { _, _, _ -> },
                                    onNoteClick = { },
                                    onTagAreaClick = { },
                                )
                                HorizontalDivider(
                                    modifier = Modifier.padding(horizontal = 16.dp),
                                    color = GlassBorder,
                                )
                            }
                        }
                    }
                }

                // Append loading indicator
                if (pagingItems.loadState.append is LoadState.Loading) {
                    item(key = "tx_append_loading") {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            contentAlignment = Alignment.Center,
                        ) {
                            CircularProgressIndicator(color = AccentCyan)
                        }
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        CreateReportDialog(
            onDismiss = { showCreateDialog = false },
            onCreate = { name, description ->
                viewModel.createReport(name, description)
                showCreateDialog = false
            },
        )
    }
}

@Composable
private fun CreateReportDialog(
    onDismiss: () -> Unit,
    onCreate: (name: String, description: String?) -> Unit,
) {
    var name by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = DarkSurfaceElevated,
        title = { Text("Save Report", color = TextPrimary) },
        text = {
            Column {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        cursorColor = AccentCyan,
                        focusedBorderColor = AccentCyan,
                        unfocusedBorderColor = GlassBorder,
                        focusedLabelColor = AccentCyan,
                        unfocusedLabelColor = TextTertiary,
                    ),
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description (optional)") },
                    maxLines = 3,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        cursorColor = AccentCyan,
                        focusedBorderColor = AccentCyan,
                        unfocusedBorderColor = GlassBorder,
                        focusedLabelColor = AccentCyan,
                        unfocusedLabelColor = TextTertiary,
                    ),
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onCreate(name, description.ifBlank { null })
                },
                enabled = name.isNotBlank(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = AccentCyan,
                    contentColor = DarkBackground,
                ),
            ) {
                Text("Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = AccentCyan)
            }
        },
    )
}
