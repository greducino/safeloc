<template>
  <div>
    <MenuNav />
    <div class="app-layout">
            <main class="main-content">

        <!-- Cabeçalho -->
        <div class="page-header">
          <h1 class="page-title">Dashboard</h1>
          <span class="welcome-pill">Olá, {{ userName }}!</span>
        </div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-num">{{ stats.totalEpis }}</span>
            <span class="stat-lbl">Total de EPIs</span>
            <span class="stat-ico" style="background:#dbeafe">🦺</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ stats.episDisponiveis }}</span>
            <span class="stat-lbl">EPIs Disponíveis</span>
            <span class="stat-ico" style="background:#dcfce7">✅</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ stats.episIndisponiveis }}</span>
            <span class="stat-lbl">Indisponíveis</span>
            <span class="stat-ico" style="background:#fee2e2">🔴</span>
          </div>
          <div class="stat-card">
            <span class="stat-num stat-warn">{{ stats.pendentes }}</span>
            <span class="stat-lbl">Pendentes</span>
            <span class="stat-ico" style="background:#fef9c3">📋</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ stats.totalFuncionarios }}</span>
            <span class="stat-lbl">Funcionários</span>
            <span class="stat-ico" style="background:#ede9fe">👷</span>
          </div>
        </div>

        <!-- Tabela principal -->
        <div class="main-card">
          <div class="main-card-header">
            <h2 class="main-card-title">Últimas Solicitações</h2>
            <RouterLink to="/locacao" class="btn-ver">Ver todas</RouterLink>
          </div>

          <div v-if="loadingLocacoes" class="state-msg">Carregando...</div>
          <div v-else-if="ultimasLocacoes.length === 0" class="state-msg">
            Nenhuma solicitação registrada ainda.
          </div>
          <div v-else class="tbl-wrap">
            <table class="tbl">
              <thead>
                <tr>
                  <th>EPI</th>
                  <th>Aluno</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="loc in ultimasLocacoes" :key="loc.id">
                  <td class="td-bold">{{ loc.epi?.nome || '—' }}</td>
                  <td>{{ loc.aluno ? `${loc.aluno.nome} ${loc.aluno.sobrenome}` : '—' }}</td>
                  <td class="td-muted">{{ formatDate(loc.data_solicitacao) }}</td>
                  <td>
                    <span class="badge" :class="badgeStatus(loc.status)">
                      {{ loc.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Atalhos rápidos -->
        <div class="quick-grid">
          <RouterLink to="/epis" class="quick-card">
            <span class="quick-ico">🦺</span>
            <strong>Gerenciar EPIs</strong>
            <small>Cadastrar, editar e listar equipamentos</small>
          </RouterLink>
          <RouterLink to="/locacao" class="quick-card">
            <span class="quick-ico">📋</span>
            <strong>Nova Solicitação</strong>
            <small>Registrar pedido de EPI</small>
          </RouterLink>
          <RouterLink to="/funcionarios" class="quick-card">
            <span class="quick-ico">👷</span>
            <strong>Funcionários</strong>
            <small>Gerenciar cadastro de funcionários</small>
          </RouterLink>
          <RouterLink to="/alunos" class="quick-card">
            <span class="quick-ico">🎓</span>
            <strong>Alunos</strong>
            <small>Gerenciar cadastro de alunos</small>
          </RouterLink>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import MenuNav from '@/components/menu.vue'
import Sidebar from '@/components/sidebar.vue'
import { supabase, useDashboard, useLocacoes } from '@/composables/useSupabase.js'

const userName = ref('Usuário')
const { stats, carregarDashboard } = useDashboard()
const { locacoes, listarLocacoes } = useLocacoes()
const ultimasLocacoes = ref([])
const loadingLocacoes = ref(true)

onMounted(async () => {
  const { data: authData } = await supabase.auth.getUser()
  userName.value = authData.user?.user_metadata?.nome_completo
    || authData.user?.email
    || 'Usuário'

  await carregarDashboard()
  await listarLocacoes()
  ultimasLocacoes.value = locacoes.value.slice(0, 8)
  loadingLocacoes.value = false
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function badgeStatus(status) {
  const map = {
    pendente:  'badge-warning',
    aprovado:  'badge-info',
    entregue:  'badge-success',
    devolvido: 'badge-success',
    rejeitado: 'badge-danger',
  }
  return map[status] || 'badge-warning'
}
</script>

<style scoped>
  .app-layout {
    display: flex;
    flex-direction: row;
  }
/* ── Layout base ─────────────────────────────────────────────────────────── */
.main-content {
  flex: 1;
  padding: 28px 32px;
  overflow-y: auto;
  background: #f8fafc;
  min-height: 100vh;
}

/* ── Cabeçalho ───────────────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}
.page-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.01em;
}
.welcome-pill {
  font-size: 0.82rem;
  color: #64748b;
  background: #fff;
  border: 1px solid #e2e8f0;
  padding: 5px 14px;
  border-radius: 20px;
}

/* ── Stats ───────────────────────────────────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 22px;
}
.stat-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 16px 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: transform 0.15s, box-shadow 0.15s;
  overflow: hidden;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30,58,95,0.09);
}
.stat-num {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}
.stat-num.stat-warn { color: #b45309; }
.stat-lbl {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 2px;
}
.stat-ico {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

/* ── Tabela principal ────────────────────────────────────────────────────── */
.main-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  margin-bottom: 22px;
  overflow: hidden;
}
.main-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  border-bottom: 1px solid #f1f5f9;
}
.main-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}
.btn-ver {
  background: #1e3a5f;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s;
}
.btn-ver:hover { background: #163050; }

.tbl-wrap { overflow-x: auto; }
.tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.tbl thead tr {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
.tbl th {
  text-align: left;
  padding: 11px 20px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.tbl td {
  padding: 13px 20px;
  color: #374151;
  border-bottom: 1px solid #f1f5f9;
}
.tbl tbody tr:last-child td { border-bottom: none; }
.tbl tbody tr:hover { background: #f8fafc; }
.td-bold { font-weight: 600; color: #1e293b; }
.td-muted { color: #94a3b8; }

/* ── Badges ──────────────────────────────────────────────────────────────── */
.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  display: inline-block;
  text-transform: capitalize;
}
.badge-warning { background: #fef9c3; color: #854d0e; }
.badge-success { background: #dcfce7; color: #166534; }
.badge-info    { background: #dbeafe; color: #1e40af; }
.badge-danger  { background: #fee2e2; color: #991b1b; }

/* ── Estado vazio / loading ──────────────────────────────────────────────── */
.state-msg {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
  font-size: 13px;
}

/* ── Quick actions ───────────────────────────────────────────────────────── */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.quick-card {
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 22px 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-decoration: none;
  transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.quick-card:hover {
  box-shadow: 0 6px 18px rgba(30,58,95,0.1);
  transform: translateY(-3px);
  border-color: #1e3a5f;
}
.quick-ico  { font-size: 1.6rem; margin-bottom: 2px; }
.quick-card strong { color: #1e3a5f; font-size: 0.88rem; display: block; }
.quick-card small  { color: #94a3b8; font-size: 0.73rem; line-height: 1.4; }

/* ── Responsivo ──────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .stats-row  { grid-template-columns: repeat(3, 1fr); }
  .quick-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .main-content { padding: 16px; }
  .stats-row  { grid-template-columns: repeat(2, 1fr); }
  .quick-grid { grid-template-columns: 1fr 1fr; }
}
</style>