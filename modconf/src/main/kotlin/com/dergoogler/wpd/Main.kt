package com.dergoogler.wpd

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.navigation.compose.rememberNavController
import com.dergoogler.mmrl.modconf.Kontext
import com.dergoogler.mmrl.modconf.ModConfModule
import com.dergoogler.mmrl.modconf.model.TargetPackage
import com.dergoogler.mmrl.ui.providable.LocalNavController
import com.dergoogler.wpd.screen.MainScreen

class Main(kontext: Kontext) : ModConfModule(kontext) {
    override val id: String = "mmrl_wpd"
    override val version: Long = 1L

    override val targetPackages: List<TargetPackage> = listOf(
        TargetPackage(
            Regex("^com.dergoogler.mmrl.wx(.debug)?$"), 266L
        )
    )

    @Composable
    override fun Content() {
        val navController = rememberNavController()

        CompositionLocalProvider(
            LocalNavController provides navController,
        ) {
            MainScreen()
        }
    }
}