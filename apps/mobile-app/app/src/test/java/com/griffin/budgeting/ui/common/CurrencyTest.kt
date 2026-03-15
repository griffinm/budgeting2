package com.griffin.budgeting.ui.common

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class CurrencyTest {

    // ── formatCurrency ──────────────────────────────────────────────────

    @Test
    fun `formatCurrency formats positive amount`() {
        assertEquals("$1,234.56", formatCurrency(1234.56))
    }

    @Test
    fun `formatCurrency formats negative amount with leading minus`() {
        assertEquals("-$1,234.56", formatCurrency(-1234.56))
    }

    @Test
    fun `formatCurrency formats zero`() {
        assertEquals("$0.00", formatCurrency(0.0))
    }

    @Test
    fun `formatCurrency formats small amount`() {
        assertEquals("$0.99", formatCurrency(0.99))
    }

    @Test
    fun `formatCurrency formats large amount with commas`() {
        assertEquals("$1,000,000.00", formatCurrency(1000000.0))
    }

    @Test
    fun `formatCurrency rounds to two decimal places`() {
        assertEquals("$10.13", formatCurrency(10.129))
    }

    // ── formatCurrencyCompact ───────────────────────────────────────────

    @Test
    fun `formatCurrencyCompact formats tens of thousands as K without decimal`() {
        assertEquals("$15K", formatCurrencyCompact(15000.0))
    }

    @Test
    fun `formatCurrencyCompact formats millions with one decimal`() {
        assertEquals("$1.5M", formatCurrencyCompact(1500000.0))
    }

    @Test
    fun `formatCurrencyCompact formats exact million`() {
        assertEquals("$1.0M", formatCurrencyCompact(1000000.0))
    }

    @Test
    fun `formatCurrencyCompact formats small amounts normally`() {
        assertEquals("$500.00", formatCurrencyCompact(500.0))
    }

    @Test
    fun `formatCurrencyCompact formats thousands with one decimal`() {
        // 1000-9999 range uses 1 decimal K
        assertEquals("$1.0K", formatCurrencyCompact(1000.0))
    }

    @Test
    fun `formatCurrencyCompact formats 5500 as K with one decimal`() {
        assertEquals("$5.5K", formatCurrencyCompact(5500.0))
    }

    @Test
    fun `formatCurrencyCompact formats negative thousands`() {
        assertEquals("-$15K", formatCurrencyCompact(-15000.0))
    }

    @Test
    fun `formatCurrencyCompact formats negative millions`() {
        assertEquals("-$2.0M", formatCurrencyCompact(-2000000.0))
    }

    @Test
    fun `formatCurrencyCompact formats negative small amount normally`() {
        assertEquals("-$50.00", formatCurrencyCompact(-50.0))
    }
}
