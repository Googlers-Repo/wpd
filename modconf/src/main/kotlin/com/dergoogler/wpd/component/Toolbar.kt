package com.dergoogler.wpd.component

import androidx.compose.foundation.layout.RowScope
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarScrollBehavior
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Toolbar(
    title: String,
    scrollBehavior: TopAppBarScrollBehavior? = null,
    actions: @Composable() (RowScope.() -> Unit) = {},
) {
    val bottomBorderColor = MaterialTheme.colorScheme.outlineVariant

    TopAppBar(
        modifier = Modifier.drawBehind {
            drawLine(
                color = bottomBorderColor,
                start = Offset(0f, size.height),
                end = Offset(size.width, size.height),
                strokeWidth = Dp.Hairline.toPx()
            )
        },
        title = {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                color = LocalContentColor.current
            )
        },
        actions = actions,
        scrollBehavior = scrollBehavior
    )
}