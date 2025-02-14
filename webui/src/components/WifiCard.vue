<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{ ssid: string; psk: string | null }>();

import { Config } from "mmrl";

const config = computed(() => new Config("mmrl_wpd"));

const hidePasswords = ref(
  config.value.get(`hide_password.${props.ssid}`, true as any)
);

const changeHidePasswords = () => {
  if (hidePasswords.value) {
    config.value.set(`hide_password.${props.ssid}`, false);
  } else {
    config.value.set(`hide_password.${props.ssid}`, true);
  }

  hidePasswords.value = config.value.get(
    `hide_password.${props.ssid}`,
    true as any
  );
};
</script>

<template>
  <div class="wifi-card">
    <span class="wifi-ssid">{{ props.ssid }}</span>
    <span
      @click="changeHidePasswords"
      v-if="props.psk !== null"
      class="wifi-psk"
    >
      {{
        hidePasswords ? props.psk.slice(1, 9).replace(/./gm, "•") : props.psk
      }}
    </span>
    <span
      @click="changeHidePasswords"
      v-else
      class="wifi-psk"
      :style="{
        fontStyle: 'italic',
      }"
    >
      This network has no password
    </span>
  </div>
</template>

<style scoped>
.wifi-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 24px;
  border-radius: 20px;
  background-color: var(--tonalSurface);
}

.wifi-ssid {
  font-size: 1.34em;
  font-weight: bold;
}

.wifi-psk {
  user-select: text;
  background-color: var(--background);
  border-radius: 10px;
  padding: 16px 12px;
  font-size: 1em;
}
</style>
