<template>
  <div>
     <MenuNav />
    <div class="app-layout">
      <Sidebar />
      <main class="main-content">
        <div class="page-header"> </div>
        <div class="perfil-container"> </div>

          <!-- Header -->
          <div class="perfil-header">
      <div class="header-left">
        <span class="header-icon"><img src="" alt=""></span>
        <div>
          <h1>Meu Perfil</h1>
          <p class="subtitle">Gerencie suas informações pessoais e segurança</p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="carregando" class="loading">
      <div class="spinner"></div>
      <p>Carregando...</p>
    </div>

    <div v-else class="perfil-content">

      <!-- HERO CARD -->
      <div class="hero-card">
        <div class="hero-bg-strip"></div>
        <div class="hero-body">
          <div class="avatar-wrap">
            <div class="avatar">{{ iniciais(perfil.nome) }}</div>
          </div>
          <div class="hero-info">
            <h2>{{ perfil.nome }}</h2>
            <p class="hero-email">{{ perfil.email }}</p>
            <div class="hero-chips">
              <span class="chip chip-blue">
                {{ perfil.role === 'admin' ? '👑 Administrador' : '👷 Funcionário' }}
              </span>
              <span class="chip chip-green">✓ Conta ativa</span>
              <span class="chip chip-gray">Desde {{ dataFormatada }}</span>
            </div>
          </div>
          <button @click="modoEdicao = !modoEdicao"
            :class="['btn', modoEdicao ? 'btn-outline' : 'btn-primary']">
            {{ modoEdicao ? '✕ Cancelar' : '✏ Editar perfil' }}
          </button>
        </div>
      </div>

      <div class="two-col">

        <!-- Card Informações -->
        <div class="card">
          <div class="card-header">
            <div class="card-title-wrap">
              <span class="card-icon-box" style="background:#fff7ed">📋</span>
              <h3>Informações Pessoais</h3>
            </div>
          </div>

          <div v-if="!modoEdicao" class="info-grid">
            <div class="info-item">
              <label>Nome completo</label>
              <p>{{ perfil.nome }}</p>
            </div>
            <div class="info-item">
              <label>E-mail</label>
              <p>{{ perfil.email }}</p>
            </div>
            <div class="info-item">
              <label>Telefone</label>
              <p>{{ perfil.telefone || 'Não informado' }}</p>
            </div>
            <div class="info-item">
              <label>Função</label>
              <span class="chip chip-blue" style="width:fit-content">{{ roleLabel }}</span>
            </div>
          </div>

          <div v-else class="form-edit">
            <div class="form-group">
              <label>Nome completo</label>
              <input v-model="perfil.nome" type="text" placeholder="Seu nome completo" />
            </div>
            <div class="form-group">
              <label>Telefone</label>
              <input v-model="perfil.telefone" type="tel" placeholder="(xx) xxxxx-xxxx" />
            </div>
            <div v-if="mensagem" :class="['message', mensagem.tipo]">{{ mensagem.texto }}</div>
            <div class="form-actions">
              <button @click="salvarPerfil" class="btn btn-primary" :disabled="salvando">
                {{ salvando ? 'Salvando...' : '💾 Salvar alterações' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Side cards -->
        <div class="side-cards">
          <div class="card">
            <div class="card-header">
              <div class="card-title-wrap">
                <span class="card-icon-box" style="background:#f0fdf4">🔐</span>
                <h3>Segurança</h3>
              </div>
            </div>
            <div class="action-row">
              <div class="action-info">
                <strong>Alterar senha</strong>
                <p>Mantenha sua conta protegida</p>
              </div>
              <button @click="abrirModalSenha" class="btn btn-outline">🔑 Alterar</button>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title-wrap">
                <span class="card-icon-box" style="background:#fef2f2">🚪</span>
                <h3>Sessão</h3>
              </div>
            </div>
            <div class="action-row">
              <div class="action-info">
                <strong>Sair da conta</strong>
                <p>Encerrar sessão atual</p>
              </div>
              <button @click="logout" class="btn btn-danger">Sair</button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Modal Senha -->
    <div v-if="mostrarModalSenha" class="modal-overlay" @click.self="fecharModalSenha">
      <div class="modal">
        <div class="modal-header">
          <h2>🔑 Alterar Senha</h2>
          <button @click="fecharModalSenha" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nova senha</label>
            <input v-model="senhaForm.nova" type="password" placeholder="Mínimo 6 caracteres" />
          </div>
          <div class="form-group">
            <label>Confirmar nova senha</label>
            <input v-model="senhaForm.confirmacao" type="password" placeholder="Repita a nova senha" />
          </div>
          <div v-if="mensagemSenha" :class="['message', mensagemSenha.tipo]">{{ mensagemSenha.texto }}</div>
        </div>
        <div class="modal-footer">
          <button @click="fecharModalSenha" class="btn btn-outline">Cancelar</button>
          <button @click="atualizarSenha" class="btn btn-primary" :disabled="salvandoSenha">
            {{ salvandoSenha ? 'Atualizando...' : 'Atualizar senha' }}
          </button>
        </div>
      </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/composables/useSupabase.js'
import MenuNav from '@/components/menu.vue'
import Sidebar from '@/components/sidebar.vue'
import menu from '../components/menu.vue'






const router        = useRouter()
const carregando    = ref(true)
const salvando      = ref(false)
const salvandoSenha = ref(false)
const modoEdicao    = ref(false)
const mostrarModalSenha = ref(false)

const perfil    = ref({ nome: '', email: '', telefone: '', role: '', created_at: '' })
const senhaForm = ref({ nova: '', confirmacao: '' })
const mensagem      = ref(null)
const mensagemSenha = ref(null)

const roleLabel = computed(() =>
  ({ admin: 'Administrador', funcionario: 'Funcionário' })[perfil.value.role] || perfil.value.role
)

const dataFormatada = computed(() => {
  if (!perfil.value.created_at) return 'N/A'
  return new Date(perfil.value.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
})

function iniciais(nome = '') {
  return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

onMounted(async () => {
  try {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) { router.push('/login'); return }
    perfil.value.email = auth.user.email
    const { data } = await supabase.from('usuarios').select('*').eq('id', auth.user.id).single()
    if (data) Object.assign(perfil.value, { ...data, nome: data.nome_completo, created_at: data.criado_em })
  } catch (e) { console.error(e) }
  finally { carregando.value = false }
})

async function salvarPerfil() {
  if (!perfil.value.nome.trim()) { mensagem.value = { tipo: 'erro', texto: 'Nome é obrigatório' }; return }
  salvando.value = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    const { error } = await supabase.from('usuarios')
      .update({ nome_completo: perfil.value.nome, telefone: perfil.value.telefone })
      .eq('id', auth.user.id)
    if (error) throw error
    mensagem.value = { tipo: 'sucesso', texto: '✓ Perfil atualizado com sucesso!' }
    modoEdicao.value = false
    setTimeout(() => { mensagem.value = null }, 3000)
  } catch { mensagem.value = { tipo: 'erro', texto: 'Erro ao salvar perfil' } }
  finally { salvando.value = false }
}

function abrirModalSenha() {
  mostrarModalSenha.value = true
  senhaForm.value = { nova: '', confirmacao: '' }
  mensagemSenha.value = null
}
function fecharModalSenha() { mostrarModalSenha.value = false; mensagemSenha.value = null }

async function atualizarSenha() {
  const { nova, confirmacao } = senhaForm.value
  if (!nova || !confirmacao) { mensagemSenha.value = { tipo: 'erro', texto: 'Preencha todos os campos' }; return }
  if (nova !== confirmacao)  { mensagemSenha.value = { tipo: 'erro', texto: 'As senhas não conferem' }; return }
  if (nova.length < 6)       { mensagemSenha.value = { tipo: 'erro', texto: 'Mínimo 6 caracteres' }; return }
  salvandoSenha.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: nova })
    if (error) throw error
    mensagemSenha.value = { tipo: 'sucesso', texto: '✓ Senha atualizada!' }
    setTimeout(fecharModalSenha, 1800)
  } catch { mensagemSenha.value = { tipo: 'erro', texto: 'Erro ao atualizar senha' } }
  finally { salvandoSenha.value = false }
}

