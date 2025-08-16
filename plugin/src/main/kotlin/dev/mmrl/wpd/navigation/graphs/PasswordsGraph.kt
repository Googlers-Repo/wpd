package dev.mmrl.wpd.navigation.graphs


import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import androidx.navigation.navigation
import dev.mmrl.wpd.navigation.MainRoute
import dev.mmrl.wpd.screen.PasswordsScreen

enum class PasswordsGraph(val route: String) {
    Home("Home"),
}

fun NavGraphBuilder.passwordsGraph() = navigation(
    startDestination = PasswordsGraph.Home.route,
    route = MainRoute.PasswordsRoute.route
) {
    composable(
        route = PasswordsGraph.Home.route,
        enterTransition = { fadeIn() },
        exitTransition = { fadeOut() }
    ) {
        PasswordsScreen()
    }
}