package com.griffin.budgeting.ui.transactions.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.data.model.Tag
import com.griffin.budgeting.data.model.Transaction
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.DarkSurfaceElevated
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextSecondary
import com.griffin.budgeting.ui.theme.TextTertiary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ManageTagsSheet(
    transaction: Transaction,
    allTags: List<Tag>,
    onAddTag: (Tag) -> Unit,
    onRemoveTag: (transactionTagId: Int) -> Unit,
    onCreateAndAddTag: (tagName: String) -> Unit,
    onDismiss: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var searchText by remember { mutableStateOf("") }

    val existingTagIds = transaction.transactionTags.mapNotNull { it.tag?.id }.toSet()
    val availableTags = allTags.filter { it.id !in existingTagIds }
    val filtered = if (searchText.isBlank()) availableTags
    else availableTags.filter { it.name.contains(searchText, ignoreCase = true) }

    val showCreateOption = searchText.isNotBlank() &&
        allTags.none { it.name.equals(searchText, ignoreCase = true) }

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
            Text("Manage Tags", style = PremiumTypography.metricValue, color = TextPrimary)
            Spacer(modifier = Modifier.height(8.dp))

            // Current tags section
            if (transaction.transactionTags.isNotEmpty()) {
                transaction.transactionTags.forEach { tt ->
                    val tag = tt.tag ?: return@forEach
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        TagChip(name = tag.name, colorHex = tag.color)
                        IconButton(
                            onClick = { onRemoveTag(tt.id) },
                            modifier = Modifier.size(32.dp),
                        ) {
                            Icon(
                                Icons.Default.Close,
                                contentDescription = "Remove tag",
                                tint = TextSecondary,
                                modifier = Modifier.size(16.dp),
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                HorizontalDivider(color = GlassBorder)
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Search field
            OutlinedTextField(
                value = searchText,
                onValueChange = { searchText = it },
                placeholder = { Text("Search or create tag", color = TextTertiary) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    cursorColor = AccentCyan,
                    focusedBorderColor = AccentCyan,
                    unfocusedBorderColor = GlassBorder,
                ),
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Create option
            if (showCreateOption) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            onCreateAndAddTag(searchText)
                            searchText = ""
                        }
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, tint = AccentCyan)
                    Text(
                        "Create \"$searchText\"",
                        modifier = Modifier.padding(start = 8.dp),
                        color = AccentCyan,
                        style = PremiumTypography.body,
                    )
                }
                HorizontalDivider(color = GlassBorder)
            }

            // Available tags list
            filtered.forEach { tag ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onAddTag(tag) }
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    TagChip(name = tag.name, colorHex = tag.color)
                }
            }

            if (filtered.isEmpty() && !showCreateOption) {
                Text(
                    if (transaction.transactionTags.isEmpty()) "No tags available"
                    else "No more tags available",
                    style = PremiumTypography.body,
                    color = TextSecondary,
                    modifier = Modifier.padding(12.dp),
                )
            }
        }
    }
}
