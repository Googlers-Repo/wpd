package dev.mmrl.wpd.providable

import androidx.compose.runtime.staticCompositionLocalOf
import dev.mmrl.wpd.util.PreferenceStore

val LocalPreferenceStore = staticCompositionLocalOf<PreferenceStore> {
    error("PreferenceStore not provided")
}