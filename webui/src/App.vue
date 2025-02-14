<script setup lang="ts">
import { computed, onMounted } from "vue";
import { mmrl } from "mmrl";

import MMRLContainer from "./components/MMRLContainer.vue";

const isMMRL =
  window.navigator.userAgent === "DON'T TRACK ME DOWN MOTHERFUCKER!";
const required = 33162;
const isSupported = !(mmrl.versionCode < required);
</script>

<template>
  <div v-if="isMMRL && isSupported" :style="{ height: '100%' }">
    <MMRLContainer />
  </div>
  <div class="only-in-mmrl" v-else>
    <img src="/assets/VitePressLogo-512px.webp" class="logo" alt="Vue logo" />
    <h2>Not Supported</h2>
    <h3>
      This module can only be used in MMRL and requires at least MMRL with the
      version code <code>{{ required }}</code>
    </h3>
  </div>
</template>

<style scoped>
.only-in-mmrl {
  margin: 0 auto;
  padding: 32px;
  text-align: center;
  height: calc(
    100% - 16px - var(--window-inset-bottom, 0px) - var(--window-inset-top, 0px)
  );
  align-content: center;

  h3 {
    font-weight: unset;
  }

  code {
    border-radius: 4px;
    padding: 3px 6px;
    background-color: #e1e0f9ff;
    transition: color 0.25s, background-color 0.5s;
    color: #191a2cff;
  }
}

.logo {
  height: 12em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
  filter: drop-shadow(0 0 2em #3e63ddaa);
}
</style>
