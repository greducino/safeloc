<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">🏫 Turmas</h1>
        <p class="page-sub">Gerencie os grupos e horários de alunos.</p>
      </div>
      <button @click="abrirModalCadastro" class="btn-primary">+ Nova Turma</button>
    </div>

    <div class="search-bar">
      <span>🔍</span>
      <input v-model="filtroBusca" type="text" placeholder="Buscar turma pelo nome..." />
    </div>

    <div class="table-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando turmas…</p>
      </div>
      <div v-else-if="turmasFiltradas.length === 0" class="empty-state">
        <span>🏫</span>
        <p>Nenhuma turma cadastrada.</p>
      </div>
      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome da Turma</th>
              <th>Nomenclatura</th>
              <th>Horário</th>
              <th>Período</th>
              <th class="th-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="turma in turmasFiltradas" :key="turma.idturma">
              <td class="td-bold">{{ turma.nome }}</td>
              <td class="td-muted">{{ turma.nomenclatura || '—' }}</td>
              <td>
                <span class="badge-horario">{{ formatarHorario(turma) }}</span>
              </td>
              <td class="td-muted td-sm">{{ formatarPeriodo(turma) }}</td>
              <td class="td-actions">
                <button @click="verAlunos(turma)" class="icon-btn" title="Ver alunos">👁️</button>
                <button @click="abrirModalEdicao(turma)" class="icon-btn" title="Editar">✏️</button>
                <button @click="deletar(turma.idturma, turma.nome)" class="icon-btn icon-btn-danger" title="Excluir">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal criar / editar -->
    <div v-if="modalTurma" class="overlay" @click.self="modalTurma = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editando ? 'Editar Turma' : 'Nova Turma' }}</h3>
          <button @click="modalTurma = false" class="modal-close">✕</button>
        </div>
        <form @submit.prevent="salvarTurma" class="modal-body">
          <div class="form-field">
            <label>Nome da Turma *</label>
            <input v-model="form.nome" required placeholder="Ex: Engenharia 2024.1" />
          </div>
          <div class="form-field">
            <label>Nomenclatura</label>
            <input v-model="form.nomenclatura" placeholder="Ex: ENG-2024" />
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Horário Início</label>
              <input v-model="form.horario_inicio" type="time" />
            </div>
            <div class="form-field">
              <label>Horário Término</label>
              <input v-model="form.horario_termino" type="time" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Data Início</label>
              <input v-model="form.data_inicio" type="date" />
            </div>
            <div class="form-field">
              <label>Data Término</label>
              <input v-model="form.data_termino" type="date" />
            </div>
          </div>
          <div class="form-field">
            <label>Capacidade Máxima</label>
            <input v-model.number="form.capacidade_maxima" type="number" min="1" placeholder="30" />
          </div>
          <div class="modal-footer">
            <button type="button" @click="modalTurma = false" class="btn-ghost">Cancelar</button>
            <button type="submit" class="btn-primary">{{ editando ? 'Atualizar' : 'Criar Turma' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal alunos da turma -->
    <div v-if="modalAlunos" class="overlay" @click.self="modalAlunos = false">
      <div class="modal modal-lg">
        <div class="modal-header">
          <div>
            <h3>Alunos da Turma</h3>
            <p class="modal-sub">{{ turmaSelecionada?.nome }}</p>
          </div>
          <button @click="modalAlunos = false" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="loadingAlunos" class="loading-state">
            <div class="spinner"></div>
          </div>
          <div v-else-if="listaAlunosTurma.length === 0" class="empty-state">
            <span>👥</span>
            <p>Nenhum aluno vinculado a esta turma.</p>
          </div>
          <ul v-else class="alunos-list">
            <li v-for="rel in listaAlunosTurma" :key="rel.aluno?.idaluno" class="aluno-item">
              <div class="aluno-avatar">{{ rel.aluno?.nome?.charAt(0)?.toUpperCase() }}</div>
              <div class="aluno-info">
                <strong>{{ rel.aluno?.nome }} {{ rel.aluno?.sobrenome }}</strong>
                <span>RA: {{ rel.aluno?.ra || '—' }} · {{ rel.aluno?.email }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/composables/useSupabase.js'

const turmas         = ref([])
const loading        = ref(true)
const loadingAlunos  = ref(false)
const filtroBusca    = ref('')
const modalTurma     = ref(false)
const modalAlunos    = ref(false)
const editando       = ref(false)
const idEdicao       = ref(null)
const turmaSelecionada   = ref(null)
const listaAlunosTurma   = ref([])

const form = ref({
  nome: '', nomenclatura: '',
  horario_inicio: '', horario_termino: '',
  data_inicio: '', data_termino: '',
  capacidade_maxima: null,
})

const turmasFiltradas = computed(() => {
  const b = filtroBusca.value.toLowerCase()
  return turmas.value.filter(t => t.nome.toLowerCase().includes(b))
})

function formatarHorario(t) {
  if (t.horario_inicio && t.horario_termino) return `${t.horario_inicio} – ${t.horario_termino}`
  return t.horario_inicio || t.horario_termino || '—'
}
function formatarPeriodo(t) {
  const i = t.data_inicio  ? new Date(t.data_inicio).toLocaleDateString('pt-BR')  : null
  const f = t.data_termino ? new Date(t.data_termino).toLocaleDateString('pt-BR') : null
  if (i && f) return `${i} → ${f}`
  return i || '—'
}

const buscarTurmas = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.from('turma').select('*').order('nome')
    if (error) throw error
    turmas.value = data
  } catch (e) { alert(e.message) }
  finally { loading.value = false }
}

const abrirModalCadastro = () => {
  editando.value = false
  form.value = { nome: '', nomenclatura: '', horario_inicio: '', horario_termino: '', data_inicio: '', data_termino: '', capacidade_maxima: null }
  modalTurma.value = true
}

const abrirModalEdicao = (t) => {
  editando.value = true
  idEdicao.value = t.idturma
  form.value = {
    nome: t.nome || '', nomenclatura: t.nomenclatura || '',
    horario_inicio: t.horario_inicio || '', horario_termino: t.horario_termino || '',
    data_inicio: t.data_inicio || '', data_termino: t.data_termino || '',
    capacidade_maxima: t.capacidade_maxima || null,
  }
  modalTurma.value = true
}

const salvarTurma = async () => {
  try {
    const payload = { ...form.value }
    if (!payload.capacidade_maxima) delete payload.capacidade_maxima
    if (!payload.data_inicio)       delete payload.data_inicio
    if (!payload.data_termino)      delete payload.data_termino

    if (editando.value) {
      const { error } = await supabase.from('turma').update(payload).eq('idturma', idEdicao.value)
      if (error) throw error
    } else {
      const { error } = await supabase.from('turma').insert([payload])
      if (error) throw error
    }
    modalTurma.value = false
    buscarTurmas()
  } catch (e) { alert(e.message) }
}

const deletar = async (id, nome) => {
  if (!confirm(`Excluir a turma "${nome}"?`)) return
  try {
    const { error } = await supabase.from('turma').delete().eq('idturma', id)
    if (error) throw error
    buscarTurmas()
  } catch { alert('Erro: verifique se há alunos vinculados.') }
}

const verAlunos = async (turma) => {
  turmaSelecionada.value = turma
  modalAlunos.value = true
  loadingAlunos.value = true
  listaAlunosTurma.value = []
  try {
    // Busca ra em vez de cpf
    const { data, error } = await supabase
      .from('aluno_has_turma')
      .select(`aluno (idaluno, nome, sobrenome, ra, email)`)
      .eq('turma_id', turma.idturma)
    if (error) throw error
    listaAlunosTurma.value = data
  } catch (e) { console.error(e.message) }
  finally { loadingAlunos.value = false }
}

onMounted(buscarTurmas)
</script>

<style scoped>
.page { padding: 28px 32px; max-width: 1100px; margin: 0 auto; }

.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
}
.page-title { font-size: 1.6rem; font-weight: 800; color: #1a3a6b; margin: 0 0 4px; }
.page-sub   { font-size: 0.85rem; color: #6b82a0; margin: 0; }

.search-bar {
  display: flex; align-items: center; gap: 10px;
  background: #fff; border: 1.5px solid #dbeafe; border-radius: 10px;
  padding: 10px 16px; margin-bottom: 20px;
}
.search-bar input { flex: 1; border: none; outline: none; font-size: 0.9rem; color: #1a3a6b; background: transparent; }
.search-bar input::placeholder { color: #a0b4c8; }

.table-card { background: #fff; border: 1.5px solid #dbeafe; border-radius: 12px; overflow: hidden; }
.table-wrap  { overflow-x: auto; }

.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 56px 0; gap: 12px; color: #6b82a0; font-size: 0.9rem;
}
.empty-state span { font-size: 2.5rem; }
.spinner {
  width: 32px; height: 32px; border: 3px solid #dbeafe;
  border-top-color: #1a3a6b; border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  color: #6b82a0; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px; padding: 13px 20px; text-align: left;
  background: #f8faff; border-bottom: 1px solid #dbeafe;
}
.th-right { text-align: right; }
.data-table td { padding: 13px 20px; font-size: 0.875rem; color: #2d4a6e; border-bottom: 1px solid #f0f4fb; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #f8faff; }
.td-bold  { font-weight: 700; color: #1a3a6b !important; }
.td-muted { color: #94a3b8 !important; }
.td-sm    { font-size: 0.8rem !important; }
.td-actions { text-align: right; white-space: nowrap; }

.badge-horario {
  background: #eff6ff; color: #1e3a6b;
  border: 1px solid #bfdbfe; padding: 3px 10px;
  border-radius: 20px; font-size: 0.75rem; font-weight: 600;
}

.icon-btn {
  background: none; border: none; cursor: pointer;
  padding: 6px 8px; border-radius: 6px; font-size: 1rem;
  transition: background 0.15s; margin-left: 2px;
}
.icon-btn:hover { background: #f0f4fb; }
.icon-btn-danger:hover { background: #fee2e2 !important; }

/* Buttons */
.btn-primary {
  background: #1a3a6b; color: #fff; border: none; border-radius: 8px;
  padding: 10px 20px; font-weight: 700; font-size: 0.9rem; cursor: pointer;
  transition: background 0.2s; font-family: inherit;
}
.btn-primary:hover { background: #245096; }
.btn-ghost {
  background: transparent; color: #6b82a0; border: 1.5px solid #dbeafe;
  border-radius: 8px; padding: 10px 20px; font-weight: 600;
  font-size: 0.9rem; cursor: pointer; font-family: inherit;
}
.btn-ghost:hover { background: #f0f4fb; }

/* Modal */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px;
}
.modal {
  background: #fff; border-radius: 16px; width: 100%; max-width: 480px;
  border: 1.5px solid #dbeafe; box-shadow: 0 20px 60px rgba(26,58,107,0.18);
  max-height: 90vh; overflow-y: auto;
}
.modal-lg { max-width: 600px; }

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #f0f4fb; position: sticky; top: 0; background: #fff;
}
.modal-header h3 { font-size: 1rem; font-weight: 800; color: #1a3a6b; margin: 0; }
.modal-sub { font-size: 0.8rem; color: #94a3b8; margin: 2px 0 0; }
.modal-close {
  background: none; border: none; font-size: 1rem; color: #6b82a0;
  cursor: pointer; padding: 4px; border-radius: 6px;
}
.modal-close:hover { color: #1a3a6b; background: #f0f4fb; }

.modal-body { padding: 24px; }
.modal-footer {
  display: flex; gap: 12px; justify-content: flex-end;
  padding-top: 16px; border-top: 1px solid #f0f4fb; margin-top: 4px;
}

.form-field { margin-bottom: 14px; }
.form-field label {
  display: block; font-size: 0.72rem; font-weight: 700;
  color: #5a7a9e; margin-bottom: 5px; text-transform: uppercase;
}
.form-field input, .form-field select {
  width: 100%; background: #f8faff; border: 1.5px solid #dbeafe;
  border-radius: 8px; padding: 9px 12px; color: #1a3a6b; font-size: 0.875rem;
  box-sizing: border-box; outline: none; font-family: inherit; transition: border-color 0.2s;
}
.form-field input:focus { border-color: #1a3a6b; background: #fff; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* Alunos list */
.alunos-list { display: flex; flex-direction: column; gap: 10px; list-style: none; padding: 0; margin: 0; }
.aluno-item {
  display: flex; align-items: center; gap: 14px;
  background: #f8faff; border: 1px solid #dbeafe;
  border-radius: 10px; padding: 12px 16px;
}
.aluno-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #1e3a5f, #2d6bc4);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 700; color: #fff;
}
.aluno-info { display: flex; flex-direction: column; gap: 2px; }
.aluno-info strong { font-size: 0.875rem; color: #1a3a6b; }
.aluno-info span   { font-size: 0.75rem; color: #94a3b8; }

@media (max-width: 640px) { .page { padding: 20px 16px; } .form-row { grid-template-columns: 1fr; } }
</style>