<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Entregas & Devoluções</h2>
        <p class="page-sub">Gerencie a entrega e devolução de EPIs.</p>
      </div>
      <button class="btn-primary" @click="abrirModal()">+ Nova Entrega</button>
    </div>

    <!-- Tabs -->
    <div class="tabs-bar">
      <button :class="['tab-btn', { active: aba === 'aluno' }]" @click="aba = 'aluno'">
        👥 Alunos
      </button>
      <button :class="['tab-btn', { active: aba === 'funcionario' }]" @click="aba = 'funcionario'">
        👷 Funcionários
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando registros…</p>
    </div>

    <div v-else class="table-card">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ aba === 'aluno' ? 'Aluno' : 'Funcionário' }}</th>
              <th>EPI</th>
              <th>Entrega</th>
              <th>Devolução</th>
              <th class="th-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in lista" :key="e.id">
              <td class="td-name">{{ e.pessoa }}</td>
              <td>{{ e.epi?.nome }}</td>
              <td>{{ fmtDate(e.data_entrega) }}</td>
              <td>{{ e.data_devolucao ? fmtDate(e.data_devolucao) : '–' }}</td>
              <td class="td-actions">
                <button
                  v-if="!e.data_devolucao"
                  class="btn-sm btn-devolucao"
                  @click="registrarDevolucao(e)"
                >✓ Devolvido</button>
                <span v-else class="devolvido-label">✓ Devolvido</span>
              </td>
            </tr>
            <tr v-if="!lista.length">
              <td colspan="5" class="empty-row">Nenhum registro encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modal" class="overlay" @click.self="modal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Nova Entrega de EPI</h3>
          <button class="modal-close" @click="modal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-field">
            <label class="form-label">Tipo</label>
            <div class="select-wrap">
              <select v-model="form.tipo" class="form-input">
                <option value="aluno">Aluno</option>
                <option value="funcionario">Funcionário</option>
              </select>
            </div>
          </div>
          <div class="form-field">
            <label class="form-label">{{ form.tipo === 'aluno' ? 'Aluno' : 'Funcionário' }} *</label>
            <div class="select-wrap">
              <select v-model="form.pessoa_id" class="form-input">
                <option value="">Selecione…</option>
                <option v-for="p in pessoasFiltradas" :key="p.id" :value="p.id">{{ p.label }}</option>
              </select>
            </div>
          </div>
          <div class="form-field">
            <label class="form-label">EPI *</label>
            <div class="select-wrap">
              <select v-model="form.epi_id" class="form-input">
                <option value="">Selecione…</option>
                <option v-for="e in episDisponiveis" :key="e.idepi" :value="e.idepi">
                  {{ e.nome }} ({{ e.quantidade }} disponíveis)
                </option>
              </select>
            </div>
          </div>
          <div class="form-field">
            <label class="form-label">Data Entrega</label>
            <input v-model="form.data_entrega" type="date" class="form-input" />
          </div>
          <p v-if="erroModal" class="form-error">⚠ {{ erroModal }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="modal = false">Cancelar</button>
          <button class="btn-primary" @click="salvar" :disabled="salvando">
            {{ salvando ? 'Salvando…' : 'Confirmar Entrega' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@/composables/useSupabase.js'

const aba     = ref('aluno')
const lista   = ref([])
const loading = ref(true)
const modal   = ref(false)
const salvando = ref(false)
const erroModal = ref('')

const alunos       = ref([])
const funcionarios = ref([])
const episDisponiveis = ref([])

const form = ref({ tipo: 'aluno', pessoa_id: '', epi_id: '', data_entrega: hoje() })

const pessoasFiltradas = computed(() =>
  form.value.tipo === 'aluno'
    ? alunos.value.map(a => ({ id: a.idaluno, label: `${a.nome} ${a.sobrenome}` }))
    : funcionarios.value.map(f => ({ id: f.idfuncionario, label: `${f.nome} ${f.sobrenome}` }))
)

watch(aba, carregar)
onMounted(async () => {
  await Promise.all([carregar(), carregarSelects()])
})

async function carregar() {
  loading.value = true
  if (aba.value === 'aluno') {
    const { data } = await supabase.from('aluno_has_epi').select('*, aluno(nome,sobrenome), epi(nome)').order('data_entrega', { ascending: false })
    lista.value = (data ?? []).map(r => ({ ...r, id: r.id_entrega_aluno, pessoa: `${r.aluno?.nome} ${r.aluno?.sobrenome}` }))
  } else {
    const { data } = await supabase.from('funcionario_has_epi').select('*, funcionario(nome,sobrenome), epi(nome)').order('data_entrega', { ascending: false })
    lista.value = (data ?? []).map(r => ({ ...r, id: r.id_entrega_func, pessoa: `${r.funcionario?.nome} ${r.funcionario?.sobrenome}` }))
  }
  loading.value = false
}

async function carregarSelects() {
  const [{ data: al }, { data: fu }, { data: ep }] = await Promise.all([
    supabase.from('aluno').select('idaluno,nome,sobrenome').order('nome'),
    supabase.from('funcionario').select('idfuncionario,nome,sobrenome').eq('status', 'ativo').order('nome'),
    supabase.from('epi').select('idepi,nome,quantidade').eq('disponivel', true).eq('ativo', true),
  ])
  alunos.value = al ?? []
  funcionarios.value = fu ?? []
  episDisponiveis.value = ep ?? []
}

function abrirModal() {
  erroModal.value = ''
  form.value = { tipo: aba.value, pessoa_id: '', epi_id: '', data_entrega: hoje() }
  modal.value = true
}

async function salvar() {
  if (!form.value.pessoa_id || !form.value.epi_id) { erroModal.value = 'Selecione a pessoa e o EPI.'; return }
  salvando.value = true
  erroModal.value = ''
  let erro
  if (form.value.tipo === 'aluno') {
    const { error } = await supabase.from('aluno_has_epi').insert({ aluno_id: form.value.pessoa_id, epi_id: form.value.epi_id, data_entrega: form.value.data_entrega || null })
    erro = error
  } else {
    const { error } = await supabase.from('funcionario_has_epi').insert({ funcionario_id: form.value.pessoa_id, epi_id: form.value.epi_id, data_entrega: form.value.data_entrega || null })
    erro = error
  }
  salvando.value = false
  if (erro) { erroModal.value = erro.message; return }
  modal.value = false
  await carregar()
  await carregarSelects()
}

async function registrarDevolucao(e) {
  const tabela = aba.value === 'aluno' ? 'aluno_has_epi' : 'funcionario_has_epi'
  const pk     = aba.value === 'aluno' ? 'id_entrega_aluno' : 'id_entrega_func'
  await supabase.from(tabela).update({ data_devolucao: hoje() }).eq(pk, e.id)
  await carregar()
}

function hoje() { return new Date().toISOString().slice(0, 10) }
function fmtDate(d) { if (!d) return '–'; return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') }
</script>

<style scoped>
.page { padding: 28px 32px; max-width: 1100px; margin: 0 auto; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.6rem; font-weight: 800; color: #1a3a6b; margin: 0 0 4px; }
.page-sub { font-size: 0.85rem; color: #6b82a0; margin: 0; }

.tabs-bar { display: flex; gap: 8px; margin-bottom: 20px; }
.tab-btn { padding: 8px 20px; border: 1.5px solid #dbeafe; border-radius: 8px; background: #ffffff; color: #6b82a0; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.tab-btn.active { background: #1a3a6b; border-color: #1a3a6b; color: #ffffff; }
.tab-btn:hover:not(.active) { background: #f0f4fb; }

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
.td-actions { text-align: right; }

.empty-row { text-align: center; color: #a0b4c8; padding: 48px 20px !important; font-style: italic; }

.btn-sm { padding: 5px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 0.78rem; font-weight: 700; transition: opacity 0.2s; }
.btn-sm:hover { opacity: 0.8; }
.btn-devolucao { background: #dcfce7; color: #166534; }
.devolvido-label { font-size: 0.78rem; color: #166534; font-weight: 700; }

.btn-primary { background: #1a3a6b; color: #ffffff; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #245096; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost { background: transparent; color: #6b82a0; border: 1.5px solid #dbeafe; border-radius: 8px; padding: 10px 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer; }
.btn-ghost:hover { background: #f0f4fb; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px; }
.modal { background: #ffffff; border-radius: 16px; width: 100%; max-width: 460px; border: 1.5px solid #dbeafe; box-shadow: 0 20px 60px rgba(26,58,107,0.2); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f0f4fb; }
.modal-title { font-size: 1.1rem; font-weight: 800; color: #1a3a6b; margin: 0; }
.modal-close { background: none; border: none; font-size: 1rem; color: #6b82a0; cursor: pointer; padding: 4px; }
.modal-close:hover { color: #1a3a6b; }
.modal-body { padding: 24px; }
.modal-footer { display: flex; gap: 12px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid #f0f4fb; }

.form-field { margin-bottom: 16px; }
.form-label { display: block; font-size: 0.72rem; font-weight: 700; color: #5a7a9e; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
.select-wrap { position: relative; }
.form-input { width: 100%; background: #f8faff; border: 1.5px solid #dbeafe; border-radius: 8px; padding: 10px 14px; color: #1a3a6b; font-size: 0.9rem; box-sizing: border-box; outline: none; transition: border-color 0.2s; appearance: none; }
.form-input:focus { border-color: #1a3a6b; }
.form-error { color: #c0392b; font-size: 0.82rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 8px 12px; }

@media (max-width: 640px) { .page { padding: 20px 16px; } }
</style>