<script setup>
import logo from '@/assets/logo.png'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__grid">
      <div class="app-footer__brand">
        <img :src="logo" alt="Cargofy" class="app-footer__logo" />
        <p class="app-footer__desc">
          International shipment tracking for air, sea and road freight.
        </p>
        <ul class="app-footer__modes" aria-label="Transport modes">
          <li>✈️ Air</li>
          <li>🚢 Sea</li>
          <li>🚚 Road</li>
        </ul>
      </div>

      <nav class="app-footer__links" aria-label="Footer navigation">
        <h2>Quick links</h2>
        <ul class="app-footer__list">
          <li><router-link to="/dashboard">Dashboard</router-link></li>
          <li><router-link to="/shipments">Shipments</router-link></li>
          <li><router-link to="/account">Profile</router-link></li>
        </ul>
      </nav>

      <div class="app-footer__contact">
        <h2>Contact</h2>
        <ul class="app-footer__list">
          <li>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Calle Comercio 42, Gijón
          </li>
          <li>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            Support: Mon–Fri, 9:00–18:00
          </li>
          <li>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
            support@cargofy.dev
          </li>
        </ul>
      </div>
    </div>

    <div class="app-footer__bottom">
      <span>© {{ year }} Cargofy. All rights reserved.</span>
      <span>Demo project built at Factoría F5</span>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  padding-bottom: 80px;
  background: var(--color-card);
  border-top: 1px solid #e2e8f0;
  color: var(--color-text);
}

.app-footer__grid {
  display: grid;
  gap: 24px;
  max-width: 960px;
  margin: 0 auto;
  padding: 28px 16px 20px;
}

.app-footer__logo {
  width: 110px;
}

.app-footer__desc {
  max-width: 32ch;
  margin-top: 8px;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.app-footer__modes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.app-footer__modes li {
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--color-soft);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.app-footer h2 {
  margin-bottom: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.app-footer__list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;
  color: var(--color-text);
}

.app-footer__list li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-footer__list svg {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.app-footer a {
  color: var(--color-text);
}

.app-footer a:hover {
  color: var(--color-primary);
}

.app-footer__bottom {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 928px;
  margin: 0 16px;
  padding: 14px 0 18px;
  border-top: 1px solid #e2e8f0;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

@media (min-width: 768px) {
  .app-footer {
    padding-bottom: 0;
  }

  .app-footer__grid {
    grid-template-columns: 1fr auto 1fr;
    gap: 32px;
    padding: 32px 16px 24px;
  }

  .app-footer__links {
    justify-self: center;
  }

  .app-footer__contact {
    justify-self: end;
  }

  .app-footer__bottom {
    flex-direction: row;
    justify-content: space-between;
    margin: 0 auto;
    padding: 14px 0 18px;
  }
}
</style>
