<template>
  <div>
    <MenuNav />
    <div class="app-layout">
      <Sidebar />
      <main class="main-content">
        <div class="funcionarios-page">
          <div class="page-header">
            <div class="header-left">
              <span class="header-icon">👷</span>
              <div>
                <h1>Funcionários</h1>
                <p class="subtitle">Gestão de colaboradores e setores</p>
              </div>
            </div>
            <button class="btn-primary" @click="abrirModal()">+ Novo funcionário</button>
          </div>

          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-icon-box" style="background:#eff6ff">👥</div>
              <div><div class="stat-value">{{ funcionarios.length }}</div><div class="stat-label">Total</div></div>
            </div>
            <div class="stat-card">
              <div class="stat-icon-box" style="background:#f0fdf4">🏢</div>
              <div><div class="stat-value">{{ setoresUnicos.length }}</div><div class="stat-label">Setores</div></div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <span class="card-count">{{ funcionariosFiltrados.length }} registros</span>
              <div class="search-wrap">
                <span class="search-icon">🔍</span>
                <input v-model="busca" type="text" placeholder="Buscar por nome, cargo ou setor..." class="input-busca" />
              </div>
            </div>

            <div v-if="loading" class="estado-vazio"><div class="spinner"></div> Carregando...</div>
            <div v-else-if="funcionariosFiltrados.length === 0" class="estado-vazio">
              <span class="empty-icon">👤</span> Nenhum funcionário encontrado.
            </div>

            <div v-else class="tabela-wrapper">
              <table class="tabela">
                <thead>
                  <tr>
                    <th>Colaborador</th>
                    <th>Matrícula</th>
                    <th>Cargo</th>
                    <th>Setor</th>
                    <th>Contato</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="f in funcionariosFiltrados" :key="f.idfuncionario">
                    <td>
                      <div class="avatar-nome">
                        <div class="avatar">{{ iniciais(f.nome) }}</div>
                        <div class="nome-text">{{ f.nome }}</div>
                      </div>
                    </td>
                    <td><span class="mono">{{ f.matricula || '—' }}</span></td>
                    <td><span class="mono">{{ f.cargo || '—' }}</span></td>
                    <td><span class="badge-setor">{{ f.setor || '—' }}</span></td>
                    <td class="mono">{{ f.contato || '—' }}</td>
                    <td>
                      <div class="acoes">
                        <button class="btn-acao editar" @click="abrirModal(f)">Editar</button>
                        <button class="btn-acao excluir" @click="excluir(f.idfuncionario)">Excluir</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
            <div class="modal">
              <div class="modal-header">
                <h2>{{ editando ? 'Editar funcionário' : 'Novo funcionário' }}</h2>
                <button class="btn-fechar" @click="fecharModal">✕</button>
              </div>
              <div class="modal-body">
                <div class="campo">
                  <label>Nome completo *</label>
                  <input v-model="form.nome" type="text" placeholder="Ex: João da Silva" />
                </div>
                <div class="campo">
                  <label>Matrícula</label>
                  <input v-model="form.matricula" type="text" placeholder="Ex: 00101" />
                </div>
                <div class="campo">
                  <label>Cargo</label>
                  <input v-model="form.cargo" type="text" placeholder="Ex: Operador, Analista..." />
                </div>
                <div class="campo">
                  <label>Setor</label>
                  <input v-model="form.setor" type="text" placeholder="Ex: Produção, Logística..." />
                </div>
                <div class="campo">
                  <label>Contato</label>
                  <input v-model="form.contato" type="text" placeholder="Ex: (11) 99999-0000" />
                </div>
                <p v-if="erro" class="msg-erro">{{ erro }}</p>
              </div>
              <div class="modal-footer">
                <button class="btn-cancelar" @click="fecharModal">Cancelar</button>
                <button class="btn-primary" :disabled="salvando" @click="salvar">
                  {{ salvando ? 'Salvando...' : (editando ? 'Salvar alterações' : 'Cadastrar') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MenuNav from '@/components/menu.vue'
import Sidebar from '@/components/sidebar.vue'
import { useFuncionarios } from '@/composables/useSupabase.js'

const { funcionarios, loading, listarFuncionarios, criarFuncionario, atualizarFuncionario, deletarFuncionario } = useFuncionarios()

const busca       = ref('')
const modalAberto = ref(false)
const editando    = ref(null)
const salvando    = ref(false)
const erro        = ref('')

const form = ref({ nome: '', matricula: '', cargo: '', setor: '', contato: '' })

const funcionariosFiltrados = computed(() => {
  const q = busca.value.toLowerCase()
  if (!q) return funcionarios.value
  return funcionarios.value.filter(f =>
    f.nome?.toLowerCase().includes(q) ||
    f.cargo?.toLowerCase().includes(q) ||
    f.setor?.toLowerCase().includes(q) ||
    f.matricula?.toLowerCase().includes(q)
  )
})

const setoresUnicos = computed(() =>
  [...new Set(funcionarios.value.map(f => f.setor).filter(Boolean))]
)

function iniciais(nome) {
  if (!nome) return '?'
  return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

function abrirModal(f = null) {
  editando.value = f
  erro.value     = ''
  form.value = f
    ? { nome: f.nome, matricula: f.matricula || '', cargo: f.cargo || '', setor: f.setor || '', contato: f.contato || '' }
    : { nome: '', matricula: '', cargo: '', setor: '', contato: '' }
  modalAberto.value = true
}

function fecharModal() { modalAberto.value = false; editando.value = null }

async function salvar() {
  erro.value = ''
  if (!form.value.nome.trim()) { erro.value = 'O nome é obrigatório.'; return }
  salvando.value = true
  try {
    if (editando.value) await atualizarFuncionario(editando.value.idfuncionario, form.value)
    else await criarFuncionario(form.value)
    fecharModal()
    await listarFuncionarios()
  } catch (e) {
    erro.value = e.message?.includes('funcionarios_matricula_key')
      ? 'Matrícula já cadastrada.'
      : (e.message || 'Erro ao salvar.')
  } finally { salvando.value = false }
}

async function excluir(id) {
  if (!confirm('Deseja excluir este funcionário?')) return
  try { await deletarFuncionario(id); await listarFuncionarios() }
  catch { alert('Não foi possível excluir. Pode ter locações vinculadas.') }
}

onMounted(() => listarFuncionarios())
</script>

<style scoped>
.app-layout { display: flex; flex-direction: row; }
.funcionarios-page { padding: 28px 32px; max-width: 1050px; font-family: 'Segoe UI', sans-serif; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.header-left { display: flex; align-items: center; gap: 14px; }
.header-icon { font-size: 26px; }
h1 { font-size: 22px; font-weight: 700; color: #1e293b; margin: 0; }
.subtitle { font-size: 13px; color: #94a3b8; margin: 2px 0 0; }
.stats-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 20px; }
.stat-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.stat-icon-box { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.stat-value { font-size: 22px; font-weight: 700; color: #1e293b; }
.stat-label { font-size: 12px; color: #94a3b8; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.card-header { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.card-count { font-size: 12px; font-weight: 600; color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; padding: 3px 10px; border-radius: 20px; }
.search-wrap { position: relative; flex: 1; max-width: 360px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 14px; pointer-events: none; }
.input-busca { width: 100%; padding: 8px 12px 8px 32px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #1e293b; outline: none; box-sizing: border-box; }
.input-busca:focus { border-color: #1e3a5f; background: #fff; }
.estado-vazio { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px 20px; color: #94a3b8; font-size: 14px; }
.empty-icon { font-size: 32px; opacity: 0.4; }
.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #1e3a5f; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg) } }
.tabela-wrapper { overflow-x: auto; }
.tabela { width: 100%; border-collapse: collapse; font-size: 13px; }
.tabela thead { background: #f8fafc; }
.tabela th { text-align: left; padding: 11px 18px; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #e2e8f0; }
.tabela td { padding: 13px 18px; color: #374151; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.tabela tr:last-child td { border-bottom: none; }
.tabela tbody tr:hover { background: #f8fafc; }
.avatar-nome { display: flex; align-items: center; gap: 10px; }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #1e3a5f, #2d6bc4); color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nome-text { font-size: 13px; font-weight: 600; color: #1e293b; }
.mono { font-family: 'Courier New', monospace; font-size: 12px; color: #64748b; }
.badge-setor { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.acoes { display: flex; gap: 6px; }
.btn-acao { padding: 5px 12px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid transparent; transition: all 0.15s; font-family: inherit; }
.btn-acao.editar { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.btn-acao.editar:hover { background: #dbeafe; }
.btn-acao.excluir { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.btn-acao.excluir:hover { background: #fee2e2; }
.btn-primary { background: #1e3a5f; color: #fff; border: none; padding: 9px 18px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit; white-space: nowrap; }
.btn-primary:hover { background: #163050; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.3); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.12); border: 1px solid #e2e8f0; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid #f1f5f9; }
.modal-header h2 { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0; }
.btn-fechar { width: 28px; height: 28px; border-radius: 7px; border: 1px solid #e2e8f0; background: #f8fafc; cursor: pointer; color: #94a3b8; display: flex; align-items: center; justify-content: center; font-size: 13px; }
.btn-fechar:hover { background: #f1f5f9; color: #1e293b; }
.modal-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; }
.campo { display: flex; flex-direction: column; gap: 5px; }
.campo label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
.campo input, .campo select { padding: 10px 12px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #1e293b; outline: none; font-family: inherit; }
.campo input:focus, .campo select:focus { border-color: #1e3a5f; background: #fff; }
.campo input::placeholder { color: #94a3b8; }
.msg-erro { font-size: 12px; color: #dc2626; margin: 0; background: #fef2f2; border: 1px solid #fecaca; padding: 8px 12px; border-radius: 7px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 22px; border-top: 1px solid #f1f5f9; }
.btn-cancelar { background: #fff; border: 1.5px solid #e2e8f0; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; font-family: inherit; }
.btn-cancelar:hover { border-color: #cbd5e1; }
@media (max-width: 768px) { .funcionarios-page { padding: 16px; } .stats-row { grid-template-columns: 1fr 1fr; } }
</style>