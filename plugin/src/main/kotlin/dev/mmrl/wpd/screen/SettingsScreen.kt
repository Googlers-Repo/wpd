package dev.mmrl.wpd.screen

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.edit
import com.dergoogler.mmrl.ui.component.listItem.dsl.List
import com.dergoogler.mmrl.ui.component.listItem.dsl.ListScope
import com.dergoogler.mmrl.ui.component.listItem.dsl.component.SwitchItem
import com.dergoogler.mmrl.ui.component.listItem.dsl.component.item.Description
import com.dergoogler.mmrl.ui.component.listItem.dsl.component.item.Title
import dev.mmrl.wpd.component.Toolbar
import dev.mmrl.wpd.providable.LocalPreferenceStore

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen() {
    val scrollBehavior = TopAppBarDefaults.pinnedScrollBehavior()
    val context = LocalContext.current


    Scaffold(
        modifier = Modifier.nestedScroll(scrollBehavior.nestedScrollConnection),
        topBar = {
            Toolbar("Settings")
        },
    ) { innerPadding ->
        List(
            modifier = Modifier.padding(innerPadding)
        ) {
            SwitchPrefItem(
                title = "Hide Passwords",
                key = "hidePasswords",
                default = true,
                description = "Hides the passwords of the WiFi networks",
            )


        }
    }
}

@Composable
fun getSharedPreferences(): SharedPreferences {
    val context = LocalContext.current
    return remember { context.getSharedPreferences("mmrl_wpd", Context.MODE_PRIVATE) }
}

@Composable
inline fun <reified T> ListScope.SwitchPrefItem(
    title: String,
    key: String,
    default: T,
    description: String? = null,
) {
    val prefs = getSharedPreferences()

    val getValue = fun(): T {
        return when (default) {
            is Boolean -> prefs.getBoolean(key, default) as T
            is Int -> prefs.getInt(key, default) as T
            is Float -> prefs.getFloat(key, default) as T
            is Long -> prefs.getLong(key, default) as T
            is String -> prefs.getString(key, default) as T
            is Set<*> -> prefs.getStringSet(key, default as Set<String>) as T
            else -> throw IllegalArgumentException("Unsupported type: ${default!!::class}")
        }
    }

    val setValue = fun(value: T) {
        prefs.edit {
            when (value) {
                is Boolean -> putBoolean(key, value)
                is Int -> putInt(key, value)
                is Float -> putFloat(key, value)
                is Long -> putLong(key, value)
                is String -> putString(key, value)
                is Set<*> -> putStringSet(key, value as Set<String>)
                else -> throw IllegalArgumentException("Unsupported type: ${value!!::class}")
            }
        }
    }

    var state by rememberSaveable {
        mutableStateOf(getValue())
    }

    if (state !is Boolean) return

    SwitchItem(
        checked = state as Boolean,
        onChange = {
            state = it as T
            setValue(it)
        }
    ) {
        Title(title)
        if (description != null) {
            Description(description)
        }
    }
}