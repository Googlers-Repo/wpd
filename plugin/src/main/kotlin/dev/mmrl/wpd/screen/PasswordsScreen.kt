package dev.mmrl.wpd.screen

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.text.style.TextOverflow
import com.dergoogler.mmrl.platform.file.SuFile
import com.dergoogler.mmrl.ui.component.PageIndicator
import com.dergoogler.mmrl.ui.component.listItem.dsl.List
import dev.mmrl.wpd.component.Toolbar
import dev.mmrl.wpd.component.WifiItem
import dev.mmrl.wpd.model.WifiNetwork

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PasswordsScreen() {
    val scrollBehavior = TopAppBarDefaults.pinnedScrollBehavior()

    val prefs = getSharedPreferences()

    val hidePasswords = prefs.getBoolean("hidePasswords", true)

    val networks = remember {
        SuFile("/data/misc").fromPaths(
            "wifi/WifiConfigStore.xml",
            "apexdata/com.android.wifi/WifiConfigStore.xml"
        )
    }

    val wifiNetworks by remember(networks) {
        derivedStateOf {
            if (networks == null) return@derivedStateOf null
            WifiNetwork.parseXml(networks.readText())
        }
    }

    Scaffold(
        modifier = Modifier.nestedScroll(scrollBehavior.nestedScrollConnection),
        topBar = {
            Toolbar("Passwords")
        },
    ) { padding ->
        List(
            modifier = Modifier
                .padding(padding)
                .fillMaxWidth()
        ) {
            if (networks != null || wifiNetworks != null) {
                LazyColumn {
                    items(
                        items = wifiNetworks!!,
                        key = { it.ssid }
                    ) { network ->
                        WifiItem(
                            network = network,
                            hidePass = hidePasswords
                        )
                    }
                }
            } else {
                PageIndicator(
                    icon = {
                        Icon(
                            imageVector = Icons.Rounded.Lock,
                            contentDescription = null
                        )
                    },
                    text = {
                        Text(
                            text = "No networks found",
                            style = MaterialTheme.typography.titleLarge,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            color = LocalContentColor.current
                        )
                    },
                )
            }
        }
    }
}
