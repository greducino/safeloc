<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">Entregas & Devoluções</h2>
      <button class="btn-primary" @click="abrirModal()">+ Nova Entrega</button>
    </div>

    <div class="tabs">
      <button :class="{ active: aba === 'aluno' }"      @click="aba = 'aluno'">Alunos</button>
      <button :class="{ active: aba === 'funcionario' }" @click="aba = 'funcionario'">Funcionários</button>
    </div>

    <div v-if="loading" class="loading">Carregando…</div>

    <table v-else class="tbl">
      <thead>
        <tr>
          <th>{{ aba === 'aluno' ? 'Aluno' : 'Funcionário' }}</th>
          <th>EPI</th>
          <th>Entrega</th>
          <th>Devolução</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="e in lista" :key="e.id">
          <td>{{ e.pessoa }}</td>
          <td>{{ e.epi?.nome }}</td>
          <td>{{ fmtDate(e.data_entrega) }}</td>
          <td>{{ e.data_devolucao ? fmtDate(e.data_devolucao) : '–' }}</td>
          <td>
            <button
              v-if="!e.data_devolucao"
              class="btn-sm btn-ok"
              @click="registrarDevolucao(e)"
            >Devolvido</button>
            <span v-else class="badge-ok">Devolvido</span>
          </td>
        </tr>
        <tr v-if="!lista.length">
          <td colspan="5" class="empty">Nenhum registro encontrado.</td>
        </tr>
      </tbody>
    </table>

    <!-- Modal nova entrega -->
    <div v-if="modal" class="overlay" @click.self="modal = false">
      <div class="modal">
        <h3>Nova Entrega de EPI</h3>
        <div class="field">
          <label>Tipo</label>
          <select v-model="form.tipo">
            <option value="aluno">Aluno</option>
            <option value="funcionario">Funcionário</option>
          </select>
        </div>
        <div class="field">
          <label>{{ form.tipo === 'aluno' ? 'Aluno' : 'Funcionário' }} *</label>
          <select v-model="form.pessoa_id">
            <option value="">Selecione…</option>
            <option v-for="p in pessoasFiltradas" :key="p.id" :value="p.id">{{ p.label }}</option>
          </select>
        </div>
        <div class="field">
          <label>EPI *</label>
          <select v-model="form.epi_id">
            <option value="">Selecione…</option>
            <option v-for="e in episDisponiveis" :key="e.idepi" :value="e.idepi">
              {{ e.nome }} ({{ e.quantidade }} disponíveis)
            </option>
          </select>
        </div>
        <div class="field">
          <label>Data Entrega</label>
          <input v-model="form.data_entrega" type="date" />
        </div>
        <p v-if="erroModal" class="erro">{{ erroModal }}</p>
        <div class="modal-btns">
          <button class="btn-ghost" @click="modal = false">Cancelar</button>
          <button class="btn-primary" @click="salvar" :disabled="salvando">
            {{ salvando ? 'Salvando…' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase, useAlunos, useFuncionarios, useEpis } from '@/composables/useSupabase.js'

const aba     = ref('aluno')
const lista   = ref([])
const loading = ref(true)
const modal   = ref(false)
const salvando = ref(false)
const erroModal = ref('')

const { alunos, listarAlunos } = useAlunos()
const { funcionarios, listarFuncionarios } = useFuncionarios()
const { epis: episDisponiveisRef, listarEpis } = useEpis()
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
    const { data } = await supabase
      .from('aluno_has_epi')
      .select('*, aluno(nome,sobrenome), epi(nome)')
      .order('data_entrega', { ascending: false })
    lista.value = (data ?? []).map(r => ({
      ...r, id: r.id_entrega_aluno,
      pessoa: `${r.aluno?.nome} ${r.aluno?.sobrenome}`,
    }))
  } else {
    const { data } = await supabase
      .from('funcionario_has_epi')
      .select('*, funcionario(nome,sobrenome), epi(nome)')
      .order('data_entrega', { ascending: false })
    lista.value = (data ?? []).map(r => ({
      ...r, id: r.id_entrega_func,
      pessoa: `${r.funcionario?.nome} ${r.funcionario?.sobrenome}`,
    }))
  }
  loading.value = false
}

