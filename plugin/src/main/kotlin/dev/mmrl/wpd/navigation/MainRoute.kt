package dev.mmrl.wpd.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.ui.graphics.vector.ImageVector

enum class MainRoute(
    val route: String,
    val label: String,
    val icon: ImageVector,
    val iconFilled: ImageVector,
) {
    PasswordsRoute(
        route = "PasswordsScreen",
        label = "Passwords",
        icon = Icons.Outlined.Lock,
        iconFilled = Icons.Filled.Lock
    ),

    SettingsRoute(
        route = "SettingsScreen",
        label = "Settings",
        icon = Icons.Outlined.Settings,
        iconFilled = Icons.Filled.Settings
    ),
}