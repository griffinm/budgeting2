package com.griffin.budgeting.ui.dashboard.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.griffin.budgeting.ui.theme.InterFontFamily
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextTertiary
import java.time.LocalTime
import java.time.OffsetDateTime
import java.time.Duration
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight

@Composable
fun DashboardHeader(
    userName: String,
    lastSyncAt: String?,
    modifier: Modifier = Modifier,
) {
    val greeting = getGreeting(userName)

    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = greeting,
            style = TextStyle(
                fontFamily = InterFontFamily,
                fontWeight = FontWeight.SemiBold,
                fontSize = 22.sp,
            ),
            color = TextPrimary,
        )
        if (lastSyncAt != null) {
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Last synced ${formatRelativeTime(lastSyncAt)}",
                style = TextStyle(
                    fontFamily = InterFontFamily,
                    fontWeight = FontWeight.Normal,
                    fontSize = 12.sp,
                ),
                color = TextTertiary,
            )
        }
    }
}

private fun getGreeting(name: String): String {
    val hour = LocalTime.now().hour
    val timeOfDay = when {
        hour < 12 -> "morning"
        hour < 17 -> "afternoon"
        else -> "evening"
    }
    return if (name.isNotBlank()) "Good $timeOfDay, $name" else "Good $timeOfDay"
}

private fun formatRelativeTime(isoTimestamp: String): String {
    return try {
        val syncTime = OffsetDateTime.parse(isoTimestamp)
        val now = OffsetDateTime.now()
        val duration = Duration.between(syncTime, now)
        val minutes = duration.toMinutes()
        when {
            minutes < 1 -> "just now"
            minutes < 60 -> "${minutes}m ago"
            minutes < 1440 -> "${minutes / 60}h ago"
            else -> "${minutes / 1440}d ago"
        }
    } catch (_: Exception) {
        ""
    }
}