async function carregarSelects() {
  await Promise.all([
    listarAlunos(),
    listarFuncionarios(),
    listarEpis(),
  ])
  // copy refs to local arrays expected by the template
  alunos.value = alunos.value ?? []
  funcionarios.value = funcionarios.value ?? []
  episDisponiveis.value = (episDisponiveisRef.value ?? []).filter(e => e.disponivel && e.ativo)
}

function abrirModal() {
  erroModal.value = ''
  form.value = { tipo: aba.value, pessoa_id: '', epi_id: '', data_entrega: hoje() }
  modal.value = true
}

async function salvar() {
  if (!form.value.pessoa_id || !form.value.epi_id) {
    erroModal.value = 'Selecione a pessoa e o EPI.'
    return
  }
  salvando.value = true
  erroModal.value = ''
  let erro
  if (form.value.tipo === 'aluno') {
    try {
      const { error } = await supabase.from('aluno_has_epi').insert({
        aluno_id: form.value.pessoa_id,
        epi_id:   form.value.epi_id,
        data_entrega: form.value.data_entrega || null,
      })
      erro = error
    } catch (e) { erro = e }
  } else {
    try {
      const { error } = await supabase.from('funcionario_has_epi').insert({
        funcionario_id: form.value.pessoa_id,
        epi_id:         form.value.epi_id,
        data_entrega:   form.value.data_entrega || null,
      })
      erro = error
    } catch (e) { erro = e }
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

function hoje() {
  return new Date().toISOString().slice(0, 10)
}
function fmtDate(d) {
  if (!d) return '–'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}
</script>

<style scoped>
/* Elemento Raiz da Página - Ajustado para funcionar lado a lado com a Sidebar */
.page { 
  padding: 1.5rem; 
  width: 100%;
  max-width: 1100px; 
  margin: 0; 
  box-sizing: border-box;
}

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }

/* Abas (Tabs) */
.tabs { display: flex; gap: .5rem; background: #0f172a; border-radius: 8px; padding: 4px; width: fit-content; margin-bottom: 1.25rem; }
.tabs button { padding: .45rem 1rem; border: none; border-radius: 6px; background: transparent; color: #94a3b8; cursor: pointer; font-weight: 600; transition: all .2s; }
.tabs button.active { background: #38bdf8; color: #0f172a; }

.loading { color: #94a3b8; }

/* Tabelas */
.tbl { width: 100%; border-collapse: collapse; }
.tbl th { color: #94a3b8; font-size: .8rem; text-align: left; padding: .5rem .75rem; border-bottom: 1px solid #334155; }
.tbl td { color: #f1f5f9; padding: .65rem .75rem; border-bottom: 1px solid #1e293b; font-size: .9rem; }
.empty { text-align: center; color: #64748b; padding: 2rem !important; }
.badge-ok { color: #4ade80; font-size: .82rem; }

/* Botões */
.btn-primary { background: #38bdf8; color: #0f172a; border: none; border-radius: 8px; padding: .55rem 1.1rem; font-weight: 700; cursor: pointer; }
.btn-ghost   { background: transparent; color: #94a3b8; border: 1px solid #334155; border-radius: 8px; padding: .55rem 1.1rem; cursor: pointer; }
.btn-sm { padding: .25rem .65rem; border-radius: 6px; border: none; cursor: pointer; font-size: .82rem; font-weight: 600; }
.btn-ok { background: #38bdf8; color: #0f172a; }

/* Modal & Formatórios */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 50; }
.modal { background: #1e293b; border-radius: 12px; padding: 2rem; width: 100%; max-width: 420px; }
.modal h3 { color: #f1f5f9; margin-bottom: 1rem; }
.field { margin-bottom: .9rem; }
.field label { display: block; color: #94a3b8; font-size: .82rem; margin-bottom: .3rem; }
.field input, .field select { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: .6rem .85rem; color: #f1f5f9; box-sizing: border-box; }
.modal-btns { display: flex; gap: .75rem; justify-content: flex-end; margin-top: 1rem; }
.erro { color: #f87171; font-size: .85rem; }
</style>