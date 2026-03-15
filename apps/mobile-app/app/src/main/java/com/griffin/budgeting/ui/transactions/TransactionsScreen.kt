package com.griffin.budgeting.ui.transactions

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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
import com.griffin.budgeting.data.repository.MerchantCategoryRepository
import com.griffin.budgeting.data.repository.PlaidAccountRepository
import com.griffin.budgeting.data.repository.TagRepository
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.BudgetingPremiumTheme
import com.griffin.budgeting.ui.theme.DarkBackground
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.PremiumRed
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextSecondary
import com.griffin.budgeting.data.model.Transaction
import com.griffin.budgeting.ui.transactions.components.ActiveFilterChips
import com.griffin.budgeting.ui.transactions.components.DayHeader
import com.griffin.budgeting.ui.transactions.components.NoteSheet
import com.griffin.budgeting.ui.transactions.components.TransactionFilterSheet
import com.griffin.budgeting.ui.transactions.components.TransactionRow
import com.griffin.budgeting.ui.transactions.components.TransactionSearchBar

@Composable
fun TransactionsScreen(
    viewModel: TransactionsViewModel,
    merchantCategoryRepository: MerchantCategoryRepository? = null,
    tagRepository: TagRepository? = null,
    plaidAccountRepository: PlaidAccountRepository? = null,
) {
    BudgetingPremiumTheme {
        val pagingItems = viewModel.transactions.collectAsLazyPagingItems()
        val searchText by viewModel.searchText.collectAsState()
        val searchParams by viewModel.searchParams.collectAsState()
        var showFilterSheet by remember { mutableStateOf(false) }
        var noteTransaction by remember { mutableStateOf<Transaction?>(null) }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(DarkBackground),
        ) {
            TransactionSearchBar(
                searchText = searchText,
                onSearchTextChange = viewModel::onSearchTextChange,
                onFilterClick = { showFilterSheet = true },
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
            )

            ActiveFilterChips(
                params = searchParams,
                onUpdateParams = viewModel::updateFilters,
            )

            when (pagingItems.loadState.refresh) {
                is LoadState.Loading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center,
                    ) {
                        CircularProgressIndicator(color = AccentCyan)
                    }
                }
                is LoadState.Error -> {
                    val error = (pagingItems.loadState.refresh as LoadState.Error).error
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center,
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                error.message ?: "Failed to load transactions",
                                color = PremiumRed,
                                style = PremiumTypography.body,
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
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(
                                "No transactions found",
                                color = TextSecondary,
                                style = PremiumTypography.body,
                            )
                        }
                    } else {
                        LazyColumn(modifier = Modifier.fillMaxSize()) {
                            items(
                                count = pagingItems.itemCount,
                                key = { index -> pagingItems.peek(index)?.id ?: index },
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
                                    onTransactionTypeChanged = viewModel::updateTransactionType,
                                    onNoteClick = { noteTransaction = it },
                                )
                            }

                            if (pagingItems.loadState.append is LoadState.Loading) {
                                item {
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
            }
        }

        if (showFilterSheet && merchantCategoryRepository != null && tagRepository != null && plaidAccountRepository != null) {
            TransactionFilterSheet(
                currentParams = searchParams,
                merchantCategoryRepository = merchantCategoryRepository,
                tagRepository = tagRepository,
                plaidAccountRepository = plaidAccountRepository,
                onApply = viewModel::updateFilters,
                onDismiss = { showFilterSheet = false },
            )
        }

        noteTransaction?.let { transaction ->
            NoteSheet(
                transaction = transaction,
                onSave = viewModel::updateNote,
                onDismiss = { noteTransaction = null },
            )
        }
    }
}
