package com.griffin.budgeting.ui.common

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextStyle

@Composable
fun AnimatedCounter(
    targetValue: Double,
    formatFn: (Double) -> String,
    style: TextStyle,
    modifier: Modifier = Modifier,
) {
    val animatable = remember { Animatable(0f) }
    var displayValue by remember { mutableFloatStateOf(0f) }

    LaunchedEffect(targetValue) {
        animatable.snapTo(0f)
        animatable.animateTo(
            targetValue = targetValue.toFloat(),
            animationSpec = tween(
                durationMillis = 800,
                easing = FastOutSlowInEasing,
            ),
        ) {
            displayValue = value
        }
    }

    Text(
        text = formatFn(displayValue.toDouble()),
        style = style,
        modifier = modifier,
    )
}
