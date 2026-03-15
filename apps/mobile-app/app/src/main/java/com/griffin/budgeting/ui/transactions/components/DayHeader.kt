package com.griffin.budgeting.ui.transactions.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextSecondary
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

private val DATE_DISPLAY_FORMAT = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy", Locale.US)

@Composable
fun DayHeader(
    date: String,
    modifier: Modifier = Modifier,
) {
    val displayDate = try {
        LocalDate.parse(date.take(10)).format(DATE_DISPLAY_FORMAT)
    } catch (_: Exception) {
        date
    }
    Text(
        text = displayDate,
        style = PremiumTypography.sectionLabel,
        color = TextSecondary,
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 10.dp),
    )
}
