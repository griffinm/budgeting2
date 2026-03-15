package com.griffin.budgeting.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.DarkBackground
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.griffin.budgeting.data.repository.AuthState
import com.griffin.budgeting.ui.auth.LoginScreen
import com.griffin.budgeting.ui.auth.LoginViewModel
import com.griffin.budgeting.ui.auth.SignupScreen
import com.griffin.budgeting.ui.auth.SignupViewModel

@Composable
fun AppNavigation(
    authState: AuthState,
) {
    when (authState) {
        is AuthState.Loading -> {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(DarkBackground),
                contentAlignment = Alignment.Center,
            ) {
                CircularProgressIndicator(color = AccentCyan)
            }
        }
        is AuthState.Unauthenticated -> {
            AuthNavigation()
        }
        is AuthState.Authenticated -> {
            MainNavigation()
        }
    }
}

@Composable
fun AuthNavigation() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = Screen.Login.route,
    ) {
        composable(Screen.Login.route) {
            val viewModel: LoginViewModel = hiltViewModel()
            LoginScreen(
                viewModel = viewModel,
                onNavigateToSignup = {
                    navController.navigate(Screen.Signup.route)
                },
            )
        }
        composable(Screen.Signup.route) {
            val viewModel: SignupViewModel = hiltViewModel()
            SignupScreen(
                viewModel = viewModel,
                onNavigateToLogin = {
                    navController.popBackStack()
                },
            )
        }
    }
}
