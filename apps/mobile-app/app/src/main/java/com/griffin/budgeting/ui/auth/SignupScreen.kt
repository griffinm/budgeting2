package com.griffin.budgeting.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.griffin.budgeting.ui.auth.components.AuthButton
import com.griffin.budgeting.ui.auth.components.AuthTextField
import com.griffin.budgeting.ui.theme.AccentCyan
import com.griffin.budgeting.ui.theme.BudgetingPremiumTheme
import com.griffin.budgeting.ui.theme.DarkBackground
import com.griffin.budgeting.ui.theme.PremiumRed
import com.griffin.budgeting.ui.theme.PremiumTypography
import com.griffin.budgeting.ui.theme.TextSecondary

@Composable
fun SignupScreen(
    viewModel: SignupViewModel,
    onNavigateToLogin: () -> Unit,
) {
    val uiState by viewModel.uiState.collectAsState()
    val firstName by viewModel.firstName.collectAsState()
    val lastName by viewModel.lastName.collectAsState()
    val email by viewModel.email.collectAsState()
    val password by viewModel.password.collectAsState()
    val confirmPassword by viewModel.confirmPassword.collectAsState()

    val isLoading = uiState is SignupUiState.Loading
    val errorMessage = (uiState as? SignupUiState.Error)?.message

    BudgetingPremiumTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(DarkBackground)
                .padding(horizontal = 24.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(modifier = Modifier.height(48.dp))

            Text(
                text = "Create Account",
                style = PremiumTypography.hero,
                color = AccentCyan,
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Get started with budgeting",
                style = PremiumTypography.body,
                color = TextSecondary,
            )

            Spacer(modifier = Modifier.height(32.dp))

            AuthTextField(
                value = firstName,
                onValueChange = viewModel::onFirstNameChange,
                label = "First Name",
                isError = errorMessage != null,
            )

            Spacer(modifier = Modifier.height(12.dp))

            AuthTextField(
                value = lastName,
                onValueChange = viewModel::onLastNameChange,
                label = "Last Name",
                isError = errorMessage != null,
            )

            Spacer(modifier = Modifier.height(12.dp))

            AuthTextField(
                value = email,
                onValueChange = viewModel::onEmailChange,
                label = "Email",
                keyboardType = KeyboardType.Email,
                isError = errorMessage != null,
            )

            Spacer(modifier = Modifier.height(12.dp))

            AuthTextField(
                value = password,
                onValueChange = viewModel::onPasswordChange,
                label = "Password",
                isPassword = true,
                isError = errorMessage != null,
            )

            Spacer(modifier = Modifier.height(12.dp))

            AuthTextField(
                value = confirmPassword,
                onValueChange = viewModel::onConfirmPasswordChange,
                label = "Confirm Password",
                isPassword = true,
                imeAction = ImeAction.Done,
                onImeAction = viewModel::signup,
                isError = errorMessage != null,
            )

            if (errorMessage != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = errorMessage,
                    color = PremiumRed,
                    style = PremiumTypography.caption,
                    modifier = Modifier.fillMaxWidth(),
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            AuthButton(
                text = "Sign Up",
                onClick = viewModel::signup,
                isLoading = isLoading,
            )

            Spacer(modifier = Modifier.height(16.dp))

            TextButton(onClick = onNavigateToLogin) {
                Text(
                    "Already have an account? Login",
                    color = AccentCyan,
                )
            }

            Spacer(modifier = Modifier.height(48.dp))
        }
    }
}
