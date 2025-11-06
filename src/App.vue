<template>
  <div id="app">
    <ParticlesBackground v-if="showParticles" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ParticlesBackground from '@/components/ParticlesBackground.vue'

const route = useRoute()

// Show particles only on login/license page
const showParticles = computed(() => {
  return route.name === 'license' || route.path === '/'
})
</script>

<style>
#app {
  position: relative;
  min-height: 100vh;
}

/* Ensure router content is above particles */
#app > :not(.particles-background) {
  position: relative;
  z-index: 1;
}
</style>