<script setup>
import { usePermissions } from '@/composables/usePermissions'

const { canCreateShipment } = usePermissions()
</script>

<template>
  <nav class="app-nav" aria-label="Main navigation">
    <router-link to="/dashboard" class="app-nav__item">
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
      <span>Dashboard</span>
    </router-link>

    <router-link to="/shipments" class="app-nav__item">
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
        <path d="M3 8l9 5 9-5M12 13v8" />
      </svg>
      <span>Shipments</span>
    </router-link>

    <router-link
      v-if="canCreateShipment"
      to="/shipments/new"
      class="app-nav__fab"
      aria-label="Create new shipment"
    >
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </router-link>

    <router-link to="/account" class="app-nav__item">
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </svg>
      <span>Profile</span>
    </router-link>

    <router-link to="/account" class="app-nav__item">
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" />
        <path
          d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
        />
      </svg>
      <span>Settings</span>
    </router-link>
  </nav>
</template>

<style scoped>
.app-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
  background: var(--color-card);
  box-shadow: 0 -1px 4px rgba(15, 23, 42, 0.08);
}

.app-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 56px;
  font-size: 0.7rem;
  font-weight: 500;
  color: #b5b6bf;
  text-decoration: none;
}

.app-nav__item.router-link-active {
  color: var(--color-primary);
}

.app-nav__fab {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin-top: -24px;
  border-radius: 50%;
  background: var(--color-accent);
  color: #fff;
  box-shadow: 0 4px 10px rgba(253, 118, 26, 0.4);
}

@media (min-width: 768px) {
  .app-nav {
    top: 0;
    bottom: auto;
    justify-content: center;
    gap: 24px;
    padding: 10px 16px;
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
  }

  .app-nav__item {
    flex-direction: row;
    gap: 8px;
    font-size: 0.9rem;
  }

  .app-nav__fab {
    width: 40px;
    height: 40px;
    margin-top: 0;
  }
}
</style>
