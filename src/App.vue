<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()

// Sign in and sign up pages have their own small footer
const showFooter = computed(() => !!route.meta.requiresAuth)
</script>

<template>
  <RouterView />
  <AppFooter v-if="showFooter" />
</template>
