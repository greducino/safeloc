<template>
  <div>
    <MenuNav />
    <div class="app-layout">
      <Sidebar />
      <main class="main-content">
        <div class="page-header">
          <h1>🦺 Gestão de EPIs</h1>
          <button class="btn btn-primary" @click="abrirModal()">+ Novo EPI</button>
        </div>

        <div class="filters card">
          <input v-model="busca" type="text" placeholder="🔍 Buscar por nome..." class="filter-input" @input="filtrar" />
          <select v-model="filtroCategoria" @change="filtrar" class="filter-input">
            <option value="">Todas as categorias (Tipos)</option>
            <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          </div>

        <div v-if="loading" class="loading">Carregando EPIs...</div>
        <div v-else-if="epis.length === 0" class="empty-state card">Nenhum EPI encontrado.</div>

        <div v-else class="epis-grid">
          <div v-for="epi in epis" :key="epi.idepi" class="epi-card">
            <div class="epi-img-wrap">
              <img v-if="epi.foto" :src="epi.foto" :alt="epi.nome" />
              <div v-else class="epi-placeholder">🦺</div>
              <span class="epi-status" :class="epi.disponivel ? 'available' : 'unavailable'">
                {{ epi.disponivel ? 'Disponível' : 'Indisponível' }}
              </span>
            </div>
            <div class="epi-info">
              <h3>{{ epi.nome }}</h3>
              <p class="epi-cat">{{ epi.tipo }}</p>
              <p class="epi-desc">{{ epi.descricao }}</p>
              <p class="epi-qty">Quantidade Total: <strong>{{ epi.quantidade }}</strong></p>
              <p v-if="epi.codigo_patrimonio" class="epi-ca">Cód. Patrimônio: {{ epi.codigo_patrimonio }}</p>
              <p v-if="epi.data_validade" class="epi-validade" :class="isVencido(epi.data_validade) ? 'vencido' : 'vigente'">
                📅 Validade: {{ formatarData(epi.data_validade) }}
              </p>
              
              <div class="epi-actions">
                <button class="btn btn-dark btn-sm" @click="abrirModal(epi)">✏️ Editar</button>
                <button class="btn btn-danger btn-sm" @click="confirmarDelete(epi)">🗑️</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="modalAberto" class="modal-overlay" @click.self="modalAberto = false">
          <div class="modal">
            <div class="modal-header">
              <h2>{{ editando ? 'Editar EPI' : 'Novo EPI' }}</h2>
              <button class="modal-close" @click="modalAberto = false">✕</button>
            </div>
            <div v-if="erroModal" class="alert alert-error">{{ erroModal }}</div>
            
            <form @submit.prevent="salvarEpi">
              <div class="form-group">
                <label>Nome do EPI *</label>
                <input v-model="form.nome" required placeholder="Ex: Capacete de Segurança" />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Tipo (Categoria) *</label>
                  <select v-model="form.tipo" required>
                    <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Cód. Patrimônio / CA</label>
                  <input v-model="form.codigo_patrimonio" placeholder="Ex: 12345" />
                </div>
              </div>

              <div class="form-group">
                <label>Descrição</label>
                <textarea v-model="form.descricao" rows="3" placeholder="Descreva o equipamento..."></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Quantidade</label>
                  <input v-model.number="form.quantidade" type="number" min="0" required />
                </div>
                <div class="form-group">
                  <label>Ativo no Sistema?</label>
                  <select v-model="form.ativo">
                    <option :value="true">Sim</option>
                    <option :value="false">Não</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Imagem do EPI</label>
                <div class="img-upload-wrap">
                  <img v-if="previewImg" :src="previewImg" class="img-preview" />
                  <label class="upload-btn">
                    📷 {{ previewImg ? 'Trocar imagem' : 'Escolher imagem' }}
                    <input type="file" accept="image/*" @change="onFileChange" hidden />
                  </label>
                </div>
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn btn-outline-dark" @click="modalAberto = false">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="salvando">
                  {{ salvando ? 'Salvando...' : 'Salvar' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div v-if="deleteModal" class="modal-overlay" @click.self="deleteModal = false">
          <div class="modal" style="max-width:380px">
            <h2 style="color:var(--danger); margin-bottom:12px">⚠️ Confirmar exclusão</h2>
            <p>Tem certeza que deseja excluir <strong>{{ epiParaDeletar?.nome }}</strong>?</p>
            <div class="modal-actions" style="margin-top:20px">
              <button class="btn btn-outline-dark" @click="deleteModal = false">Cancelar</button>
              <button class="btn btn-danger" @click="deletarEpiConfirm" :disabled="salvando">Excluir</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MenuNav from '@/components/menu.vue'
import Sidebar from '@/components/sidebar.vue'
// Importa o composable que você criou
import { useEpis, uploadImagemEpi, useAuth } from '@/composables/useSupabase.js'

const route = useRoute()
const { epis, loading, listarEpis, criarEpi, atualizarEpi, deletarEpi } = useEpis()
const { getCurrentUser } = useAuth()

const categorias = ['Capacete', 'Luvas', 'Respirador', 'Óculos de Proteção', 'Bota de Segurança', 'Proteção Auricular', 'Cinto de Segurança', 'Protetor Facial', 'Outros']

const busca = ref('')
const filtroCategoria = ref(route.query.categoria || '')

const modalAberto = ref(false)
const editando = ref(null)
const salvando = ref(false)
const erroModal = ref('')
const deleteModal = ref(false)
const epiParaDeletar = ref(null)

const arquivoImagem = ref(null)
const previewImg = ref('')

// Objeto alinhado EXATAMENTE com as colunas do seu DB
const form = ref({
  nome: '',
  tipo: 'Capacete',
  descricao: '',
  codigo_patrimonio: '',
  data_validade: '',
  quantidade: 1,
  ativo: true,
  foto: ''
})

onMounted(async () => {
  try {
    await getCurrentUser()
  } catch (err) {
    console.warn('Falha ao carregar o perfil:', err.message)
  }
  filtrar()
})

function filtrar() {
  // O seu listarEpis aceita um objeto { busca, tipo }
  listarEpis({
    busca: busca.value,
    tipo: filtroCategoria.value || undefined
  })
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  arquivoImagem.value = file
  previewImg.value = URL.createObjectURL(file)
}

function formatarData(data) {
  if (!data) return '—'
  const d = new Date(data)
  return d.toLocaleDateString('pt-BR')
}

function isVencido(data) {
  if (!data) return false
  return new Date(data) < new Date()
}

function abrirModal(epi = null) {
  editando.value = epi
  erroModal.value = ''
  arquivoImagem.value = null

  if (epi) {
    // Preenche o form com os dados do banco
    form.value = {
      nome: epi.nome,
      tipo: epi.tipo,
      descricao: epi.descricao || '',
      codigo_patrimonio: epi.codigo_patrimonio || '',
      data_validade: epi.data_validade || '',
      quantidade: epi.quantidade ?? 0,
      ativo: epi.ativo ?? true,
      foto: epi.foto || ''
    }
    previewImg.value = epi.foto || ''
  } else {
    // Reseta o form para um novo cadastro
    form.value = { 
      nome: '', 
      tipo: 'Capacete', 
      descricao: '', 
      codigo_patrimonio: '',
      data_validade: '',
      quantidade: 1, 
      ativo: true, 
      foto: '' 
    }
    previewImg.value = ''
  }
  modalAberto.value = true
}

async function salvarEpi() {
  salvando.value = true
  erroModal.value = ''

  try {
    if (arquivoImagem.value) {
      form.value.foto = await uploadImagemEpi(arquivoImagem.value)
    }

    const dadosParaSalvar = { ...form.value }
    if (dadosParaSalvar.data_validade === '') {
      dadosParaSalvar.data_validade = null 
    }
    if (editando.value) {
      await atualizarEpi(editando.value.idepi, dadosParaSalvar)
    } else {
      await criarEpi(dadosParaSalvar)
    }

    modalAberto.value = false
    filtrar()
  } catch (e) {
    erroModal.value = e.message || 'Erro ao salvar EPI'
  } finally {
    salvando.value = false
  }
}

function confirmarDelete(epi) {
  epiParaDeletar.value = epi
  deleteModal.value = true
}

async function deletarEpiConfirm() {
  salvando.value = true
  try {
    // Passa o ID correto para a função do seu composable
    await deletarEpi(epiParaDeletar.value.idepi)
    deleteModal.value = false
    filtrar() // Recarrega a lista
  } catch (e) {
    alert('Erro ao excluir: ' + e.message)
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.app-layout { display: flex; flex-direction: row; } 
.filters { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; padding: 16px; }
.filter-input { padding: 9px 12px; border: 1.5px solid var(--gray-200); border-radius: 8px; font-size: 0.88rem; flex: 1; min-width: 160px; }
.epis-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
.epi-card { background: var(--white); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; transition: box-shadow 0.2s; }
.epi-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.epi-img-wrap { position: relative; height: 160px; background: #f3f4f6; }
.epi-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
.epi-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; }
.epi-status { position: absolute; top: 10px; right: 10px; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
.epi-status.available { background: #dcfce7; color: #166534; }
.epi-status.unavailable { background: #fee2e2; color: #991b1b; }
.epi-info { padding: 16px; }
.epi-info h3 { font-size: 1rem; color: #1f2937; margin-bottom: 4px; }
.epi-cat { font-size: 0.78rem; color: #4f46e5; font-weight: 600; margin-bottom: 6px; }
.epi-desc { font-size: 0.82rem; color: #4b5563; margin-bottom: 8px; line-height: 1.5; }
.epi-qty { font-size: 0.82rem; color: #4b5563; margin-bottom: 4px; }
.epi-ca { font-size: 0.78rem; color: #6b7280; margin-bottom: 8px; }
.epi-validade { font-size: 0.78rem; margin-bottom: 12px; font-weight: 600; }
.epi-validade.vigente { color: #059669; }
.epi-validade.vencido { color: #dc2626; font-weight: 700; }
.epi-actions { display: flex; gap: 8px; }
.empty-state { text-align: center; padding: 40px; color: #9ca3af; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 0.88rem; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.btn-outline-dark { background: none; border: 1.5px solid #d1d5db; color: #4b5563; padding: 8px 16px; border-radius: 6px; cursor: pointer;}
.btn-outline-dark:hover { background: #f3f4f6; }
.btn-primary { background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.btn-danger { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.img-upload-wrap { display: flex; flex-direction: column; gap: 8px; }
.img-preview { width: 100%; max-height: 160px; object-fit: cover; border-radius: 8px; border: 1.5px solid #d1d5db; }
.upload-btn { display: inline-block; cursor: pointer; padding: 9px 16px; background: #f3f4f6; border: 1.5px dashed #9ca3af; border-radius: 8px; font-size: 0.88rem; font-weight: 600; color: #4b5563; text-align: center; }
.upload-btn:hover { background: #e5e7eb; }

/* Modal Overlay base style */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal { background: white; padding: 24px; border-radius: 8px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; }
</style>