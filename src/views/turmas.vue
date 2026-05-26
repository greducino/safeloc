<template>
  <div class="p-6 max-w-7xl mx-auto text-slate-100">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Gestão de Turmas</h1>
        <p class="text-sm text-slate-400">Gerencie os horários e os grupos de alunos.</p>
      </div>
      <button @click="abrirModalCadastro"
        class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg">
        <i class="fa-solid fa-users-rectangle"></i> Nova Turma
      </button>
    </div>

    <div class="bg-slate-800 p-4 rounded-xl shadow-sm mb-6 border border-slate-700">
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <i class="fa-solid fa-magnifying-glass"></i>
        </span>
        <input v-model="filtroBusca" type="text" placeholder="Procurar turma pelo nome..."
          class="w-full pl-10 pr-4 py-2 border border-slate-600 rounded-lg bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
    </div>

    <div class="bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-700">
      <div v-if="loading" class="p-12 flex flex-col items-center justify-center text-slate-400">
        <i class="fa-solid fa-spinner fa-spin text-3xl text-emerald-500 mb-4"></i>
        <p>Carregando turmas...</p>
      </div>
      <div v-else-if="turmasFiltradas.length === 0" class="p-12 text-center text-slate-500">
        <i class="fa-solid fa-layer-group text-4xl mb-4 opacity-20"></i>
        <p>Nenhuma turma cadastrada.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-900 border-b border-slate-700 text-slate-300 font-semibold text-sm">
              <th class="p-4">Nome da Turma</th>
              <th class="p-4">Nomenclatura</th>
              <!-- Colunas reais: horario_inicio e horario_termino -->
              <th class="p-4">Horário</th>
              <th class="p-4">Período</th>
              <th class="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700 text-slate-300 text-sm">
            <tr v-for="turma in turmasFiltradas" :key="turma.idturma" class="hover:bg-slate-700/50 transition-colors">
              <td class="p-4 font-bold text-white">{{ turma.nome }}</td>
              <td class="p-4 text-slate-400">{{ turma.nomenclatura || '—' }}</td>
              <td class="p-4">
                <span class="bg-slate-900 px-3 py-1 rounded-full text-xs border border-slate-600">
                  {{ formatarHorario(turma) }}
                </span>
              </td>
              <td class="p-4 text-xs text-slate-400">{{ formatarPeriodo(turma) }}</td>
              <td class="p-4 text-right flex justify-end gap-2">
                <button @click="verAlunosDaTurma(turma)" class="p-2 text-cyan-400 hover:bg-cyan-950/30 rounded-lg transition-colors" title="Ver Alunos">
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button @click="abrirModalEdicao(turma)" class="p-2 text-amber-500 hover:bg-amber-950/30 rounded-lg transition-colors">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button @click="deletarTurmaConfirm(turma.idturma, turma.nome)" class="p-2 text-red-500 hover:bg-red-950/30 rounded-lg transition-colors">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Criar/Editar -->
    <div v-if="modalTurma" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <div class="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 class="text-xl font-bold text-white">{{ editando ? 'Editar Turma' : 'Nova Turma' }}</h2>
          <button @click="modalTurma = false" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <form @submit.prevent="salvarTurma" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-1">Nome da Turma *</label>
            <input v-model="form.nome" type="text" required placeholder="Ex: Engenharia 2024.1"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-white"/>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-1">Nomenclatura</label>
            <input v-model="form.nomenclatura" type="text" placeholder="Ex: ENG-2024"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-white"/>
          </div>
          <!-- horario_inicio e horario_termino (eram campo único 'horario') -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-400 uppercase mb-1">Horário Início</label>
              <input v-model="form.horario_inicio" type="time"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-white"/>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-400 uppercase mb-1">Horário Término</label>
              <input v-model="form.horario_termino" type="time"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-white"/>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-400 uppercase mb-1">Data Início</label>
              <input v-model="form.data_inicio" type="date"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-white"/>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-400 uppercase mb-1">Data Término</label>
              <input v-model="form.data_termino" type="date"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-white"/>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-1">Capacidade Máxima</label>
            <input v-model.number="form.capacidade_maxima" type="number" min="1" placeholder="Ex: 30"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-white"/>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="modalTurma = false" class="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
            <button type="submit" class="bg-emerald-600 px-6 py-2 rounded-lg font-bold text-white hover:bg-emerald-700 transition-all">
              {{ editando ? 'Atualizar' : 'Criar Turma' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Alunos da Turma -->
    <div v-if="modalAlunos" class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div class="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700">
        <div class="p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-white">Alunos da Turma</h2>
            <p class="text-cyan-400 text-sm font-medium">{{ turmaSelecionada?.nome }}</p>
          </div>
          <button @click="modalAlunos = false" class="text-slate-400 hover:text-white">
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        <div class="p-6 overflow-y-auto">
          <div v-if="loadingAlunos" class="text-center py-8">
            <i class="fa-solid fa-spinner fa-spin text-2xl text-cyan-500"></i>
          </div>
          <ul v-else-if="listaAlunosTurma.length > 0" class="space-y-3">
            <li v-for="rel in listaAlunosTurma" :key="rel.aluno?.idaluno"
              class="flex items-center gap-4 bg-slate-900 p-3 rounded-lg border border-slate-700">
              <div class="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold text-cyan-400">
                {{ rel.aluno?.nome?.charAt(0) }}
              </div>
              <div>
                <p class="font-medium text-white">{{ rel.aluno?.nome }} {{ rel.aluno?.sobrenome }}</p>
                <p class="text-xs text-slate-500">CPF: {{ rel.aluno?.cpf }} | {{ rel.aluno?.email }}</p>
              </div>
            </li>
          </ul>
          <p v-else class="text-center text-slate-500 py-8 italic">Nenhum aluno vinculado a esta turma.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/composables/useSupabase.js'

const turmas       = ref([])
const loading      = ref(true)
const loadingAlunos = ref(false)
const filtroBusca  = ref('')
const modalTurma   = ref(false)
const modalAlunos  = ref(false)
const editando     = ref(false)
const idEdicao     = ref(null)
const turmaSelecionada  = ref(null)
const listaAlunosTurma  = ref([])

// Campos alinhados com a tabela 'turma' do banco
const form = ref({
  nome: '',
  nomenclatura: '',
  horario_inicio: '',    // era um único campo 'horario'
  horario_termino: '',   // era um único campo 'horario'
  data_inicio: '',
  data_termino: '',
  capacidade_maxima: null,
})

// Helpers para exibição
function formatarHorario(turma) {
  if (turma.horario_inicio && turma.horario_termino)
    return `${turma.horario_inicio} – ${turma.horario_termino}`
  return turma.horario_inicio || turma.horario_termino || '—'
}

function formatarPeriodo(turma) {
  const inicio  = turma.data_inicio  ? new Date(turma.data_inicio).toLocaleDateString('pt-BR')  : null
  const termino = turma.data_termino ? new Date(turma.data_termino).toLocaleDateString('pt-BR') : null
  if (inicio && termino) return `${inicio} → ${termino}`
  return inicio || '—'
}

const turmasFiltradas = computed(() => {
  const b = filtroBusca.value.toLowerCase()
  return turmas.value.filter(t => t.nome.toLowerCase().includes(b))
})

const buscarTurmas = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.from('turma').select('*').order('nome')
    if (error) throw error
    turmas.value = data
  } catch (e) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}

