package dev.mmrl.wpd.util

import android.content.SharedPreferences
import androidx.core.content.edit
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class PreferenceStore(private val prefs: SharedPreferences) {

    val hidePasswords = DestructurablePreference<Boolean>(
        prefs = prefs,
        key = "hidePasswords",
        default = true
    )

    class DestructurablePreference<T>(
        private val prefs: SharedPreferences,
        private val key: String,
        private val default: T
    ) {
        @Suppress("UNCHECKED_CAST")
        private fun getValue(): T = when (default) {
            is Boolean -> prefs.getBoolean(key, default) as T
            is Int -> prefs.getInt(key, default) as T
            is Float -> prefs.getFloat(key, default) as T
            is Long -> prefs.getLong(key, default) as T
            is String -> prefs.getString(key, default) as T
            is Set<*> -> prefs.getStringSet(key, default as Set<String>) as T
            else -> throw IllegalArgumentException("Unsupported type: ${default!!::class}")
        }

        private fun setValue(value: T) {
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

        private val _state = MutableStateFlow(getValue())
        val state: StateFlow<T> get() = _state

        init {
            prefs.registerOnSharedPreferenceChangeListener { sp, changedKey ->
                if (changedKey == key) {
                    _state.value = getValue()
                }
            }
        }

        operator fun component1(): StateFlow<T> = state
        operator fun component2(): (T) -> Unit = ::setValue

        fun set(value: T) = setValue(value)
    }
}
