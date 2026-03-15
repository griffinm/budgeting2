package com.griffin.budgeting

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.griffin.budgeting.data.repository.AuthRepository
import com.griffin.budgeting.ui.navigation.AppNavigation
import com.griffin.budgeting.ui.theme.BudgetingTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var authRepository: AuthRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            BudgetingTheme {
                val authState by authRepository.authState.collectAsState()
                AppNavigation(authState = authState)
            }
        }
    }
}
