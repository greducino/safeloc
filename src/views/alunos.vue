<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Gestão de Alunos</h2>
        <p class="page-sub">Visualize e monitore os alunos cadastrados no sistema.</p>
      </div>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input
        v-model="filtroBusca"
        type="text"
        placeholder="Procurar por nome, RA ou e-mail..."
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
              <th>RA</th>
              <th>E-mail</th>
              <th class="th-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="aluno in alunosFiltrados" :key="aluno.idaluno">
              <td class="td-name">{{ aluno.nome }} {{ aluno.sobrenome }}</td>
              <td class="td-mono">{{ aluno.ra || '—' }}</td>
              <td>{{ aluno.email }}</td>
              <td class="td-actions">
                <button @click="abrirModalEdicao(aluno)" class="icon-btn edit-btn" title="Editar">✏️</button>
                <button @click="eliminarAluno(aluno.idaluno, aluno.nome)" class="icon-btn delete-btn" title="Excluir">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal edição -->
    <div v-if="modalAberto" class="overlay" @click.self="fecharModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Editar Aluno</h3>
          <button @click="fecharModal" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-field">
            <label class="form-label">Nome *</label>
            <input v-model="form.nome" type="text" required class="form-input" placeholder="Primeiro nome" />
          </div>
          <div class="form-field">
            <label class="form-label">Sobrenome</label>
            <input v-model="form.sobrenome" type="text" class="form-input" placeholder="Sobrenome" />
          </div>
          <div class="form-field">
            <label class="form-label">RA — Registro Acadêmico</label>
            <input v-model="form.ra" type="text" maxlength="20" class="form-input" placeholder="Ex: 2024001234" />
          </div>
          <div class="form-field">
            <label class="form-label">E-mail</label>
            <input v-model="form.email" type="email" class="form-input" placeholder="exemplo@email.com" disabled />
            <small style="color:#94a3b8;font-size:0.75rem">O e-mail não pode ser alterado aqui.</small>
          </div>
          <div class="modal-footer">
            <button type="button" @click="fecharModal" class="btn-ghost">Cancelar</button>
            <button @click="salvarAluno" :disabled="salvando" class="btn-primary">
              <span v-if="salvando" class="btn-spinner"></span>
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAlunos } from '@/composables/useSupabase.js'

const { alunos, loading, listarAlunos, atualizarAluno, deletarAluno } = useAlunos()

const filtroBusca  = ref('')
const modalAberto  = ref(false)
const salvando     = ref(false)
const alunoIdEdicao = ref(null)

const form = ref({ nome: '', sobrenome: '', ra: '', email: '' })

const alunosFiltrados = computed(() => {
  const busca = filtroBusca.value.toLowerCase().trim()
  if (!busca) return alunos.value
  return alunos.value.filter(a =>
    a.nome?.toLowerCase().includes(busca) ||
    a.sobrenome?.toLowerCase().includes(busca) ||
    a.ra?.toLowerCase().includes(busca) ||
    a.email?.toLowerCase().includes(busca)
  )
})

const abrirModalEdicao = (aluno) => {
  alunoIdEdicao.value = aluno.idaluno
  form.value = { nome: aluno.nome, sobrenome: aluno.sobrenome || '', ra: aluno.ra || '', email: aluno.email }
  modalAberto.value = true
}

const fecharModal = () => { modalAberto.value = false }

const salvarAluno = async () => {
  try {
    salvando.value = true
    await atualizarAluno(alunoIdEdicao.value, {
      nome:      form.value.nome,
      sobrenome: form.value.sobrenome,
      ra:        form.value.ra,
    })
    fecharModal()
    await listarAlunos()
  } catch (error) {
    alert('Erro ao salvar: ' + error.message)
  } finally {
    salvando.value = false
  }
}

