package com.griffin.budgeting.ui.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.griffin.budgeting.ui.dashboard.DashboardScreen
import com.griffin.budgeting.ui.dashboard.DashboardViewModel
import com.griffin.budgeting.ui.profile.ProfileScreen
import com.griffin.budgeting.ui.profile.ProfileViewModel
import com.griffin.budgeting.ui.tags.TagsScreen
import com.griffin.budgeting.ui.tags.TagsViewModel
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.BudgetingPremiumTheme
import com.griffin.budgeting.ui.theme.DarkSurface
import com.griffin.budgeting.ui.theme.DarkSurfaceBright
import com.griffin.budgeting.ui.theme.TextTertiary
import com.griffin.budgeting.ui.transactions.TransactionsScreen
import com.griffin.budgeting.ui.transactions.TransactionsViewModel

@Composable
fun MainNavigation() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    BudgetingPremiumTheme {
        Scaffold(
            bottomBar = {
                NavigationBar(
                    containerColor = DarkSurface,
                ) {
                    BottomNavItem.entries.forEach { item ->
                        NavigationBarItem(
                            icon = { Icon(item.icon, contentDescription = item.label) },
                            label = { Text(item.label) },
                            selected = currentDestination?.hierarchy?.any {
                                it.route == item.screen.route
                            } == true,
                            onClick = {
                                navController.navigate(item.screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = AccentCyan,
                                selectedTextColor = AccentCyan,
                                unselectedIconColor = TextTertiary,
                                unselectedTextColor = TextTertiary,
                                indicatorColor = DarkSurfaceBright,
                            ),
                        )
                    }
                }
            },
        ) { innerPadding ->
            NavHost(
                navController = navController,
                startDestination = Screen.Dashboard.route,
                modifier = Modifier.padding(innerPadding),
            ) {
                composable(Screen.Dashboard.route) {
                    val viewModel: DashboardViewModel = hiltViewModel()
                    DashboardScreen(viewModel = viewModel)
                }
                composable(Screen.Transactions.route) {
                    val viewModel: TransactionsViewModel = hiltViewModel()
                    TransactionsScreen(viewModel = viewModel)
                }
                composable(Screen.Tags.route) {
                    val viewModel: TagsViewModel = hiltViewModel()
                    TagsScreen(viewModel = viewModel)
                }
                composable(Screen.Profile.route) {
                    val viewModel: ProfileViewModel = hiltViewModel()
                    ProfileScreen(viewModel = viewModel)
                }
            }
        }
    }
}

@Composable
fun PlaceholderScreen(title: String) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        Text(title, style = androidx.compose.material3.MaterialTheme.typography.headlineMedium)
    }
}
