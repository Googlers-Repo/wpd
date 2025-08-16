package dev.mmrl.wpd

import android.annotation.SuppressLint
import android.view.ViewGroup
import androidx.activity.ComponentActivity
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.ComposeView
import androidx.navigation.compose.rememberNavController
import com.dergoogler.mmrl.ui.providable.LocalNavController
import com.dergoogler.mmrl.webui.interfaces.WXInterface
import com.dergoogler.mmrl.webui.interfaces.WXOptions
import dev.mmrl.wpd.providable.LocalPreferenceStore
import dev.mmrl.wpd.providable.LocalWXInterface
import dev.mmrl.wpd.screen.MainScreen
import dev.mmrl.wpd.util.PreferenceStore
import java.lang.UnsupportedOperationException

class Main(wxOptions: WXOptions) : WXInterface(wxOptions) {
    override var name = "Stub!"

    init {
        if (modId.id != "mmrl_wpd") {
            throw UnsupportedOperationException("Module ID Mismatch!")
        }
    }

    @SuppressLint("MissingPermission")
    private fun init() {
        val act = activity as? ComponentActivity ?: return

        val sharedPrefs = act.getSharedPreferences(
            "mmrl_wpd", MODE_PRIVATE
        )

        // Delay execution until the view is fully initialized
        post {
            // Remove the WebView from its parent
            (parent as? ViewGroup)?.removeView(this)

            // Add a full-screen ComposeView instead
            act.addContentView(
                ComposeView(act).apply {
                    setContent {
                        val navController = rememberNavController()
                        val preferenceStore = remember(sharedPrefs) { PreferenceStore(sharedPrefs) }

                        CompositionLocalProvider(
                            LocalPreferenceStore provides preferenceStore,
                            LocalNavController provides navController,
                            LocalWXInterface provides this@Main
                        ) {
                            MaterialTheme(
                                colorScheme = options.colorScheme
                            ) {
                                MainScreen()
                            }
                        }
                    }
                },
                ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
            )
        }
    }

    init {
        init()
    }
}