package com.griffin.budgeting.ui.auth.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.DarkBackground
import com.griffin.budgeting.ui.theme.DarkSurfaceBright

@Composable
fun AuthButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isLoading: Boolean = false,
) {
    Button(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .height(50.dp),
        enabled = !isLoading,
        colors = ButtonDefaults.buttonColors(
            containerColor = AccentCyan,
            contentColor = DarkBackground,
            disabledContainerColor = DarkSurfaceBright,
        ),
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(24.dp),
                color = DarkBackground,
                strokeWidth = 2.dp,
            )
        } else {
            Text(text)
        }
    }
}
