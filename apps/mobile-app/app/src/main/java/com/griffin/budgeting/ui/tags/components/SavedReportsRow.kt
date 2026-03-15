package com.griffin.budgeting.ui.tags.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.data.model.TagReport
import com.griffin.budgeting.ui.common.GlassCard
import com.griffin.budgeting.ui.theme.PremiumRed
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextPrimary
import com.griffin.budgeting.ui.theme.TextSecondary
import com.griffin.budgeting.ui.theme.TextTertiary

@Composable
fun SavedReportsRow(
    reports: List<TagReport>,
    onLoadReport: (TagReport) -> Unit,
    onDeleteReport: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    if (reports.isEmpty()) return

    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = "SAVED REPORTS",
            style = PremiumTypography.sectionLabel,
            color = TextSecondary,
            modifier = Modifier.padding(horizontal = 16.dp),
        )
        Spacer(modifier = Modifier.height(8.dp))
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(reports, key = { it.id }) { report ->
                SavedReportCard(
                    report = report,
                    onTap = { onLoadReport(report) },
                    onDelete = { onDeleteReport(report.id) },
                )
            }
        }
    }
}

@Composable
private fun SavedReportCard(
    report: TagReport,
    onTap: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier,
) {
    GlassCard(
        modifier = modifier
            .width(180.dp)
            .clickable(onClick = onTap),
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = report.name,
                    style = PremiumTypography.body,
                    color = TextPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
                IconButton(onClick = onDelete) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete report",
                        tint = PremiumRed,
                    )
                }
            }
            if (!report.description.isNullOrBlank()) {
                Text(
                    text = report.description,
                    style = PremiumTypography.caption,
                    color = TextTertiary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            val tagCount = report.includedTagIds.size + report.omittedTagIds.size
            Text(
                text = "$tagCount tag${if (tagCount != 1) "s" else ""} configured",
                style = PremiumTypography.caption,
                color = TextTertiary,
            )
        }
    }
}
