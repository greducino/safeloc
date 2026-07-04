<template>
  <MenuNav />
   <div class="layout-container">
    <header class="header-section flex-between">
      <div>
        <h1>Controle de Estoque</h1>
        <p>Gerencie o saldo e a disponibilidade de cada EPI.</p>
      </div>
      <button class="btn btn-outline flex-center" @click="carregar" :disabled="loading">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 8px;">
          <path d="M23 4v6h-6M1 20v-6h6" />
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </svg> 
        Atualizar 
      </button>
    </header> 
    
    <div class="card-form">
      <div class="card-header">
        <h2>Ajustar Quantidade</h2>
      </div>
      <div class="main-form">
        <div class="form-row">
          <div class="form-group">
            <label>EPI</label>
            <select v-model="form.epi_id" class="custom-select">
              <option value="">Selecione um EPI...</option>
              <option v-for="epi in epis" :key="epi.id" :value="epi.id"> 
                {{ epi.nome }} (Atual: {{ epi.quantidade }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Nova Quantidade em Estoque</label>
            <input type="number" v-model.number="form.quantidade" min="0" placeholder="0" />
          </div>
        </div>
        <div class="action-bar">
          <button class="btn btn-primary" @click="atualizar" :disabled="!form.epi_id || loading">
            Salvar Alteração 
          </button>
        </div>
        <p class="error-msg" v-if="erro">⚠ {{ erro }}</p>
        <p class="success-msg" v-if="ok">✓ Estoque atualizado com sucesso!</p>
      </div>
    </div> 
    
    <div class="card-table">
      <div class="card-header flex-between">
        <h2>Itens em Estoque</h2> 
        <span class="badge badge-blue">{{ epis.length }} itens catalogados</span>
      </div>
      
      <div v-if="loading" class="text-center" style="padding: 40px;">
        <div class="spinner"></div> Carregando estoque...
      </div>
      
      <div v-else class="table-container">
        <table class="styled-table">
          <thead>
            <tr>
              <th>EPI / CA</th>
              <th>Categoria</th>
              <th>Descrição</th>
              <th>Quantidade</th>
              <th class="text-center">Situação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="epi in epis" :key="epi.id">
              <td>
                <div class="text-bold">{{ epi.nome }}</div>
                <div class="cargo-text">CA: {{ epi.ca || '—' }}</div>
              </td>
              <td class="cargo-text">{{ epi.categoria }}</td>
              <td class="cargo-text">{{ epi.descricao || '—' }}</td>
              <td>
                <span class="text-bold" style="font-family: monospace; font-size: 1.1rem;"> 
                  {{ epi.quantidade }}
                </span>
              </td>
              <td class="text-center">
                <span :class="badgeClass(epi.quantidade)"> 
                  {{ epi.quantidade === 0 ? 'Sem estoque' : epi.quantidade < 5 ? 'Estoque Baixo' : 'Estoque OK' }} 
                </span>
              </td>
            </tr>
            <tr v-if="epis.length === 0">
              <td colspan="5" class="text-center cargo-text" style="padding: 40px;"> 
                Nenhum item encontrado no estoque.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useEpis } from '@/composables/useSupabase.js'
import MenuNav from '@/components/menu.vue'
import Sidebar from '@/components/sidebar.vue'

const { epis, loading, listarEpis, atualizarEpi } = useEpis() 

const erro = ref('') 
const ok = ref(false) 
const form = ref({ epi_id: '', quantidade: 0 }) 

async function carregar() {
  erro.value = ''
  ok.value = false
  await listarEpis() 
} 

// Função que estava cortada
async function atualizar() {
  erro.value = ''
  ok.value = false
  
  try {
    await atualizarEpi(form.value.epi_id, form.value.quantidade)
    ok.value = true
    
    // Reseta o formulário
    form.value = { epi_id: '', quantidade: 0 }
    
    // Atualiza a listagem na tabela
    await carregar()
    
    // Some com a mensagem de sucesso depois de 3 segundos
    setTimeout(() => {
      ok.value = false
    }, 3000)
    
  } catch (error) {
    erro.value = 'Ocorreu um erro ao atualizar a quantidade.'
    console.error(error)
  }
}

// Função auxiliar para as cores da badge da tabela
function badgeClass(quantidade) {
  if (quantidade === 0) return 'badge badge-danger'
  if (quantidade < 5) return 'badge badge-warn'
  return 'badge badge-ok'
}

// Carrega os dados quando o componente é montado
onMounted(() => {
  carregar()
})
</script>

<style scoped>
.layout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 20px 20px 20px;
  font-family: sans-serif;
  background: #ffffff;
  min-height: 100vh;
}

.header-section {
  margin-bottom: 20px;
  margin-top: 0;
}

.header-section h1 {
  margin-top: 0;
  padding-top: 0;
  font-size: 1.8rem;
}

.header-section p {
  margin-top: -5px;
  color: #64748b;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-center {
  display: flex;
  align-items: center;
}

.card-form,
.card-table {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-header h2 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #475569;
}

input,
select {
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-family: inherit;
}

.action-bar {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
  font-family: inherit;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  color: #374151;
  border: 1px solid #cbd5e1;
}

.btn-outline:hover {
  background: #f8fafc;
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-msg {
  font-size: 13px;
  color: #dc2626;
  margin-top: 10px;
}

.success-msg {
  font-size: 13px;
  color: #16a34a;
  margin-top: 10px;
}

.table-container {
  overflow-x: auto;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.styled-table th {
  background: #f8fafc;
  padding: 12px;
  text-align: left;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 1px solid #edf2f7;
}

.styled-table td {
  padding: 12px;
  border-top: 1px solid #f1f5f9;
  font-size: 0.9rem;
}

.styled-table tbody tr:hover {
  background: #f8fafc;
}

.text-bold {
  font-weight: 600;
  color: #1e293b;
}

.cargo-text {
  font-size: 0.82rem;
  color: #64748b;
}

.text-center {
  text-align: center;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: bold;
}

.badge-ok {
  background: #dcfce7;
  color: #166534;
}

.badge-warn {
  background: #fef9c3;
  color: #854d0e;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

.badge-blue {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 20px;
}

.spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>