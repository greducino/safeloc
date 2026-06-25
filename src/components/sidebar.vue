<template>
  <aside class="sidebar" :class="{ collapsed }">
    <button class="collapse-btn" @click="collapsed = !collapsed" :title="collapsed ? 'Expandir' : 'Recolher'">
      {{ collapsed ? '▶' : '◀' }}
    </button>

    <nav class="sidebar-nav">
      <!-- TODOS os roles -->
      <RouterLink to="/dashboard" class="sidebar-link" title="Dashboard">
        <span class="icon">📊</span>
        <span class="label">Dashboard</span>
      </RouterLink>
      <RouterLink to="/epis" class="sidebar-link" title="EPIs">
        <span class="icon">🦺</span>
        <span class="label">EPIs</span>
      </RouterLink>
      <RouterLink to="/locacao" class="sidebar-link" title="Locações">
        <span class="icon">📋</span>
        <span class="label">Locações</span>
      </RouterLink>
      <RouterLink to="/perfil" class="sidebar-link" title="Perfil">
        <span class="icon">👤</span>
        <span class="label">Perfil</span>
      </RouterLink>
      <RouterLink to="/funcionarios" class="sidebar-link" title="Funcionários">
        <span class="icon">👷</span>
        <span class="label">Funcionários</span>
      </RouterLink>
    </nav>
  </aside>
</template>


<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const collapsed = ref(false)
</script>

<style scoped>
.sidebar {
  width: 220px;
  background: var(--white);
  border-right: 1px solid var(--gray-200);
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  transition: width 0.25s;
  position: relative;
  flex-shrink: 0;
}
.sidebar.collapsed { width: 64px; }

.collapse-btn {
  position: absolute;
  top: 16px;
  right: -14px;
  width: 28px;
  height: 28px;
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: var(--shadow);
  padding: 0;
}

.sidebar-nav { display: flex; flex-direction: column; gap: 4px; padding: 0 10px; margin-top: 16px; }
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 8px;
  color: var(--gray-600);
  font-weight: 500;
  font-size: 0.9rem;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  overflow: hidden;
}
.sidebar-link:hover { background: var(--gray-100); color: var(--primary); }
.sidebar-link.router-link-active { background: #eff6ff; color: var(--primary-light); font-weight: 700; }
.icon { font-size: 1.2rem; flex-shrink: 0; }
.label { transition: opacity 0.2s; }

.collapsed .label { opacity: 0; width: 0; overflow: hidden; }
.collapsed .sidebar-link { justify-content: center; }

@media (max-width: 768px) {
  .sidebar { display: none; }
}

.nav-links a, .nav-links button {
  color: rgba(255,255,255,0.85);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
  background: none;
  cursor: pointer;
}



</style>
