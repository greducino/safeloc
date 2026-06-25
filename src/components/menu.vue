<template>
  <nav class="navbar">
    <div class="container nav-inner">
      <RouterLink to="/" class="nav-brand">
        <div class="brand-shield">🛡️</div>
        <div class="brand-text">
          <span class="brand-name">SafeLoc</span>
          <span class="brand-sub">SENAI · Segurança em Primeiro Lugar</span>
        </div>
      </RouterLink>

      <button class="hamburger" @click="menuOpen = !menuOpen" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>

      <ul class="nav-links" :class="{ open: menuOpen }">
        <template v-if="!user">
          <li><RouterLink to="/epis" class="nav-link" @click="menuOpen = false">EPIs</RouterLink></li>
          <li><RouterLink to="/login" class="nav-link btn-nav" @click="menuOpen = false">Entrar</RouterLink></li>
          <li><RouterLink to="/registro" class="nav-link btn-accent" @click="menuOpen = false">Criar Conta</RouterLink></li>
        </template>
        <template v-else>
          <li><RouterLink to="/dashboard" class="nav-link" @click="menuOpen = false">Dashboard</RouterLink></li>
          <li><RouterLink to="/epis" class="nav-link" @click="menuOpen = false">EPIs</RouterLink></li>
          <li>
            <button class="nav-link btn-logout" @click="handleLogout">
              <span class="logout-icon">↩</span> Sair
            </button>
          </li>
        </template>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '@/composables/useSupabase.js'

const router = useRouter()
const user = ref(null)
const menuOpen = ref(false)

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  user.value = data.user
  supabase.auth.onAuthStateChange((_, session) => {
    user.value = session?.user || null
  })
})

async function handleLogout() {
  await supabase.auth.signOut()
  menuOpen.value = false
  router.push('/')
}
</script>

<style scoped>
.navbar {
  background: #1a3a6b;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.25);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 2px solid #e8a020;
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-shield {
  font-size: 1.8rem;
  line-height: 1;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.5px;
  line-height: 1;
}

.brand-sub {
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
  margin-top: 2px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.nav-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
}

.btn-nav {
  border: 1px solid rgba(255, 255, 255, 0.35) !important;
}

.btn-nav:hover {
  border-color: rgba(255, 255, 255, 0.6) !important;
}

.btn-accent {
  background: #e8a020 !important;
  color: #ffffff !important;
  font-weight: 700 !important;
}

.btn-accent:hover {
  background: #f0b030 !important;
}

.btn-logout {
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  font-family: inherit;
}

.logout-icon {
  font-size: 1rem;
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
}

.hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background: #ffffff;
  border-radius: 2px;
  transition: transform 0.2s;
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .nav-links {
    display: none;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    background: #1a3a6b;
    flex-direction: column;
    align-items: stretch;
    padding: 12px 16px;
    gap: 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 2px solid #e8a020;
  }

  .nav-links.open {
    display: flex;
  }

  .nav-links li {
    width: 100%;
  }

  .nav-link {
    display: flex;
    width: 100%;
    justify-content: flex-start;
  }
}
</style>