package com.griffin.budgeting.ui.transactions.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.DarkSurfaceElevated
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextTertiary

@Composable
fun TransactionSearchBar(
    searchText: String,
    onSearchTextChange: (String) -> Unit,
    onFilterClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    OutlinedTextField(
        value = searchText,
        onValueChange = onSearchTextChange,
        modifier = modifier.fillMaxWidth(),
        placeholder = { Text("Search transactions", color = TextTertiary) },
        leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = TextTertiary) },
        trailingIcon = {
            if (searchText.isNotEmpty()) {
                IconButton(onClick = { onSearchTextChange("") }) {
                    Icon(Icons.Default.Close, contentDescription = "Clear", tint = TextTertiary)
                }
            } else {
                IconButton(onClick = onFilterClick) {
                    Icon(Icons.Default.FilterList, contentDescription = "Filter", tint = AccentCyan)
                }
            }
        },
        singleLine = true,
        colors = OutlinedTextFieldDefaults.colors(
            focusedTextColor = TextPrimary,
            unfocusedTextColor = TextPrimary,
            cursorColor = AccentCyan,
            focusedBorderColor = AccentCyan,
            unfocusedBorderColor = GlassBorder,
            focusedContainerColor = DarkSurfaceElevated,
            unfocusedContainerColor = DarkSurfaceElevated,
        ),
    )
}
