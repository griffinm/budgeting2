package com.griffin.budgeting.ui.tags.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.data.model.Tag
import com.griffin.budgeting.ui.common.GlassCard
import com.griffin.budgeting.ui.dashboard.components.PremiumFilterChip
import com.griffin.budgeting.ui.theme.GlassBorder
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextSecondary

private val MONTHS_BACK_OPTIONS = listOf(3, 6, 9, 12)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun TagFilterCard(
    allTags: List<Tag>,
    includedTagIds: Set<Int>,
    omittedTagIds: Set<Int>,
    monthsBack: Int,
    onToggleInclude: (Int) -> Unit,
    onToggleOmit: (Int) -> Unit,
    onMonthsBackChange: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    GlassCard(modifier = modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                "INCLUDE TAGS",
                style = PremiumTypography.sectionLabel,
                color = TextSecondary,
            )
            Spacer(modifier = Modifier.height(8.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                allTags.forEach { tag ->
                    val isSelected = tag.id in includedTagIds
                    val tagColor = parseTagColor(tag.color)
                    FilterChip(
                        selected = isSelected,
                        onClick = { onToggleInclude(tag.id) },
                        label = { Text(tag.name) },
                        colors = FilterChipDefaults.filterChipColors(
                            containerColor = Color.Transparent,
                            selectedContainerColor = tagColor.copy(alpha = 0.2f),
                            selectedLabelColor = tagColor,
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            borderColor = GlassBorder,
                            selectedBorderColor = tagColor,
                            enabled = true,
                            selected = isSelected,
                        ),
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                "OMIT TAGS",
                style = PremiumTypography.sectionLabel,
                color = TextSecondary,
            )
            Spacer(modifier = Modifier.height(8.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                allTags.forEach { tag ->
                    val isSelected = tag.id in omittedTagIds
                    val tagColor = parseTagColor(tag.color)
                    FilterChip(
                        selected = isSelected,
                        onClick = { onToggleOmit(tag.id) },
                        label = { Text(tag.name) },
                        colors = FilterChipDefaults.filterChipColors(
                            containerColor = Color.Transparent,
                            selectedContainerColor = tagColor.copy(alpha = 0.2f),
                            selectedLabelColor = tagColor,
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            borderColor = GlassBorder,
                            selectedBorderColor = tagColor,
                            enabled = true,
                            selected = isSelected,
                        ),
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                "PERIOD",
                style = PremiumTypography.sectionLabel,
                color = TextSecondary,
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                MONTHS_BACK_OPTIONS.forEach { months ->
                    PremiumFilterChip(
                        selected = monthsBack == months,
                        onClick = { onMonthsBackChange(months) },
                        label = "${months}m",
                    )
                }
            }
        }
    }
}

private fun parseTagColor(colorHex: String): Color {
    return try {
        Color(android.graphics.Color.parseColor(colorHex))
    } catch (_: Exception) {
        Color.Gray
    }
}