async function logout() {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<style scoped>
/* ── BASE ───────────────────────────────────────────── */
.app-layout { display: flex; 
  flex-direction: row; 
}
.perfil-container {
  padding: 24px 24px;
  max-width: 1000px;
  font-family: 'Segoe UI', sans-serif;
  animation: fadeUp 0.25s ease;
}
@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }

/* ── HEADER ─────────────────────────────────────────── */
.perfil-header { margin-bottom: 24px; }
.header-left { display: flex; align-items: center; gap: 14px; }
.header-icon { font-size: 26px; }
.perfil-header h1 { font-size: 22px; font-weight: 700; color: #1e293b; margin: 0; }
.subtitle { font-size: 13px; color: #94a3b8; margin: 2px 0 0; }

/* ── LOADING ────────────────────────────────────────── */
.loading { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #94a3b8; }
.spinner {
  width: 34px; height: 34px; border: 3px solid #e2e8f0;
  border-top-color: #1e3a5f; border-radius: 50%;
  animation: spin 0.8s linear infinite; margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg) } }

/* ── HERO CARD ──────────────────────────────────────── */
.hero-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
  margin-bottom: 18px;
}
.hero-bg-strip {
  height: 7px;
  background: linear-gradient(90deg, #1e3a5f 0%, #2d6bc4 60%, #1e3a5f 100%);
}
.hero-body {
  display: flex; align-items: center; gap: 20px;
  padding: 22px 26px;
}
.avatar {
  width: 68px; height: 68px; border-radius: 50%;
  background: linear-gradient(135deg, #1e3a5f, #2d6bc4);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 700; color: #fff; flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(30,58,95,0.2);
}
.hero-info { flex: 1; min-width: 0; }
.hero-info h2 { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 3px; }
.hero-email { font-size: 13px; color: #94a3b8; margin: 0 0 10px; }
.hero-chips { display: flex; flex-wrap: wrap; gap: 6px; }

/* ── CHIPS ──────────────────────────────────────────── */
.chip { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.chip-blue  { background: #eff6ff; color: #1d4ed8; }
.chip-green { background: #f0fdf4; color: #16a34a; }
.chip-gray  { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }

/* ── LAYOUT ─────────────────────────────────────────── */
.two-col { display: grid; grid-template-columns: 1fr 300px; gap: 16px; align-items: start; }
.side-cards { display: flex; flex-direction: column; gap: 14px; }

/* ── CARD ───────────────────────────────────────────── */
.card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
}
.card-header { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; }
.card-title-wrap { display: flex; align-items: center; gap: 10px; }
.card-icon-box {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;
}
.card-title-wrap h3 { font-size: 14px; font-weight: 700; color: #1e293b; margin: 0; }

/* ── INFO GRID ──────────────────────────────────────── */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; }
.info-item { padding: 14px 20px; border-bottom: 1px solid #f8fafc; }
.info-item:nth-last-child(-n+2) { border-bottom: none; }
.info-item label {
  display: block; font-size: 11px; font-weight: 600;
  color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 5px;
}
.info-item p { font-size: 14px; color: #1e293b; font-weight: 500; margin: 0; }

/* ── FORM ───────────────────────────────────────────── */
.form-edit { padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
.form-group input {
  padding: 10px 12px;
  background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 14px; color: #1e293b; outline: none; font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.form-group input:focus { border-color: #1e3a5f; background: #fff; box-shadow: 0 0 0 3px rgba(30,58,95,0.07); }
.form-actions { display: flex; justify-content: flex-end; }

/* ── ACTION ROW ─────────────────────────────────────── */
.action-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 14px; padding: 16px 20px;
}
.action-info strong { display: block; font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 2px; }
.action-info p { font-size: 12px; color: #94a3b8; margin: 0; }

/* ── BUTTONS ────────────────────────────────────────── */
.btn {
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; border: none; font-family: inherit;
  transition: all 0.15s; white-space: nowrap;
}
.btn-primary { background: #1e3a5f; color: #fff; }
.btn-primary:hover { background: #163050; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(30,58,95,0.22); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-outline { background: #fff; color: #1e3a5f; border: 1.5px solid #cbd5e1; }
.btn-outline:hover { border-color: #1e3a5f; background: #f8fafc; }
.btn-danger { background: #fef2f2; color: #dc2626; border: 1.5px solid #fecaca; }
.btn-danger:hover { background: #fee2e2; }

/* ── MESSAGES ───────────────────────────────────────── */
.message { padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; }
.message.sucesso { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.message.erro    { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

/* ── MODAL ──────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,0.3);
  backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.modal {
  background: #fff; border-radius: 14px; width: 420px; max-width: 95vw;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12); border: 1px solid #e2e8f0;
  animation: modalIn 0.2s ease;
}
@keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px) } to { opacity:1; transform:scale(1) } }
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px; border-bottom: 1px solid #f1f5f9;
}
.modal-header h2 { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0; }
.close-btn {
  width: 28px; height: 28px; border-radius: 7px; border: 1px solid #e2e8f0;
  background: #f8fafc; cursor: pointer; color: #94a3b8;
  display: flex; align-items: center; justify-content: center; transition: all 0.12s;
}
.close-btn:hover { background: #f1f5f9; color: #1e293b; }
.modal-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; }
.modal-footer { padding: 14px 22px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 10px; }

/* ── RESPONSIVE ─────────────────────────────────────── */
@media (max-width: 768px) {
  .perfil-container { padding: 16px; }
  .two-col { grid-template-columns: 1fr; }
  .hero-body { flex-direction: column; align-items: flex-start; }
  .info-grid { grid-template-columns: 1fr; }
  .info-item:nth-last-child(-n+2) { border-bottom: 1px solid #f8fafc; }
  .info-item:last-child { border-bottom: none; }
}
</style>