package dev.mmrl.wpd.providable

import androidx.compose.runtime.staticCompositionLocalOf
import com.dergoogler.mmrl.webui.interfaces.WXInterface

val LocalWXInterface = staticCompositionLocalOf<WXInterface> {
    error("WXInterface not provided")
}