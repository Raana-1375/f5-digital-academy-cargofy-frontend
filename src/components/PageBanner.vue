<script setup>
import heroImage from '@/assets/hero-logistics.jpg'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <section class="page-banner" :style="{ '--banner-image': `url(${heroImage})` }">
    <div class="page-banner__content">
      <h1 class="page-banner__title">{{ title }}</h1>
      <p v-if="subtitle" class="page-banner__subtitle">{{ subtitle }}</p>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.page-banner {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 120px;
  padding: 20px;
  margin-bottom: 20px;
  overflow: hidden;
  border-radius: 18px;
  background: linear-gradient(90deg, #081c5c 0%, #0b2a8a 100%);
  color: #fff;
}

.page-banner::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  aspect-ratio: 1.83;
  background-image: var(--banner-image);
  background-position: right center;
  background-repeat: no-repeat;
  background-size: cover;
  mask-image: linear-gradient(90deg, transparent 0%, #000 45%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 45%);
}

.page-banner__content {
  position: relative;
}

.page-banner__title {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.15;
}

.page-banner__subtitle {
  margin-top: 6px;
  font-size: 0.9rem;
  opacity: 0.88;
}

@media (min-width: 768px) {
  .page-banner {
    min-height: 140px;
    padding: 24px 32px;
  }

  .page-banner__title {
    font-size: 2rem;
  }
}
</style>
