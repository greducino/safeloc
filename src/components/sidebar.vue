<template>
  <aside v-if="user" class="sidebar" :class="{ collapsed }">
    <button class="collapse-btn" @click="collapsed = !collapsed" :title="collapsed ? 'Expandir' : 'Recolher'">
      {{ collapsed ? '▶' : '◀' }}
    </button>

    <nav class="sidebar-nav">
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

      <template v-if="isFuncionario">
        <RouterLink to="/entrega" class="sidebar-link" title="Entregas">
          <span class="icon">📦</span>
          <span class="label">Entregas</span>
        </RouterLink>
        <RouterLink to="/alunos" class="sidebar-link" title="Alunos">
          <span class="icon">🎓</span>
          <span class="label">Alunos</span>
        </RouterLink>
        <RouterLink to="/turmas" class="sidebar-link" title="Turmas">
          <span class="icon">🏫</span>
          <span class="label">Turmas</span>
        </RouterLink>
      </template>

      <RouterLink v-if="isAdmin" to="/funcionarios" class="sidebar-link" title="Funcionários">
        <span class="icon">👷</span>
        <span class="label">Funcionários</span>
      </RouterLink>

      <RouterLink to="/perfil" class="sidebar-link" title="Perfil">
        <span class="icon">👤</span>
        <span class="label">Perfil</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useSupabase.js'

const collapsed = ref(false)
const { user, isAdmin, isFuncionario, getCurrentUser } = useAuth()

onMounted(async () => {
  await getCurrentUser()
})
</script>

<style scoped>
.sidebar {
  width: 220px;
  min-height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
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
  top: 16px; right: -14px;
  width: 28px; height: 28px;
  background: #1e3a5f; color: #fff;
  border: none; border-radius: 50%;
  font-size: 0.7rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  z-index: 10; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.sidebar-nav {
  display: flex; flex-direction: column;
  gap: 4px; padding: 0 10px; margin-top: 16px;
}

.sidebar-link {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 14px; border-radius: 8px;
  color: #64748b; font-weight: 500; font-size: 0.9rem;
  text-decoration: none; white-space: nowrap; overflow: hidden;
  transition: background 0.15s, color 0.15s;
}
.sidebar-link:hover { background: #f1f5f9; color: #1e3a5f; }
.sidebar-link.router-link-active {
  background: #eff6ff; color: #1e3a5f;
  font-weight: 700; border-left: 3px solid #1e3a5f;
}

.icon  { font-size: 1.15rem; flex-shrink: 0; }
.label { transition: opacity 0.2s; }

.collapsed .label { opacity: 0; width: 0; overflow: hidden; }
.collapsed .sidebar-link { justify-content: center; }
.collapsed .sidebar-link.router-link-active { border-left: none; border-bottom: 3px solid #1e3a5f; }

@media (max-width: 768px) { .sidebar { display: none; } }
</style>