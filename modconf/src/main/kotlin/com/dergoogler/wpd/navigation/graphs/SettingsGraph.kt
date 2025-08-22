package com.dergoogler.wpd.navigation.graphs

import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import androidx.navigation.navigation
import com.dergoogler.wpd.navigation.MainRoute
import com.dergoogler.wpd.screen.SettingsScreen

enum class SettingsGraph(val route: String) {
    Home("Home"),
}

fun NavGraphBuilder.settingsGraph() = navigation(
    startDestination = SettingsGraph.Home.route,
    route = MainRoute.SettingsRoute.route
) {
    composable(
        route = SettingsGraph.Home.route,
        enterTransition = { fadeIn() },
        exitTransition = { fadeOut() }
    ) {
        SettingsScreen()
    }
}