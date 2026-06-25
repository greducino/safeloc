<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Funcionários</h2>
        <p class="page-sub">Gerencie os funcionários do sistema.</p>
      </div>
      <button class="btn-primary" @click="abrirModal()">+ Novo Funcionário</button>
    </div>

    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input v-model="busca" class="search-input" placeholder="Buscar por nome, CPF ou função…" />
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando funcionários…</p>
    </div>

    <div v-else class="table-card">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome</th><th>CPF</th><th>Função</th><th>Status</th><th>Telefone</th><th class="th-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in listaFiltrada" :key="f.idfuncionario">
              <td class="td-name">{{ f.nome }} {{ f.sobrenome }}</td>
              <td class="td-mono">{{ f.cpf }}</td>
              <td>{{ f.funcao }}</td>
              <td><span :class="['status-badge', 'status-' + f.status]">{{ f.status }}</span></td>
              <td>{{ f.telefone || '–' }}</td>
              <td class="td-actions">
                <button class="icon-btn" @click="abrirModal(f)" title="Editar">✏️</button>
                <button class="icon-btn delete-btn" @click="toggleStatus(f)" :title="f.status === 'ativo' ? 'Inativar' : 'Ativar'">
                  {{ f.status === 'ativo' ? '🔒' : '🔓' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modal" class="overlay" @click.self="modal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ form.idfuncionario ? 'Editar Funcionário' : 'Novo Funcionário' }}</h3>
          <button class="modal-close" @click="modal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row2">
            <div class="form-field"><label class="form-label">Nome *</label><input v-model="form.nome" class="form-input" /></div>
            <div class="form-field"><label class="form-label">Sobrenome *</label><input v-model="form.sobrenome" class="form-input" /></div>
          </div>
          <div class="form-field"><label class="form-label">CPF *</label><input v-model="form.cpf" maxlength="14" class="form-input" /></div>
          <div class="form-field"><label class="form-label">E-mail *</label><input v-model="form.email" type="email" class="form-input" /></div>
          <div class="form-row2">
            <div class="form-field"><label class="form-label">Função</label><input v-model="form.funcao" class="form-input" /></div>
            <div class="form-field"><label class="form-label">Telefone</label><input v-model="form.telefone" class="form-input" /></div>
          </div>
          <div class="form-field"><label class="form-label">Data Nascimento</label><input v-model="form.data_nascimento" type="date" class="form-input" /></div>
          <div v-if="!form.idfuncionario" class="form-field">
            <label class="form-label">Senha *</label>
            <input v-model="form.password" type="password" minlength="6" class="form-input" />
          </div>
          <p v-if="erroModal" class="form-error">⚠ {{ erroModal }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="modal = false">Cancelar</button>
          <button class="btn-primary" @click="salvar" :disabled="salvando">{{ salvando ? 'Salvando…' : 'Salvar' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/composables/useSupabase.js'

const { registrarFuncionario } = useSupabase()
const lista   = ref([])
const loading = ref(true)
const busca   = ref('')
const modal   = ref(false)
const salvando = ref(false)
const erroModal = ref('')

const formVazio = () => ({
  idfuncionario: null, nome: '', sobrenome: '', cpf: '',
  email: '', funcao: '', telefone: '', data_nascimento: '', status: 'ativo', password: ''
})
const form = ref(formVazio())

const listaFiltrada = computed(() => {
  const q = busca.value.toLowerCase()
  return lista.value.filter(f =>
    (f.nome + ' ' + f.sobrenome).toLowerCase().includes(q) ||
    f.cpf?.includes(q) || f.funcao?.toLowerCase().includes(q)
  )
})

onMounted(carregar)

async function carregar() {
  loading.value = true
  const { data } = await supabase.from('funcionario').select('*').order('nome')
  lista.value = data ?? []
  loading.value = false
}

function abrirModal(f = null) {
  erroModal.value = ''
  form.value = f
    ? { ...f, data_nascimento: f.data_nascimento?.slice(0, 10) ?? '', password: '' }
    : formVazio()
  modal.value = true
}

async function salvar() {
  if (!form.value.nome || !form.value.cpf || !form.value.email) {
    erroModal.value = 'Nome, CPF e e-mail são obrigatórios.'
    return
  }
  salvando.value = true
  erroModal.value = ''

  if (!form.value.idfuncionario) {
    const res = await registrarFuncionario({
      nome: form.value.nome, sobrenome: form.value.sobrenome,
      cpf: form.value.cpf, email: form.value.email,
      funcao: form.value.funcao, telefone: form.value.telefone,
      password: form.value.password,
    })
    if (!res.ok) { erroModal.value = res.message; salvando.value = false; return }
  } else {
    const { error } = await supabase.from('funcionario').update({
      nome: form.value.nome, sobrenome: form.value.sobrenome,
      cpf: form.value.cpf, funcao: form.value.funcao,
      telefone: form.value.telefone,
      data_nascimento: form.value.data_nascimento || null,
    }).eq('idfuncionario', form.value.idfuncionario)
    if (error) { erroModal.value = error.message; salvando.value = false; return }
  }

  salvando.value = false
  modal.value = false
  await carregar()
}

async function toggleStatus(f) {
  const novoStatus = f.status === 'ativo' ? 'inativo' : 'ativo'
  await supabase.from('funcionario').update({ status: novoStatus }).eq('idfuncionario', f.idfuncionario)
  await carregar()
}
</script>

<style scoped>
.page { padding: 28px 32px; max-width: 1100px; margin: 0 auto; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.6rem; font-weight: 800; color: #1a3a6b; margin: 0 0 4px; }
.page-sub { font-size: 0.85rem; color: #6b82a0; margin: 0; }

.search-bar { display: flex; align-items: center; gap: 10px; background: #ffffff; border: 1.5px solid #dbeafe; border-radius: 10px; padding: 10px 16px; margin-bottom: 20px; }
.search-icon { font-size: 1rem; }
.search-input { flex: 1; border: none; outline: none; background: transparent; font-size: 0.9rem; color: #1a3a6b; }
.search-input::placeholder { color: #a0b4c8; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 64px 0; gap: 14px; color: #6b82a0; font-size: 0.9rem; }
.spinner { width: 32px; height: 32px; border: 3px solid #dbeafe; border-top-color: #1a3a6b; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.table-card { background: #ffffff; border: 1.5px solid #dbeafe; border-radius: 12px; overflow: hidden; }
.table-wrap { overflow-x: auto; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th { color: #6b82a0; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 14px 20px; text-align: left; background: #f8faff; border-bottom: 1px solid #dbeafe; }
.th-right { text-align: right; }
.data-table td { padding: 14px 20px; font-size: 0.875rem; color: #2d4a6e; border-bottom: 1px solid #f0f4fb; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #f8faff; }

.td-name { font-weight: 700; color: #1a3a6b !important; }
.td-mono { font-family: monospace; font-size: 0.82rem !important; }
.td-actions { text-align: right; }

.icon-btn { background: none; border: none; cursor: pointer; padding: 6px 8px; border-radius: 6px; font-size: 1rem; transition: background 0.15s; margin-left: 2px; }
.icon-btn:hover { background: #f0f4fb; }
.delete-btn:hover { background: #fef3c7 !important; }

.status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.73rem; font-weight: 700; text-transform: capitalize; }
.status-ativo   { background: #dcfce7; color: #166534; }
.status-inativo { background: #fee2e2; color: #991b1b; }

.btn-primary { background: #1a3a6b; color: #ffffff; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #245096; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost { background: transparent; color: #6b82a0; border: 1.5px solid #dbeafe; border-radius: 8px; padding: 10px 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer; }
.btn-ghost:hover { background: #f0f4fb; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px; }
.modal { background: #ffffff; border-radius: 16px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; border: 1.5px solid #dbeafe; box-shadow: 0 20px 60px rgba(26,58,107,0.2); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f0f4fb; }
.modal-title { font-size: 1.1rem; font-weight: 800; color: #1a3a6b; margin: 0; }
.modal-close { background: none; border: none; font-size: 1rem; color: #6b82a0; cursor: pointer; padding: 4px; }
.modal-close:hover { color: #1a3a6b; }
.modal-body { padding: 24px; }
.modal-footer { display: flex; gap: 12px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid #f0f4fb; }

.form-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-field { margin-bottom: 14px; }
.form-label { display: block; font-size: 0.72rem; font-weight: 700; color: #5a7a9e; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
.form-input { width: 100%; background: #f8faff; border: 1.5px solid #dbeafe; border-radius: 8px; padding: 10px 14px; color: #1a3a6b; font-size: 0.9rem; box-sizing: border-box; outline: none; transition: border-color 0.2s; }
.form-input:focus { border-color: #1a3a6b; }
.form-input::placeholder { color: #a0b4c8; }
.form-error { color: #c0392b; font-size: 0.82rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 8px 12px; }

@media (max-width: 640px) { .page { padding: 20px 16px; } }
</style>