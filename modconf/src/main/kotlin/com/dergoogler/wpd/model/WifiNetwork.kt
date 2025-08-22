package com.dergoogler.wpd.model

import android.annotation.SuppressLint
import android.content.Context
import android.net.wifi.WifiConfiguration
import android.net.wifi.WifiManager
import android.util.Log
import android.util.Xml
import org.xmlpull.v1.XmlPullParser
import org.xmlpull.v1.XmlPullParserException

data class WifiNetwork(
    val ssid: String,
    val password: String,
) {
    @SuppressLint("MissingPermission")
    fun getConfiguration(context: Context): WifiConfiguration? {
        val wifiManager =
            context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager

        return try {
            wifiManager.configuredNetworks.find { it.SSID == ssid }
        } catch (e: Exception) {
            Log.e("WifiNetwork", "Error getting configuration: ${e.message}")
            null
        }
    }

    private fun getSecurityType(config: WifiConfiguration): String {
        return when {
            config.allowedKeyManagement.get(WifiConfiguration.KeyMgmt.WPA_PSK) -> "WPA"
            config.allowedKeyManagement.get(WifiConfiguration.KeyMgmt.WPA_EAP) ||
                    config.allowedKeyManagement.get(WifiConfiguration.KeyMgmt.IEEE8021X) -> "WPA-EAP"

            config.wepKeys[0] != null -> "WEP"
            else -> "Open"
        }
    }


    companion object {
        fun parseXml(xmlData: String): List<WifiNetwork> {
            val wifiNetworks = mutableListOf<WifiNetwork>()
            val parser = Xml.newPullParser()
            parser.setInput(xmlData.reader())

            var eventType = parser.eventType
            var currentSSID: String? = null
            var currentPassword: String? = null

            try {
                while (eventType != XmlPullParser.END_DOCUMENT) {
                    val name = parser.name
                    when (eventType) {
                        XmlPullParser.START_TAG -> {
                            if (name == "string" && parser.getAttributeValue(
                                    null,
                                    "name"
                                ) == "SSID"
                            ) {
                                currentSSID = parser.nextText().removeSurrounding("\"")
                            }
                            if (name == "string" && parser.getAttributeValue(
                                    null,
                                    "name"
                                ) == "PreSharedKey"
                            ) {
                                currentPassword = parser.nextText().removeSurrounding("\"")
                            }
                        }

                        XmlPullParser.END_TAG -> {
                            if (name == "WifiConfiguration" && currentSSID != null && currentPassword != null) {
                                wifiNetworks.add(WifiNetwork(currentSSID, currentPassword))
                                currentSSID = null
                                currentPassword = null
                            }
                        }
                    }
                    eventType = parser.next()
                }
            } catch (e: XmlPullParserException) {
                println("XML Parsing Error: ${e.message}")
            } catch (e: Exception) {
                e.printStackTrace()
            }
            return wifiNetworks
        }
    }
}