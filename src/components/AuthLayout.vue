<script setup>
import '../assets/auth.css'
import heroImage from '@/assets/hero-logistics.jpg'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
</script>

<template>
  <main class="auth-page">
    <LanguageSwitcher class="auth-lang" />

    <div class="auth-main">
      <slot />
    </div>

    <aside class="auth-showcase" aria-hidden="true">
      <div class="auth-showcase__inner" :style="{ '--showcase-image': `url(${heroImage})` }">
        <span class="auth-showcase__chip">{{ $t('showcase.chip') }}</span>
        <h2 class="auth-showcase__title">
          {{ $t('showcase.titleLine1') }}<br />{{ $t('showcase.titleLine2') }}
        </h2>
        <p class="auth-showcase__text">{{ $t('showcase.text') }}</p>
      </div>
    </aside>
  </main>
</template>

<style scoped>
.auth-page {
  position: relative;
}

.auth-lang {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
}

.auth-showcase {
  display: none;
}

@media (min-width: 900px) {
  .auth-showcase {
    display: block;
    background: linear-gradient(180deg, #081c5c 0%, #0b2a8a 100%);
  }

  .auth-showcase__inner {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 72px 48px;
    overflow: hidden;
    color: #fff;
  }

  .auth-showcase__inner::before {
    content: '';
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    aspect-ratio: 1.83;
    background-image: var(--showcase-image);
    background-position: center;
    background-size: cover;
    mask-image: linear-gradient(180deg, transparent 0%, #000 40%);
    -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 40%);
  }

  .auth-showcase__inner > * {
    position: relative;
  }

  .auth-showcase__chip {
    align-self: flex-start;
    padding: 4px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
    font-size: 0.8rem;
    font-weight: 600;
  }

  .auth-showcase__title {
    margin-top: 20px;
    font-size: 2.6rem;
    font-weight: 800;
    line-height: 1.1;
  }

  .auth-showcase__text {
    max-width: 420px;
    margin-top: 14px;
    font-size: 1.05rem;
    opacity: 0.88;
    text-wrap: balance;
  }
}
</style>
