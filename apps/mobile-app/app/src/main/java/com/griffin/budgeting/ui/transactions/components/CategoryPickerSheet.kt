package com.griffin.budgeting.ui.transactions.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
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
import com.griffin.budgeting.data.model.MerchantCategory
import com.griffin.budgeting.data.repository.MerchantCategoryRepository
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.DarkBackground
import com.griffin.budgeting.ui.theme.DarkSurface
import com.griffin.budgeting.ui.theme.DarkSurfaceElevated
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextSecondary
import com.griffin.budgeting.ui.theme.TextTertiary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoryPickerSheet(
    merchantCategoryRepository: MerchantCategoryRepository,
    onCategorySelected: (categoryId: Int, applyToAll: Boolean) -> Unit,
    onDismiss: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var searchText by remember { mutableStateOf("") }
    var applyToAll by remember { mutableStateOf(false) }
    var categories by remember { mutableStateOf<List<MerchantCategory>>(emptyList()) }

    LaunchedEffect(Unit) {
        merchantCategoryRepository.getCategories().onSuccess { categories = it }
    }

    val filtered = if (searchText.isBlank()) categories
    else categories.filter { it.name.contains(searchText, ignoreCase = true) }

    val parents = filtered.filter { it.parentMerchantTagId == null }
    val childrenMap = filtered.filter { it.parentMerchantTagId != null }.groupBy { it.parentMerchantTagId }

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
            Text("Select Category", style = PremiumTypography.metricValue, color = TextPrimary)
            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = searchText,
                onValueChange = { searchText = it },
                placeholder = { Text("Search categories", color = TextTertiary) },
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

            Spacer(modifier = Modifier.height(12.dp))

            parents.forEach { parent ->
                Text(
                    text = parent.name,
                    style = PremiumTypography.sectionLabel,
                    color = TextSecondary,
                    modifier = Modifier.padding(vertical = 4.dp),
                )
                if (parent.isLeaf) {
                    CategoryItem(parent) {
                        onCategorySelected(parent.id, applyToAll)
                        onDismiss()
                    }
                }
                childrenMap[parent.id]?.forEach { child ->
                    CategoryItem(child, indented = true) {
                        onCategorySelected(child.id, applyToAll)
                        onDismiss()
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    "Apply to all merchant transactions",
                    style = PremiumTypography.caption,
                    color = TextSecondary,
                )
                Switch(
                    checked = applyToAll,
                    onCheckedChange = { applyToAll = it },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = DarkBackground,
                        checkedTrackColor = AccentCyan,
                        uncheckedThumbColor = TextTertiary,
                        uncheckedTrackColor = DarkSurface,
                        uncheckedBorderColor = GlassBorder,
                    ),
                )
            }
        }
    }
}

@Composable
private fun CategoryItem(
    category: MerchantCategory,
    indented: Boolean = false,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(
                start = if (indented) 24.dp else 8.dp,
                top = 8.dp,
                bottom = 8.dp,
                end = 8.dp,
            ),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        CategoryChip(name = category.name, colorHex = category.color ?: "#9E9E9E")
    }
}
