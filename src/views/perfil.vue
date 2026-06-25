<template>
  <div class="page">
    <h2 class="page-title">Meu Perfil</h2>

    <div v-if="!profile" class="loading">Carregando…</div>

    <div v-else class="card-perfil">
      <div class="avatar">{{ iniciais }}</div>
      <div class="info-bloco">
        <p class="nome-completo">{{ profile.nome }} {{ profile.sobrenome }}</p>
        <p class="role-badge">{{ role === 'funcionario' ? '🔧 Funcionário' : '🎓 Aluno' }}</p>
        <p class="email">{{ user?.email }}</p>
      </div>

      <form @submit.prevent="salvar" class="form-perfil">
        <div class="row2">
          <div class="field"><label>Nome</label>
            <input v-model="form.nome" required /></div>
          <div class="field"><label>Sobrenome</label>
            <input v-model="form.sobrenome" required /></div>
        </div>
        <div class="field"><label>CPF</label>
          <input v-model="form.cpf" maxlength="14" /></div>
        <div class="field"><label>Telefone</label>
          <input v-model="form.telefone" /></div>
        <div class="field"><label>Data de Nascimento</label>
          <input v-model="form.data_nascimento" type="date" /></div>
        <div v-if="role === 'funcionario'" class="field"><label>Função</label>
          <input v-model="form.funcao" /></div>

        <p v-if="sucesso" class="sucesso">{{ sucesso }}</p>
        <p v-if="erro" class="erro">{{ erro }}</p>

        <div class="form-btns">
          <button type="submit" class="btn-primary" :disabled="salvando">
            {{ salvando ? 'Salvando…' : 'Salvar Alterações' }}
          </button>
          <button type="button" class="btn-danger" @click="handleLogout">Sair</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useSupabase.js'

const router = useRouter()
const { user, profile, role, atualizarPerfil, logout } = useAuth()

const salvando = ref(false)
const sucesso  = ref('')
const erro     = ref('')

const form = ref({
  nome: '', sobrenome: '', cpf: '', telefone: '', data_nascimento: '', funcao: ''
})

const iniciais = computed(() => {
  if (!profile.value) return '?'
  return (profile.value.nome?.[0] ?? '') + (profile.value.sobrenome?.[0] ?? '')
})

onMounted(() => preencherForm())
watch(profile, preencherForm)

function preencherForm() {
  if (!profile.value) return
  form.value = {
    nome:            profile.value.nome           ?? '',
    sobrenome:       profile.value.sobrenome       ?? '',
    cpf:             profile.value.cpf             ?? '',
    telefone:        profile.value.telefone        ?? '',
    data_nascimento: profile.value.data_nascimento?.slice(0, 10) ?? '',
    funcao:          profile.value.funcao          ?? '',
  }
}

async function salvar() {
  salvando.value = true
  sucesso.value  = ''
  erro.value     = ''
  const campos = {
    nome: form.value.nome,
    sobrenome: form.value.sobrenome,
    cpf: form.value.cpf,
    telefone: form.value.telefone,
    data_nascimento: form.value.data_nascimento || null,
    ...(role.value === 'funcionario' ? { funcao: form.value.funcao } : {})
  }
  const res = await atualizarPerfil(campos)
  salvando.value = false
  if (res.ok) sucesso.value = 'Perfil atualizado com sucesso!'
  else erro.value = res.message
}

async function handleLogout() {
  await logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.page { padding: 1.5rem; max-width: 600px; margin: 0 auto; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1.5rem; }
.loading { color: #94a3b8; }
.card-perfil { background: #1e293b; border-radius: 12px; padding: 2rem; }
.avatar { width: 72px; height: 72px; border-radius: 50%; background: #38bdf8; color: #0f172a; font-size: 1.6rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; text-transform: uppercase; }
.info-bloco { margin-bottom: 1.5rem; }
.nome-completo { color: #f1f5f9; font-size: 1.2rem; font-weight: 700; }
.role-badge { color: #94a3b8; font-size: .85rem; margin-top: .25rem; }
.email { color: #64748b; font-size: .82rem; margin-top: .15rem; }
.form-perfil { display: flex; flex-direction: column; gap: 0; }
.field { margin-bottom: .9rem; }
.field label { display: block; color: #94a3b8; font-size: .82rem; margin-bottom: .3rem; }
.field input { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: .6rem .85rem; color: #f1f5f9; box-sizing: border-box; }
.field input:focus { outline: none; border-color: #38bdf8; }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.form-btns { display: flex; gap: .75rem; margin-top: 1rem; flex-wrap: wrap; }
.btn-primary { background: #38bdf8; color: #0f172a; border: none; border-radius: 8px; padding: .65rem 1.4rem; font-weight: 700; cursor: pointer; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.btn-danger  { background: #ef4444; color: #fff; border: none; border-radius: 8px; padding: .65rem 1.4rem; font-weight: 700; cursor: pointer; }
.sucesso { color: #4ade80; font-size: .85rem; }
.erro    { color: #f87171; font-size: .85rem; }
</style>