const abrirModalCadastro = () => {
  editando.value = false
  form.value = { nome: '', nomenclatura: '', horario_inicio: '', horario_termino: '', data_inicio: '', data_termino: '', capacidade_maxima: null }
  modalTurma.value = true
}

const abrirModalEdicao = (turma) => {
  editando.value = true
  idEdicao.value = turma.idturma
  form.value = {
    nome:              turma.nome              || '',
    nomenclatura:      turma.nomenclatura      || '',
    horario_inicio:    turma.horario_inicio    || '',
    horario_termino:   turma.horario_termino   || '',
    data_inicio:       turma.data_inicio       || '',
    data_termino:      turma.data_termino      || '',
    capacidade_maxima: turma.capacidade_maxima || null,
  }
  modalTurma.value = true
}

const salvarTurma = async () => {
  try {
    const payload = { ...form.value }
    // Limpa strings vazias para null (evita violação de constraints)
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
  } catch (e) {
    alert(e.message)
  }
}

const deletarTurmaConfirm = async (id, nome) => {
  if (!confirm(`Excluir a turma "${nome}"?`)) return
  try {
    const { error } = await supabase.from('turma').delete().eq('idturma', id)
    if (error) throw error
    buscarTurmas()
  } catch {
    alert('Erro: verifique se existem alunos vinculados a esta turma.')
  }
}

const verAlunosDaTurma = async (turma) => {
  turmaSelecionada.value = turma
  modalAlunos.value      = true
  loadingAlunos.value    = true
  listaAlunosTurma.value = []
  try {
    // Tabela associativa 'aluno_has_turma' com join em 'aluno'
    const { data, error } = await supabase
      .from('aluno_has_turma')
      .select(`aluno (idaluno, nome, sobrenome, cpf, email)`)
      .eq('turma_id', turma.idturma)
    if (error) throw error
    listaAlunosTurma.value = data
  } catch (e) {
    console.error(e.message)
  } finally {
    loadingAlunos.value = false
  }
}

onMounted(buscarTurmas)
</script>