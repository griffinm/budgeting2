package com.griffin.budgeting.ui.common

import java.text.NumberFormat
import java.util.Locale
import kotlin.math.abs

fun formatCurrency(amount: Double): String {
    val formatter = NumberFormat.getCurrencyInstance(Locale.US)
    formatter.minimumFractionDigits = 2
    formatter.maximumFractionDigits = 2
    return if (amount < 0) {
        "-${formatter.format(abs(amount))}"
    } else {
        formatter.format(amount)
    }
}

fun formatCurrencyCompact(amount: Double): String {
    val absAmount = abs(amount)
    val prefix = if (amount < 0) "-" else ""
    return when {
        absAmount >= 1_000_000 -> "${prefix}$${String.format(Locale.US, "%.1fM", absAmount / 1_000_000)}"
        absAmount >= 10_000 -> "${prefix}$${String.format(Locale.US, "%.0fK", absAmount / 1_000)}"
        absAmount >= 1_000 -> "${prefix}$${String.format(Locale.US, "%.1fK", absAmount / 1_000)}"
        else -> formatCurrency(amount)
    }
}
