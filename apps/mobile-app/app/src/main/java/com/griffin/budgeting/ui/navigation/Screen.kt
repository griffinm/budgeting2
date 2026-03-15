package com.griffin.budgeting.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.automirrored.filled.Label
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String) {
    data object Login : Screen("login")
    data object Signup : Screen("signup")
    data object Dashboard : Screen("dashboard")
    data object Transactions : Screen("transactions")
    data object Tags : Screen("tags")
    data object Profile : Screen("profile")
}

enum class BottomNavItem(
    val screen: Screen,
    val icon: ImageVector,
    val label: String,
) {
    Dashboard(Screen.Dashboard, Icons.Default.Home, "Dashboard"),
    Transactions(Screen.Transactions, Icons.Default.Receipt, "Transactions"),
    Tags(Screen.Tags, Icons.AutoMirrored.Default.Label, "Tags"),
    Profile(Screen.Profile, Icons.Default.Person, "Profile"),
}
