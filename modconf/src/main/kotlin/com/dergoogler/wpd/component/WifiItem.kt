package com.dergoogler.wpd.component

import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.style.TextOverflow
import com.dergoogler.mmrl.ui.component.listItem.dsl.ListScope
import com.dergoogler.mmrl.ui.component.listItem.dsl.component.Item
import com.dergoogler.mmrl.ui.component.listItem.dsl.component.item.Description
import com.dergoogler.mmrl.ui.component.listItem.dsl.component.item.Title
import com.dergoogler.wpd.ext.limitOrExtend
import com.dergoogler.wpd.model.WifiNetwork

@Composable
fun ListScope.WifiItem(
    network: WifiNetwork,
    hidePass: Boolean,
) {
    Item {
        Title(network.ssid)
        Description {
            if (hidePass) {
                Text(
                    text = "•".repeat(network.password.length).limitOrExtend(),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                return@Description
            }

            SelectionContainer {
                Text(
                    text = network.password,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}