const eliminarAluno = async (id, nome) => {
  if (!confirm(`Excluir o aluno "${nome}"? Esta ação não pode ser desfeita.`)) return
  try {
    await deletarAluno(id)
    await listarAlunos()
  } catch (error) {
    alert('Erro ao excluir: ' + error.message)
  }
}

onMounted(() => listarAlunos())
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

.page-title { font-size: 1.6rem; font-weight: 800; color: #1a3a6b; margin: 0 0 4px; }
.page-sub   { font-size: 0.85rem; color: #6b82a0; margin: 0; }

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
.search-icon  { font-size: 1rem; flex-shrink: 0; }
.search-input { flex: 1; border: none; outline: none; background: transparent; font-size: 0.9rem; color: #1a3a6b; }
.search-input::placeholder { color: #a0b4c8; }

.table-card {
  background: #ffffff;
  border: 1.5px solid #dbeafe;
  border-radius: 12px;
  overflow: hidden;
}
.table-wrap { overflow-x: auto; }

.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 64px 0; gap: 14px; color: #6b82a0; font-size: 0.9rem;
}
.spinner {
  width: 32px; height: 32px;
  border: 3px solid #dbeafe;
  border-top-color: #1a3a6b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-icon { font-size: 2.5rem; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  color: #6b82a0; font-size: 0.72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px;
  padding: 14px 20px; text-align: left;
  background: #f8faff; border-bottom: 1px solid #dbeafe;
}
.th-right { text-align: right; }
.data-table td {
  padding: 14px 20px; font-size: 0.875rem; color: #2d4a6e;
  border-bottom: 1px solid #f0f4fb;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #f8faff; }
.td-name  { font-weight: 700; color: #1a3a6b !important; }
.td-mono  { font-family: monospace; font-size: 0.85rem !important; }
.td-actions { text-align: right; }

.icon-btn {
  background: none; border: none; cursor: pointer;
  padding: 6px 8px; border-radius: 6px; font-size: 1rem;
  transition: background 0.15s; margin-left: 2px;
}
.icon-btn:hover  { background: #f0f4fb; }
.delete-btn:hover { background: #fee2e2 !important; }

.btn-primary {
  background: #1a3a6b; color: #ffffff; border: none;
  border-radius: 8px; padding: 10px 20px; font-weight: 700;
  font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 8px;
  transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #245096; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-ghost {
  background: transparent; color: #6b82a0;
  border: 1.5px solid #dbeafe; border-radius: 8px;
  padding: 10px 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer;
}
.btn-ghost:hover { background: #f0f4fb; }

.btn-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #ffffff; border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px;
}
.modal {
  background: #ffffff; border-radius: 16px; width: 100%; max-width: 460px;
  border: 1.5px solid #dbeafe; box-shadow: 0 20px 60px rgba(26,58,107,0.2);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #f0f4fb;
}
.modal-title { font-size: 1.1rem; font-weight: 800; color: #1a3a6b; margin: 0; }
.modal-close { background: none; border: none; font-size: 1rem; color: #6b82a0; cursor: pointer; padding: 4px; }
.modal-close:hover { color: #1a3a6b; }
.modal-body { padding: 24px; }
.modal-footer {
  display: flex; gap: 12px; justify-content: flex-end;
  padding-top: 16px; border-top: 1px solid #f0f4fb;
}
.form-field { margin-bottom: 16px; }
.form-label {
  display: block; font-size: 0.75rem; font-weight: 700;
  color: #5a7a9e; margin-bottom: 6px;
  text-transform: uppercase; letter-spacing: 0.3px;
}
.form-input {
  width: 100%; background: #f8faff; border: 1.5px solid #dbeafe;
  border-radius: 8px; padding: 10px 14px; color: #1a3a6b; font-size: 0.9rem;
  box-sizing: border-box; outline: none; transition: border-color 0.2s;
}
.form-input:focus { border-color: #1a3a6b; }
.form-input::placeholder { color: #a0b4c8; }
.form-input:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 640px) { .page { padding: 20px 16px; } }
</style>