<template>
  <div>
    <MenuNav />
    <div class="app-layout">
      <Sidebar />
      <main class="main-content">

        <div v-if="carregando" class="loading-full">
          <div class="spinner"></div>
          <p>Carregando perfil…</p>
        </div>

        <div v-else class="perfil-wrap">

          <!-- HERO -->
          <div class="hero-card">
            <div class="hero-strip"></div>
            <div class="hero-body">
              <div class="avatar">{{ iniciais(perfil.nome) }}</div>
              <div class="hero-info">
                <h2>{{ perfil.nome }} {{ perfil.sobrenome }}</h2>
                <p class="hero-email">{{ perfil.email }}</p>
                <div class="chips">
                  <span class="chip chip-blue">{{ roleLabel }}</span>
                  <span v-if="perfil.ra" class="chip chip-gray">RA: {{ perfil.ra }}</span>
                  <span v-if="perfil.funcao" class="chip chip-gray">{{ perfil.funcao }}</span>
                  <span class="chip chip-green">✓ Ativo</span>
                </div>
              </div>
              <button @click="modoEdicao = !modoEdicao"
                :class="['btn', modoEdicao ? 'btn-ghost' : 'btn-primary']">
                {{ modoEdicao ? '✕ Cancelar' : '✏ Editar' }}
              </button>
            </div>
          </div>

          <div class="two-col">

            <!-- Informações pessoais -->
            <div class="card">
              <div class="card-header">
                <span class="card-icon">📋</span>
                <h3>Informações Pessoais</h3>
              </div>

              <div v-if="!modoEdicao" class="info-grid">
                <div class="info-item">
                  <label>Nome</label>
                  <p>{{ perfil.nome }}</p>
                </div>
                <div class="info-item">
                  <label>Sobrenome</label>
                  <p>{{ perfil.sobrenome || '—' }}</p>
                </div>
                <div class="info-item">
                  <label>E-mail</label>
                  <p>{{ perfil.email }}</p>
                </div>
                <div class="info-item">
                  <label>{{ isAluno ? 'RA' : 'CPF' }}</label>
                  <p class="mono">{{ isAluno ? (perfil.ra || '—') : (perfil.cpf || '—') }}</p>
                </div>
                <div v-if="!isAluno" class="info-item">
                  <label>Função</label>
                  <p>{{ perfil.funcao || '—' }}</p>
                </div>
                <div class="info-item">
                  <label>Membro desde</label>
                  <p>{{ dataFormatada }}</p>
                </div>
              </div>

              <div v-else class="form-edit">
                <div class="form-group">
                  <label>Nome *</label>
                  <input v-model="editForm.nome" type="text" placeholder="Seu nome" />
                </div>
                <div class="form-group">
                  <label>Sobrenome</label>
                  <input v-model="editForm.sobrenome" type="text" placeholder="Seu sobrenome" />
                </div>
                <div v-if="mensagem" :class="['msg', mensagem.tipo]">{{ mensagem.texto }}</div>
                <div class="form-actions">
                  <button @click="salvarPerfil" class="btn btn-primary" :disabled="salvando">
                    {{ salvando ? 'Salvando…' : '💾 Salvar' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Side cards -->
            <div class="side-col">
              <div class="card">
                <div class="card-header">
                  <span class="card-icon">🔐</span>
                  <h3>Segurança</h3>
                </div>
                <div class="action-row">
                  <div>
                    <strong>Alterar senha</strong>
                    <p>Mantenha sua conta protegida</p>
                  </div>
                  <button @click="modalSenha = true" class="btn btn-ghost">Alterar</button>
                </div>
              </div>

              <div class="card">
                <div class="card-header">
                  <span class="card-icon">🚪</span>
                  <h3>Sessão</h3>
                </div>
                <div class="action-row">
                  <div>
                    <strong>Sair da conta</strong>
                    <p>Encerrar sessão atual</p>
                  </div>
                  <button @click="sair" class="btn btn-danger">Sair</button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Modal senha -->
        <div v-if="modalSenha" class="overlay" @click.self="modalSenha = false">
          <div class="modal">
            <div class="modal-header">
              <h3>🔑 Alterar Senha</h3>
              <button @click="modalSenha = false" class="modal-close">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Nova senha</label>
                <input v-model="senhaForm.nova" type="password" placeholder="Mínimo 6 caracteres" />
              </div>
              <div class="form-group">
                <label>Confirmar senha</label>
                <input v-model="senhaForm.confirmacao" type="password" placeholder="Repita a senha" />
              </div>
              <div v-if="msgSenha" :class="['msg', msgSenha.tipo]">{{ msgSenha.texto }}</div>
            </div>
            <div class="modal-footer">
              <button @click="modalSenha = false" class="btn btn-ghost">Cancelar</button>
              <button @click="atualizarSenha" class="btn btn-primary" :disabled="salvandoSenha">
                {{ salvandoSenha ? 'Salvando…' : 'Atualizar' }}
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
import { supabase, useAuth } from '@/composables/useSupabase.js'
import MenuNav from '@/components/menu.vue'
import Sidebar from '@/components/sidebar.vue'

const router = useRouter()
const { getCurrentUser, logout } = useAuth()

const carregando    = ref(true)
const salvando      = ref(false)
const salvandoSenha = ref(false)
const modoEdicao    = ref(false)
const modalSenha    = ref(false)
const mensagem      = ref(null)
const msgSenha      = ref(null)

const perfil  = ref({ nome: '', sobrenome: '', email: '', ra: '', cpf: '', funcao: '', role: '', created_at: '' })
const editForm = ref({ nome: '', sobrenome: '' })
const senhaForm = ref({ nova: '', confirmacao: '' })

const isAluno = computed(() => perfil.value.role === 'aluno')

const roleLabel = computed(() => ({
  admin:       '👑 Administrador',
  funcionario: '👷 Funcionário',
  aluno:       '🎓 Aluno',
})[perfil.value.role] || perfil.value.role)

const dataFormatada = computed(() => {
  if (!perfil.value.created_at) return '—'
  return new Date(perfil.value.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
})

function iniciais(nome = '') {
  return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
}

onMounted(async () => {
  try {
    const { user, profile, isAluno: al } = await getCurrentUser()
    if (!user) { router.push('/login'); return }

    if (profile) {
      Object.assign(perfil.value, profile)
    }
    // Garante e-mail do auth
    perfil.value.email = user.email

    editForm.value = { nome: perfil.value.nome, sobrenome: perfil.value.sobrenome || '' }
  } catch (e) {
    console.error(e)
  } finally {
    carregando.value = false
  }
})

async function salvarPerfil() {
  if (!editForm.value.nome.trim()) {
    mensagem.value = { tipo: 'erro', texto: 'Nome é obrigatório.' }
    return
  }
  salvando.value = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    const tabela = perfil.value.role === 'aluno' ? 'aluno' : 'funcionario'
    const pk     = perfil.value.role === 'aluno' ? 'idaluno' : 'idfuncionario'
    const id     = perfil.value.role === 'aluno' ? perfil.value.idaluno : perfil.value.idfuncionario

    const { error } = await supabase.from(tabela)
      .update({ nome: editForm.value.nome, sobrenome: editForm.value.sobrenome })
      .eq(pk, id)

    if (error) throw error

    perfil.value.nome      = editForm.value.nome
    perfil.value.sobrenome = editForm.value.sobrenome
    mensagem.value = { tipo: 'sucesso', texto: '✓ Perfil atualizado!' }
    modoEdicao.value = false
    setTimeout(() => { mensagem.value = null }, 3000)
  } catch (e) {
    mensagem.value = { tipo: 'erro', texto: 'Erro ao salvar: ' + e.message }
  } finally {
    salvando.value = false
  }
}

async function atualizarSenha() {
  const { nova, confirmacao } = senhaForm.value
  if (!nova || !confirmacao) { msgSenha.value = { tipo: 'erro', texto: 'Preencha os dois campos.' }; return }
  if (nova !== confirmacao)  { msgSenha.value = { tipo: 'erro', texto: 'As senhas não coincidem.' }; return }
  if (nova.length < 6)       { msgSenha.value = { tipo: 'erro', texto: 'Mínimo 6 caracteres.' }; return }

  salvandoSenha.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: nova })
    if (error) throw error
    msgSenha.value = { tipo: 'sucesso', texto: '✓ Senha atualizada com sucesso!' }
    setTimeout(() => { modalSenha.value = false; msgSenha.value = null }, 1800)
  } catch (e) {
    msgSenha.value = { tipo: 'erro', texto: 'Erro: ' + e.message }
  } finally {
    salvandoSenha.value = false
  }
}

