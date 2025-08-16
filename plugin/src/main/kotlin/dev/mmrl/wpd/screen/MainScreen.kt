package dev.mmrl.wpd.screen

import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavDestination
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.currentBackStackEntryAsState
import com.dergoogler.mmrl.ext.navigatePopUpTo
import com.dergoogler.mmrl.ext.none
import com.dergoogler.mmrl.ui.providable.LocalNavController
import dev.mmrl.wpd.navigation.MainRoute
import dev.mmrl.wpd.navigation.graphs.passwordsGraph
import dev.mmrl.wpd.navigation.graphs.settingsGraph

@Composable
fun MainScreen() {
    val navController = LocalNavController.current

    Scaffold(
        bottomBar = {
            BottomNav()
        },
        contentWindowInsets = WindowInsets.none
    ) { innerPadding ->
        NavHost(
            modifier = Modifier.padding(innerPadding),
            navController = navController,
            startDestination = MainRoute.PasswordsRoute.route
        ) {
            passwordsGraph()
            settingsGraph()
        }
    }
}

private val mainScreens = listOf(
    MainRoute.PasswordsRoute,
    MainRoute.SettingsRoute
)

@Composable
private fun BottomNav() {
    val navController = LocalNavController.current

    NavigationBar(
        modifier = Modifier
            .imePadding()
    ) {
        mainScreens.forEach { screen ->
            val selected = navController.isSelected(screen)

            NavigationBarItem(
                icon = {
                    Icon(
                        imageVector = if (selected) screen.iconFilled else screen.icon,
                        contentDescription = null,
                    )
                },
                label = {
                    Text(
                        text = screen.label,
                        style = MaterialTheme.typography.labelLarge
                    )
                },
                alwaysShowLabel = true,
                selected = selected,
                onClick = {
                    navController.navigatePopUpTo(
                        route = screen.route,
                        restoreState = false
                    )
                }
            )
        }
    }
}

@Composable
private fun NavHostController.currentDestination(): NavDestination? {
    val navBackStackEntry by this.currentBackStackEntryAsState()
    return navBackStackEntry?.destination
}

@Composable
private fun NavHostController.isSelected(screen: MainRoute): Boolean {
    val currentDestination = this.currentDestination()
    return currentDestination?.hierarchy?.any { it.route == screen.route } == true
}