package com.griffin.budgeting.ui.transactions.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.data.model.Transaction
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.DarkBackground
import com.griffin.budgeting.ui.theme.DarkSurfaceElevated
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextTertiary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NoteSheet(
    transaction: Transaction,
    onSave: (transactionId: Int, note: String) -> Unit,
    onDismiss: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var noteText by remember { mutableStateOf(transaction.note ?: "") }
    val hasChanges = noteText != (transaction.note ?: "")

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = DarkSurfaceElevated,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .padding(bottom = 32.dp),
        ) {
            val merchantName = transaction.merchant?.customName
                ?: transaction.merchant?.name
                ?: transaction.name
            Text("Note", style = PremiumTypography.metricValue, color = TextPrimary)
            Spacer(modifier = Modifier.height(4.dp))
            Text(merchantName, style = PremiumTypography.caption, color = TextTertiary)
            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = noteText,
                onValueChange = { noteText = it },
                placeholder = { Text("Add a note...", color = TextTertiary) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    cursorColor = AccentCyan,
                    focusedBorderColor = AccentCyan,
                    unfocusedBorderColor = GlassBorder,
                ),
            )

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = {
                    onSave(transaction.id, noteText)
                    onDismiss()
                },
                enabled = hasChanges,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = AccentCyan,
                    contentColor = DarkBackground,
                    disabledContainerColor = GlassBorder,
                    disabledContentColor = TextTertiary,
                ),
            ) {
                Text("Save", style = PremiumTypography.body)
            }
        }
    }
}
