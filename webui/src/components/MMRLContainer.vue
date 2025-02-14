<script setup lang="ts">
import { computed } from "vue";
import Passwords from "./Passwords.vue";
import { MMRLInterfaceFactory } from "mmrl";

const mi = MMRLInterfaceFactory("mmrl_wpd");

const hasAccess = computed(() => mi.hasAccessToFileSystem);

const grantAccess = () => {
  if (!hasAccess.value) {
    mi.requestFileSystemAPI();
  }
};
</script>

<template>
  <div v-if="hasAccess">
    <div class="navbar">WiFi Password Viewer</div>
    <Passwords />
  </div>
  <div v-else class="only-in-mmrl">
    <img src="/assets/VitePressLogo-512px.webp" class="logo" alt="Vue logo" />
    <h2>Missing Permission</h2>
    <h3>
      This module has no access to the FileSystem API. Please give the
      permission otherwise you can't use this module.
    </h3>
    <button type="button" @click="grantAccess">Grant</button>
  </div>
</template>

<style scoped>
.navbar {
  padding-top: calc(16px + var(--window-inset-top, 0px)) !important;
  top: 0;
  position: sticky;
  padding: 16px;
  font-size: 1.25rem;
  font-weight: bold;
  background-color: var(--tonalSurface);
  border-bottom: 1px solid var(--border);
}

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
