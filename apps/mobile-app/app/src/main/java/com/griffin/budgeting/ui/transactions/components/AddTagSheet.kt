package com.griffin.budgeting.ui.transactions.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.data.model.Tag
import com.griffin.budgeting.data.repository.TagRepository
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.DarkSurfaceElevated
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextSecondary
import com.griffin.budgeting.ui.theme.TextTertiary
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddTagSheet(
    tagRepository: TagRepository,
    existingTagIds: Set<Int>,
    onTagSelected: (Tag) -> Unit,
    onDismiss: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var searchText by remember { mutableStateOf("") }
    var tags by remember { mutableStateOf<List<Tag>>(emptyList()) }

    LaunchedEffect(Unit) {
        tagRepository.getTags().onSuccess { tags = it }
    }

    val availableTags = tags.filter { it.id !in existingTagIds }
    val filtered = if (searchText.isBlank()) availableTags
    else availableTags.filter { it.name.contains(searchText, ignoreCase = true) }

    val showCreateOption = searchText.isNotBlank() && tags.none { it.name.equals(searchText, ignoreCase = true) }

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
            Text("Add Tag", style = PremiumTypography.metricValue, color = TextPrimary)
            Spacer(modifier = Modifier.height(8.dp))

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

            if (showCreateOption) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            CoroutineScope(Dispatchers.Main).launch {
                                tagRepository.createTag(searchText).onSuccess { newTag ->
                                    onTagSelected(newTag)
                                    onDismiss()
                                }
                            }
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

            filtered.forEach { tag ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            onTagSelected(tag)
                            onDismiss()
                        }
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    TagChip(name = tag.name, colorHex = tag.color)
                }
            }

            if (filtered.isEmpty() && !showCreateOption) {
                Text(
                    "No tags available",
                    style = PremiumTypography.body,
                    color = TextSecondary,
                    modifier = Modifier.padding(12.dp),
                )
            }
        }
    }
}