async function sair() {
  await logout()
  router.push('/login')
}
</script>

<style scoped>
.app-layout { display: flex; }

.main-content {
  flex: 1;
  padding: 32px;
  background: #f8fafc;
  min-height: 100vh;
}

/* Loading */
.loading-full {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 60vh; gap: 16px; color: #94a3b8;
}
.spinner {
  width: 36px; height: 36px;
  border: 3px solid #e2e8f0; border-top-color: #1e3a5f;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Wrap */
.perfil-wrap { max-width: 900px; animation: fadeUp 0.2s ease; }
@keyframes fadeUp { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }

/* Hero */
.hero-card {
  background: #fff; border-radius: 16px;
  border: 1px solid #e2e8f0; box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  overflow: hidden; margin-bottom: 20px;
}
.hero-strip {
  height: 6px;
  background: linear-gradient(90deg, #1e3a5f 0%, #2d6bc4 50%, #1e3a5f 100%);
}
.hero-body {
  display: flex; align-items: center; gap: 20px; padding: 24px 28px;
  flex-wrap: wrap;
}
.avatar {
  width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #1e3a5f, #2d6bc4);
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; font-weight: 700; color: #fff;
  box-shadow: 0 4px 14px rgba(30,58,95,0.25);
}
.hero-info { flex: 1; min-width: 0; }
.hero-info h2 { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
.hero-email  { font-size: 0.85rem; color: #94a3b8; margin: 0 0 10px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.chip-blue  { background: #eff6ff; color: #1d4ed8; }
.chip-green { background: #f0fdf4; color: #16a34a; }
.chip-gray  { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }

/* Layout */
.two-col { display: grid; grid-template-columns: 1fr 280px; gap: 16px; align-items: start; }
.side-col { display: flex; flex-direction: column; gap: 14px; }

/* Card */
.card {
  background: #fff; border-radius: 14px;
  border: 1px solid #e2e8f0; box-shadow: 0 1px 6px rgba(0,0,0,0.04); overflow: hidden;
}
.card-header {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px; border-bottom: 1px solid #f1f5f9;
}
.card-icon { font-size: 1.1rem; }
.card-header h3 { font-size: 0.9rem; font-weight: 700; color: #1e293b; margin: 0; }

/* Info grid */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; }
.info-item { padding: 14px 20px; border-bottom: 1px solid #f8fafc; }
.info-item:nth-last-child(-n+2) { border-bottom: none; }
.info-item label {
  display: block; font-size: 0.7rem; font-weight: 700;
  color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;
}
.info-item p { font-size: 0.875rem; color: #1e293b; font-weight: 500; margin: 0; }
.mono { font-family: 'Courier New', monospace; font-size: 0.82rem !important; }

/* Form edit */
.form-edit { padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
.form-group input {
  padding: 10px 12px; background: #f8fafc;
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 0.875rem; color: #1e293b; outline: none; font-family: inherit;
  transition: border-color 0.15s;
}
.form-group input:focus { border-color: #1e3a5f; background: #fff; }
.form-actions { display: flex; justify-content: flex-end; }

/* Action row */
.action-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 16px 20px;
}
.action-row strong { display: block; font-size: 0.875rem; font-weight: 600; color: #1e293b; margin-bottom: 2px; }
.action-row p { font-size: 0.75rem; color: #94a3b8; margin: 0; }

/* Buttons */
.btn {
  padding: 8px 18px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; border: none; font-family: inherit; transition: all 0.15s; white-space: nowrap;
}
.btn-primary { background: #1e3a5f; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #163050; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-ghost  { background: #fff; color: #1e3a5f; border: 1.5px solid #cbd5e1; }
.btn-ghost:hover { border-color: #1e3a5f; }
.btn-danger { background: #fef2f2; color: #dc2626; border: 1.5px solid #fecaca; }
.btn-danger:hover { background: #fee2e2; }

/* Messages */
.msg { padding: 10px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 500; }
.msg.sucesso { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.msg.erro    { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

/* Modal */
.overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,0.4);
  backdrop-filter: blur(3px); display: flex;
  align-items: center; justify-content: center; z-index: 200;
}
.modal {
  background: #fff; border-radius: 16px; width: 420px; max-width: 95vw;
  box-shadow: 0 20px 60px rgba(0,0,0,0.14); border: 1px solid #e2e8f0;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px; border-bottom: 1px solid #f1f5f9;
}
.modal-header h3 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
.modal-close {
  width: 28px; height: 28px; border-radius: 7px; border: 1px solid #e2e8f0;
  background: #f8fafc; cursor: pointer; color: #94a3b8; font-size: 0.8rem;
  display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { color: #1e293b; }
.modal-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; }
.modal-footer { padding: 14px 22px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 10px; }

/* Responsive */
@media (max-width: 768px) {
  .main-content { padding: 16px; }
  .two-col { grid-template-columns: 1fr; }
  .hero-body { flex-direction: column; align-items: flex-start; }
  .info-grid { grid-template-columns: 1fr; }
  .info-item:nth-last-child(-n+2) { border-bottom: 1px solid #f8fafc; }
  .info-item:last-child { border-bottom: none; }
}
</style>