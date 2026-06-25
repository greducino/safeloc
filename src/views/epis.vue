<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">EPIs</h2>
        <p class="page-sub">Catálogo de Equipamentos de Proteção Individual</p>
      </div>
      <button v-if="isFuncionario" class="btn-primary" @click="abrirModal()">
        + Novo EPI
      </button>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input v-model="busca" class="search-input" placeholder="Buscar EPI por nome ou tipo…" />
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando EPIs…</p>
    </div>

    <div v-else-if="episFiltrados.length === 0" class="empty-state">
      <span class="empty-icon">🦺</span>
      <p>Nenhum EPI encontrado.</p>
    </div>

    <div v-else class="epi-grid">
      <div v-for="epi in episFiltrados" :key="epi.idepi" class="epi-card">
        <div class="epi-card-top">
          <div class="epi-title-row">
            <h3 class="epi-nome">{{ epi.nome }}</h3>
            <span :class="['epi-badge', epi.disponivel ? 'badge-ok' : 'badge-off']">
              {{ epi.disponivel ? 'Disponível' : 'Indisponível' }}
            </span>
          </div>
          <p class="epi-tipo">{{ epi.tipo }}</p>
        </div>

        <p class="epi-desc">{{ epi.descricao || 'Sem descrição.' }}</p>

        <div class="epi-footer">
          <div class="epi-meta">
            <span class="meta-item">
              <span class="meta-label">Qtd</span>
              <span class="meta-val">{{ epi.quantidade }}</span>
            </span>
            <span v-if="epi.data_validade" class="meta-item">
              <span class="meta-label">Validade</span>
              <span class="meta-val">{{ fmtDate(epi.data_validade) }}</span>
            </span>
          </div>
          <div class="epi-actions">
            <button v-if="isFuncionario" class="btn-sm btn-edit" @click="abrirModal(epi)">Editar</button>
            <button
              v-if="isAluno"
              class="btn-sm btn-solicitar"
              :disabled="!epi.disponivel"
              @click="solicitar(epi)"
            >
              {{ epi.disponivel ? 'Solicitar' : 'Esgotado' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modal" class="overlay" @click.self="modal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ form.idepi ? 'Editar EPI' : 'Novo EPI' }}</h3>
          <button class="modal-close" @click="modal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-field">
            <label class="form-label">Nome *</label>
            <input v-model="form.nome" required class="form-input" placeholder="Ex: Capacete de Segurança" />
          </div>
          <div class="form-field">
            <label class="form-label">Tipo</label>
            <input v-model="form.tipo" class="form-input" placeholder="Ex: Proteção da Cabeça" />
          </div>
          <div class="form-row2">
            <div class="form-field">
              <label class="form-label">Quantidade</label>
              <input v-model.number="form.quantidade" type="number" min="0" class="form-input" />
            </div>
            <div class="form-field">
              <label class="form-label">Validade</label>
              <input v-model="form.data_validade" type="date" class="form-input" />
            </div>
          </div>
          <div class="form-field">
            <label class="form-label">Código Patrimônio</label>
            <input v-model="form.codigo_patrimonio" class="form-input" placeholder="Ex: PAT-001" />
          </div>
          <div class="form-field">
            <label class="form-label">Descrição</label>
            <textarea v-model="form.descricao" rows="3" class="form-input form-textarea" placeholder="Descrição do equipamento…"></textarea>
          </div>
          <div class="form-checks">
            <label class="check-label">
              <input type="checkbox" v-model="form.disponivel" class="check-input" />
              <span>Disponível</span>
            </label>
            <label class="check-label">
              <input type="checkbox" v-model="form.ativo" class="check-input" />
              <span>Ativo</span>
            </label>
          </div>
          <p v-if="erroModal" class="form-error">⚠ {{ erroModal }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="modal = false">Cancelar</button>
          <button class="btn-primary" @click="salvar" :disabled="salvando">
            {{ salvando ? 'Salvando…' : 'Salvar EPI' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/composables/useSupabase.js'

const { isFuncionario, isAluno, profile } = useAuth()
const epis    = ref([])
const loading = ref(true)
const busca   = ref('')
const modal   = ref(false)
const salvando = ref(false)
const erroModal = ref('')

const formVazio = () => ({
  idepi: null, nome: '', tipo: '', quantidade: 0,
  disponivel: true, ativo: true, data_validade: '',
  codigo_patrimonio: '', descricao: '', foto: ''
})
const form = ref(formVazio())

const episFiltrados = computed(() => {
  const q = busca.value.toLowerCase()
  return epis.value.filter(e =>
    e.nome?.toLowerCase().includes(q) || e.tipo?.toLowerCase().includes(q)
  )
})

onMounted(carregar)

async function carregar() {
  loading.value = true
  const { data } = await supabase.from('epi').select('*').eq('ativo', true).order('nome')
  epis.value = data ?? []
  loading.value = false
}

function abrirModal(epi = null) {
  erroModal.value = ''
  form.value = epi
    ? { ...epi, data_validade: epi.data_validade?.slice(0, 10) ?? '' }
    : formVazio()
  modal.value = true
}

async function salvar() {
  if (!form.value.nome.trim()) { erroModal.value = 'Nome obrigatório'; return }
  salvando.value = true
  erroModal.value = ''
  const payload = {
    nome: form.value.nome, tipo: form.value.tipo,
    quantidade: form.value.quantidade, disponivel: form.value.disponivel,
    ativo: form.value.ativo, descricao: form.value.descricao,
    codigo_patrimonio: form.value.codigo_patrimonio || null,
    data_validade: form.value.data_validade || null,
  }
  let erro
  if (form.value.idepi) {
    const res = await supabase.from('epi').update(payload).eq('idepi', form.value.idepi)
    erro = res.error
  } else {
    const res = await supabase.from('epi').insert(payload)
    erro = res.error
  }
  salvando.value = false
  if (erro) { erroModal.value = erro.message; return }
  modal.value = false
  await carregar()
}

async function solicitar(epi) {
  if (!profile.value?.idaluno) return alert('Perfil de aluno não encontrado.')
  const { error } = await supabase.from('solicitacoes').insert({
    aluno_id: profile.value.idaluno,
    epi_id: epi.idepi,
    status: 'pendente',
  })
  if (error) { alert('Erro: ' + error.message); return }
  alert('Solicitação enviada com sucesso!')
}

function fmtDate(d) {
  if (!d) return '–'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}
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

/* Search */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1.5px solid #dbeafe;
  border-radius: 10px;
  padding: 10px 16px;
  margin-bottom: 24px;
  max-width: 420px;
}

.search-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  color: #1a3a6b;
}

.search-input::placeholder {
  color: #a0b4c8;
}

/* Loading / Empty */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 16px;
  color: #6b82a0;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #dbeafe;
  border-top-color: #1a3a6b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-icon { font-size: 3rem; }

/* EPI Grid */
.epi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.epi-card {
  background: #ffffff;
  border: 1.5px solid #dbeafe;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.2s, transform 0.2s;
}

.epi-card:hover {
  box-shadow: 0 6px 20px rgba(26, 58, 107, 0.1);
  transform: translateY(-2px);
}

.epi-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.epi-nome {
  font-size: 1rem;
  font-weight: 700;
  color: #1a3a6b;
  margin: 0;
  flex: 1;
}

.epi-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.badge-ok  { background: #dcfce7; color: #166534; }
.badge-off { background: #fee2e2; color: #991b1b; }

.epi-tipo {
  font-size: 0.8rem;
  color: #6b82a0;
  margin: 0;
  font-weight: 500;
}

.epi-desc {
  font-size: 0.82rem;
  color: #8fa3bc;
  line-height: 1.6;
  flex: 1;
  margin: 0;
}

.epi-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f4fb;
}

.epi-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.meta-label {
  font-size: 0.68rem;
  color: #a0b4c8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.meta-val {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a3a6b;
}

.epi-actions {
  display: flex;
  gap: 6px;
}

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
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #245096;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-ghost {
  background: transparent;
  color: #6b82a0;
  border: 1.5px solid #dbeafe;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover {
  background: #f0f4fb;
}

.btn-sm {
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 700;
  transition: opacity 0.2s;
}

.btn-sm:hover:not(:disabled) { opacity: 0.8; }
.btn-sm:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-edit      { background: #dbeafe; color: #1a3a6b; }
.btn-solicitar { background: #1a3a6b; color: #ffffff; }

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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #f0f4fb;
}

/* Form */
.form-row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-field {
  margin-bottom: 16px;
}

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

.form-input:focus {
  border-color: #1a3a6b;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-checks {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.check-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  color: #5a7a9e;
  cursor: pointer;
}

.check-input {
  accent-color: #1a3a6b;
}

.form-error {
  color: #c0392b;
  font-size: 0.82rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 4px;
}

@media (max-width: 640px) {
  .page { padding: 20px 16px; }
}
</style>