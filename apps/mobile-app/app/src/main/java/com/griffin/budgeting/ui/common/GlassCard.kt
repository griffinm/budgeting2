package com.griffin.budgeting.ui.common

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.ui.theme.GlassBorder

private val GlassShape = RoundedCornerShape(16.dp)

private val GlassColors = listOf(
    Color.White.copy(alpha = 0.06f),
    Color.White.copy(alpha = 0.02f),
)

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Box(
        modifier = modifier
            .clip(GlassShape)
            .background(Brush.verticalGradient(GlassColors))
            .border(1.dp, GlassBorder, GlassShape),
    ) {
        content()
    }
}
