package com.griffin.budgeting.ui.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.ui.common.GlassCard
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.DarkBackground
import com.griffin.budgeting.ui.theme.DarkSurfaceElevated
import com.griffin.budgeting.ui.theme.PremiumRed
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextSecondary
import com.griffin.budgeting.ui.theme.TextTertiary
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun ProfileScreen(
    viewModel: ProfileViewModel,
) {
    val uiState by viewModel.uiState.collectAsState()
    var showLogoutDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp),
    ) {
        Text(
            "Profile",
            style = PremiumTypography.metricValue,
            color = TextPrimary,
        )
        Spacer(modifier = Modifier.height(16.dp))

        // User info card
        GlassCard(modifier = Modifier.fillMaxWidth()) {
            Column {
                uiState.user?.let { user ->
                    ListItem(
                        headlineContent = { Text("${user.firstName} ${user.lastName}", color = TextPrimary) },
                        supportingContent = { Text("Name", color = TextTertiary) },
                        leadingContent = { Icon(Icons.Default.Person, contentDescription = null, tint = AccentCyan) },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                    ListItem(
                        headlineContent = { Text(user.email, color = TextPrimary) },
                        supportingContent = { Text("Email", color = TextTertiary) },
                        leadingContent = { Icon(Icons.Default.Email, contentDescription = null, tint = AccentCyan) },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Last sync card
        GlassCard(modifier = Modifier.fillMaxWidth()) {
            val syncText = uiState.lastSync?.completedAt?.let { timestamp ->
                try {
                    val dt = ZonedDateTime.parse(timestamp)
                    dt.format(DateTimeFormatter.ofPattern("MMM d, yyyy 'at' h:mm a", Locale.US))
                } catch (_: Exception) {
                    timestamp
                }
            } ?: "Never"
            ListItem(
                headlineContent = { Text(syncText, color = TextPrimary) },
                supportingContent = { Text("Last sync", color = TextTertiary) },
                leadingContent = { Icon(Icons.Default.Sync, contentDescription = null, tint = AccentCyan) },
                colors = ListItemDefaults.colors(containerColor = Color.Transparent),
            )
        }

        Spacer(modifier = Modifier.weight(1f))

        Button(
            onClick = { showLogoutDialog = true },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = PremiumRed,
                contentColor = DarkBackground,
            ),
        ) {
            Text("Logout")
        }
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            containerColor = DarkSurfaceElevated,
            title = { Text("Logout", color = TextPrimary) },
            text = { Text("Are you sure you want to logout?", color = TextSecondary) },
            confirmButton = {
                TextButton(onClick = {
                    showLogoutDialog = false
                    viewModel.logout()
                }) {
                    Text("Logout", color = PremiumRed)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("Cancel", color = AccentCyan)
                }
            },
        )
    }
}
