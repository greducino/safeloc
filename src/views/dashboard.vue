<template>
  <div>
    <MenuNav />
    <div class="app-layout">
      <Sidebar />
      <main class="main-content">
        <div class="page-header">
          <h1>📊 Dashboard</h1>
          <span class="welcome">Olá, {{ userName }}!</span>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background:#dbeafe">🦺</div>
            <div class="stat-info">
              <h3>{{ stats.totalEpis }}</h3>
              <p>Total de EPIs</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#dcfce7">✅</div>
            <div class="stat-info">
              <h3>{{ stats.episDisponiveis }}</h3>
              <p>EPIs Disponíveis</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#fee2e2">🔴</div>
            <div class="stat-info">
              <h3>{{ stats.episIndisponiveis }}</h3>
              <p>Indisponíveis</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#fef9c3">📋</div>
            <div class="stat-info">
              <h3>{{ stats.pendentes }}</h3>
              <p>Pendentes</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#ede9fe">👷</div>
            <div class="stat-info">
              <h3>{{ stats.totalFuncionarios }}</h3>
              <p>Funcionários</p>
            </div>
          </div>
        </div>

        <!-- Últimas Solicitações -->
        <div class="card">
          <div class="section-header">
            <h2>📋 Últimas Solicitações</h2>
            <RouterLink to="/locacao" class="btn btn-dark btn-sm">Ver todas</RouterLink>
          </div>
          <div v-if="loadingLocacoes" class="loading">Carregando...</div>
          <div v-else-if="ultimasLocacoes.length === 0" class="empty-state">Nenhuma solicitação registrada ainda.</div>
          <div v-else class="table-wrap">
            <table>
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
                  <!-- Relacionamento: epi.nome (tabela 'epi') -->
                  <td>{{ loc.epi?.nome || '—' }}</td>
                  <!-- Relacionamento: aluno.nome (tabela 'aluno') -->
                  <td>{{ loc.aluno ? `${loc.aluno.nome} ${loc.aluno.sobrenome}` : '—' }}</td>
                  <td>{{ formatDate(loc.data_solicitacao) }}</td>
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
        <div class="quick-actions">
          <RouterLink to="/epis" class="quick-card">
            <span>🦺</span>
            <strong>Gerenciar EPIs</strong>
            <small>Cadastrar, editar e listar equipamentos</small>
          </RouterLink>
          <RouterLink to="/locacao" class="quick-card">
            <span>📋</span>
            <strong>Nova Solicitação</strong>
            <small>Registrar pedido de EPI</small>
          </RouterLink>
          <RouterLink to="/funcionarios" class="quick-card">
            <span>👷</span>
            <strong>Funcionários</strong>
            <small>Gerenciar cadastro de funcionários</small>
          </RouterLink>
          <RouterLink to="/alunos" class="quick-card">
            <span>🎓</span>
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
// Importações corretas: tabelas 'epi', 'funcionario', 'solicitacoes' (singular)
import { supabase, useDashboard, useLocacoes } from '@/composables/useSupabase.js'

const userName = ref('Usuário')
const { stats, carregarDashboard } = useDashboard()
const { locacoes, listarLocacoes } = useLocacoes()
const ultimasLocacoes = ref([])
const loadingLocacoes = ref(true)

onMounted(async () => {
  // Nome do usuário logado
  const { data: authData } = await supabase.auth.getUser()
  userName.value = authData.user?.user_metadata?.nome_completo
    || authData.user?.email
    || 'Usuário'

  // Carrega stats do dashboard (usa tabelas 'epi', 'aluno', 'funcionario', 'solicitacoes')
  await carregarDashboard()

  // Carrega últimas solicitações com join em 'epi' e 'aluno'
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
/* ── Cabeçalho da página ───────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.page-header h1 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
}
.welcome {
  font-size: 0.9rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 5px 14px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

/* ── Grid de estatísticas ───────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}
.stat-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  transition: transform 0.15s, box-shadow 0.15s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30,58,95,0.1);
}
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}
.stat-info h3 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  line-height: 1;
}
.stat-info p {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 4px 0 0;
}

/* ── Card genérico ──────────────────────────────────────────────────────── */
.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px 22px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  margin-bottom: 24px;
}

/* ── Tabela de locações ─────────────────────────────────────────────────── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-header h2 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}
.table-wrap { overflow-x: auto; }
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
thead tr {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
th {
  text-align: left;
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
td {
  padding: 12px 14px;
  color: #374151;
  border-bottom: 1px solid #f1f5f9;
}
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: #f8fafc; }

/* ── Badges de status ───────────────────────────────────────────────────── */
.badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  display: inline-block;
}
.badge-warning { background: #fef9c3; color: #854d0e; }
.badge-success { background: #dcfce7; color: #166534; }
.badge-info    { background: #dbeafe; color: #1e40af; }
.badge-danger  { background: #fee2e2; color: #991b1b; }

/* Botão Ver todas */
.btn { padding: 6px 14px; border-radius: 8px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.15s; font-family: inherit; }
.btn-dark { background: #1e3a5f; color: #fff; }
.btn-dark:hover { background: #163050; }
.btn-sm { padding: 5px 12px; font-size: 12px; }

.empty-state { text-align: center; padding: 36px; color: #94a3b8; font-size: 13px; }
.loading     { text-align: center; padding: 24px;  color: #94a3b8; font-size: 13px; }

/* ── Atalhos rápidos ────────────────────────────────────────────────────── */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-top: 0;
}
.quick-card {
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 22px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-decoration: none;
  transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.quick-card:hover {
  box-shadow: 0 6px 18px rgba(30,58,95,0.12);
  transform: translateY(-3px);
  border-color: #1e3a5f;
}
.quick-card span   { font-size: 1.7rem; }
.quick-card strong { color: #1e3a5f; font-size: 0.9rem; display: block; }
.quick-card small  { color: #94a3b8; font-size: 0.75rem; line-height: 1.4; }
</style>