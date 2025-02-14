<script setup lang="ts">
import { computed, onMounted, ref, reactive } from "vue";
import WifiCard from "./WifiCard.vue";
import { FileSystem, Toast } from "mmrl";

const config = ref("");
const networks = ref([]);

const paths = [
  "/data/misc/apexdata/com.android.wifi/WifiConfigStore.xml",
  "/data/misc/wifi/WifiConfigStore.xml",
];

onMounted(() => {
  const fs = new FileSystem("mmrl_wpd");

  for (const path of paths) {
    if (fs.exists(path)) {
      config.value = fs.read(path);
    }
  }

  const wifiXmlParser = new DOMParser();
  const xml = wifiXmlParser.parseFromString(config.value, "text/xml");

  const WifiConfigStoreData = xml.getElementsByTagName(
    "WifiConfigStoreData"
  )[0];
  const NetworkList =
    WifiConfigStoreData.getElementsByTagName("NetworkList")[0];

  const WifiConfiguration = [
    ...NetworkList.getElementsByTagName("WifiConfiguration"),
  ];

  networks.value = WifiConfiguration.map((s) => {
    const ssid = s.querySelector('string[name="SSID"]').innerHTML;

    const psk = s.querySelector('string[name="PreSharedKey"]');

    return {
      ssid: ssid.replace(/"(.+)"/g, "$1"),
      psk: psk ? psk.innerHTML.replace(/"(.+)"/g, "$1") : null,
    };
  });
});
</script>

<template>
  <div class="container">
    <WifiCard v-for="network in networks" :key="network.ssid" :ssid="network.ssid" :psk="network.psk" />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  padding-bottom: calc(16px + var(--window-inset-bottom, 0px)) !important;
}
</style>
