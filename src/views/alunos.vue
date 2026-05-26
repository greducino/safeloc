<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Gestão de Alunos</h2>
        <p class="page-sub">Registre, edite e monitore os alunos no sistema de EPIs.</p>
      </div>
      <button @click="abrirModalCadastro" class="btn-primary">
        + Novo Aluno
      </button>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input
        v-model="filtroBusca"
        type="text"
        placeholder="Procurar por nome, CPF ou e-mail..."
        class="search-input"
      />
    </div>

    <!-- Table -->
    <div class="table-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando lista de alunos…</p>
      </div>

      <div v-else-if="alunosFiltrados.length === 0" class="empty-state">
        <span class="empty-icon">👥</span>
        <p>Nenhum aluno encontrado.</p>
      </div>

      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>E-mail</th>
              <th class="th-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="aluno in alunosFiltrados" :key="aluno.idaluno">
              <td class="td-name">{{ aluno.nome }}</td>
              <td class="td-mono">{{ formatarCPF(aluno.cpf) }}</td>
              <td>{{ aluno.email }}</td>
              <td class="td-actions">
                <button @click="abrirModalEdicao(aluno)" class="icon-btn edit-btn" title="Editar">✏️</button>
                <button @click="eliminarAluno(aluno.id, aluno.nome)" class="icon-btn delete-btn" title="Eliminar">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modalAberto" class="overlay" @click.self="fecharModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ editando ? 'Editar Aluno' : 'Registar Novo Aluno' }}</h3>
          <button @click="fecharModal" class="modal-close">✕</button>
        </div>
        <form @submit.prevent="salvarAluno" class="modal-body">
          <div class="form-field">
            <label class="form-label">Nome Completo *</label>
            <input v-model="form.nome" type="text" required class="form-input" placeholder="Ex: João da Silva" />
          </div>
          <div class="form-field">
            <label class="form-label">CPF * (apenas números)</label>
            <input v-model="form.cpf" type="text" maxlength="11" placeholder="Ex: 12345678901" required class="form-input" />
          </div>
          <div class="form-field">
            <label class="form-label">E-mail *</label>
            <input v-model="form.email" type="email" placeholder="exemplo@email.com" required class="form-input" />
          </div>
          <div class="modal-footer">
            <button type="button" @click="fecharModal" class="btn-ghost">Cancelar</button>
            <button type="submit" :disabled="salvando" class="btn-primary">
              <span v-if="salvando" class="btn-spinner"></span>
              {{ editando ? 'Guardar Alterações' : 'Registar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/composables/useSupabase.js'

const alunos = ref([])
const loading = ref(true)
const salvando = ref(false)
const filtroBusca = ref('')
const modalAberto = ref(false)
const editando = ref(false)
const alunoIdEdicao = ref(null)

const form = ref({ nome: '', cpf: '', email: '' })

const buscarAlunos = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase.from('aluno').select('*').order('nome', { ascending: true })
    if (error) throw error
    alunos.value = data
  } catch (error) {
    alert('Erro ao carregar alunos: ' + error.message)
  } finally {
    loading.value = false
  }
}

const alunosFiltrados = computed(() => {
  const busca = filtroBusca.value.toLowerCase().trim()
  if (!busca) return alunos.value
  return alunos.value.filter(aluno =>
    aluno.nome.toLowerCase().includes(busca) ||
    aluno.cpf.includes(busca) ||
    aluno.email.toLowerCase().includes(busca)
  )
})

const abrirModalCadastro = () => {
  editando.value = false
  alunoIdEdicao.value = null
  form.value = { nome: '', cpf: '', email: '' }
  modalAberto.value = true
}

const abrirModalEdicao = (aluno) => {
  editando.value = true
  alunoIdEdicao.value = aluno.idaluno
  form.value = { nome: aluno.nome, cpf: aluno.cpf, email: aluno.email }
  modalAberto.value = true
}

const fecharModal = () => { modalAberto.value = false }

const salvarAluno = async () => {
  try {
    salvando.value = true
    const cpfLimpo = form.value.cpf.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) { alert('O CPF deve ter 11 dígitos.'); return }
    const dadosAluno = { nome: form.value.nome, cpf: cpfLimpo, email: form.value.email }

    if (editando.value) {
      const { error } = await supabase.from('aluno').update(dadosAluno).eq('idaluno', alunoIdEdicao.value)
      if (error) throw error
      alert('Aluno atualizado com sucesso!')
    } else {
      const { error } = await supabase.from('aluno').insert([dadosAluno])
      if (error) throw error
      alert('Aluno registado com sucesso!')
    }

    fecharModal()
    await buscarAlunos()
  } catch (error) {
    alert('Erro ao guardar aluno: ' + error.message)
  } finally {
    salvando.value = false
  }
}

const eliminarAluno = async (id, nome) => {
  if (!confirm(`Eliminar o aluno "${nome}"? Esta ação não pode ser desfeita.`)) return
  try {
    const { error } = await supabase.from('aluno').delete().eq('idaluno', id)
    if (error) throw error
    await buscarAlunos()
  } catch (error) {
    alert('Erro ao eliminar aluno: ' + error.message)
  }
}

const formatarCPF = (cpf) => {
  if (!cpf) return ''
  const c = cpf.replace(/\D/g, '')
  if (c.length !== 11) return cpf
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`
}

onMounted(() => { buscarAlunos() })
</script>

<style scoped>
.page {
  padding: 28px 32px;
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1a3a6b;
  margin: 0 0 4px;
}

.page-sub {
  font-size: 0.85rem;
  color: #6b82a0;
  margin: 0;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1.5px solid #dbeafe;
  border-radius: 10px;
  padding: 10px 16px;
  margin-bottom: 20px;
}

.search-icon { font-size: 1rem; flex-shrink: 0; }

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  color: #1a3a6b;
}

.search-input::placeholder { color: #a0b4c8; }

/* Table Card */
.table-card {
  background: #ffffff;
  border: 1.5px solid #dbeafe;
  border-radius: 12px;
  overflow: hidden;
}

.table-wrap { overflow-x: auto; }

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0;
  gap: 14px;
  color: #6b82a0;
  font-size: 0.9rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #dbeafe;
  border-top-color: #1a3a6b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-icon { font-size: 2.5rem; }

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  color: #6b82a0;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 14px 20px;
  text-align: left;
  background: #f8faff;
  border-bottom: 1px solid #dbeafe;
}

.th-right { text-align: right; }

.data-table td {
  padding: 14px 20px;
  font-size: 0.875rem;
  color: #2d4a6e;
  border-bottom: 1px solid #f0f4fb;
}

.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #f8faff; }

.td-name { font-weight: 700; color: #1a3a6b !important; }
.td-mono { font-family: monospace; font-size: 0.85rem !important; }
.td-actions { text-align: right; }

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 1rem;
  transition: background 0.15s;
  margin-left: 2px;
}

.icon-btn:hover { background: #f0f4fb; }
.delete-btn:hover { background: #fee2e2 !important; }

/* Buttons */
.btn-primary {
  background: #1a3a6b;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) { background: #245096; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-ghost {
  background: transparent;
  color: #6b82a0;
  border: 1.5px solid #dbeafe;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-ghost:hover { background: #f0f4fb; }

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* Modal */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
}

.modal {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 460px;
  border: 1.5px solid #dbeafe;
  box-shadow: 0 20px 60px rgba(26, 58, 107, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f4fb;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1a3a6b;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1rem;
  color: #6b82a0;
  cursor: pointer;
  padding: 4px;
}

.modal-close:hover { color: #1a3a6b; }

.modal-body { padding: 24px; }

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f0f4fb;
}

.form-field { margin-bottom: 16px; }

.form-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #5a7a9e;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.form-input {
  width: 100%;
  background: #f8faff;
  border: 1.5px solid #dbeafe;
  border-radius: 8px;
  padding: 10px 14px;
  color: #1a3a6b;
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus { border-color: #1a3a6b; }
.form-input::placeholder { color: #a0b4c8; }

@media (max-width: 640px) {
  .page { padding: 20px 16px; }
}
</style>