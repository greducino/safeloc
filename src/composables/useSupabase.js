import { createClient } from '@supabase/supabase-js'
import { ref, computed } from 'vue'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper para tratar erros automaticamente
const handle = async (promise) => {
  const { data, error } = await promise
  if (error) {
    console.error('Erro no Supabase:', error.message)
    throw error
  }
  return data
}

// ─── AUTH & PERMISSÕES ───────────────────────────────────────────────────
export function useAuth() {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(false)

  const isAdmin = computed(() => 
    user.value?.email === 'gabrielreducinodasilva@gmail.com' || 
    profile.value?.role === 'admin'
  )
  
  const isFuncionario = computed(() => 
    profile.value?.role === 'funcionario' || isAdmin.value
  )
  
  const isAluno = computed(() => 
    profile.value?.role === 'aluno'
  )

  async function getCurrentUser() {
    loading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user ?? null

      if (user.value) {
        profile.value = await handle(
          supabase.from('profiles').select('*').eq('id', user.value.id).maybeSingle()
        )
      }
      return { user: user.value, profile: profile.value, isAdmin: isAdmin.value, isFuncionario: isFuncionario.value, isAluno: isAluno.value }
    } finally { 
      loading.value = false 
    }
  }

  // Função de Login ajustada para lançar erro capturável pelo try/catch
  const login = async (email, password) => {
    loading.value = true
    try {
      const data = await handle(supabase.auth.signInWithPassword({ email, password }))
      return { ok: true, data }
    } catch (err) {
      return { ok: false, message: err.message }
    } finally {
      loading.value = false
    }
  }
  
  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  async function registrar(email, password, role = 'aluno', dadosExtras = {}) {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, ...dadosExtras }
        }
      })
      if (error) throw error
      return { ok: true, data }
    } catch (err) {
      return { ok: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  return { 
    user, profile, loading, 
    isAdmin, isFuncionario, isAluno, 
    getCurrentUser, login, logout, 
    registrar, 
    registrarAluno: registrar // Atalho para manter compatibilidade
  }
}

// ─── GESTÃO DE EPIs ───────────────────────────────────────────────────────────
export function useEpis() {
  const epis = ref([])
  const loading = ref(false)

  const listarEpis = async (filtros = {}) => {
    loading.value = true
    try {
      let q = supabase.from('epi').select('*').order('nome')
      if (filtros.busca) q = q.ilike('nome', `%${filtros.busca}%`)
      if (filtros.tipo) q = q.eq('tipo', filtros.tipo)
      const data = await handle(q)
      epis.value = data.map(e => ({
        ...e,
        disponivel: e.quantidade > 0 && e.ativo
      }))
    } finally { loading.value = false }
  }

  return { 
    epis, loading, listarEpis, 
    criarEpi: (d) => handle(supabase.from('epi').insert([d])),
    atualizarEpi: (id, d) => handle(supabase.from('epi').update(d).eq('id', id)),
    deletarEpi: (id) => handle(supabase.from('epi').delete().eq('id', id))
  }
}

// ─── UPLOAD DE IMAGEM ────────────────────────────────────────────────────────
export async function uploadImagemEpi(file) {
  const fileName = `${Date.now()}-${file.name}`
  await handle(supabase.storage.from('epis-imagens').upload(fileName, file))
  const { data } = supabase.storage.from('epis-imagens').getPublicUrl(fileName)
  return data.publicUrl
}

// ─── FUNCIONÁRIOS ─────────────────────────────────────────────────────────────
export function useFuncionarios() {
  const funcionarios = ref([])
  const loading = ref(false)

  const listarFuncionarios = async (busca = '') => {
    loading.value = true
    try {
      let q = supabase.from('funcionario').select('*').order('nome')
      if (busca) q = q.or(`nome.ilike.%${busca}%,cpf.ilike.%${busca}%`)
      funcionarios.value = await handle(q)
    } finally { loading.value = false }
  }

  return { 
    funcionarios, loading, listarFuncionarios,
    criarFuncionario: (d) => handle(supabase.from('funcionario').insert([d])),
    atualizarFuncionario: (id, d) => handle(supabase.from('funcionario').update(d).eq('id', id)),
    deletarFuncionario: (id) => handle(supabase.from('funcionario').delete().eq('id', id))
  }
}

// ─── SOLICITAÇÕES ─────────────────────────────────────────────────────────────
export function useLocacoes() {
  const locacoes = ref([])
  const loading = ref(false)

  const listarLocacoes = async () => {
    loading.value = true
    try {
      locacoes.value = await handle(
        supabase.from('solicitacoes').select(`*, epi (nome, foto), aluno (nome, sobrenome)`).order('data_solicitacao', { ascending: false })
      )
    } finally { loading.value = false }
  }
  return { locacoes, loading, listarLocacoes, criarLocacao: (l) => handle(supabase.from('solicitacoes').insert([l])) }
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export function useDashboard() {
  const stats = ref({ totalEpis: 0, totalAlunos: 0, pendentes: 0 })
  const carregarDashboard = async () => {
    const { count: epis } = await supabase.from('epi').select('*', { count: 'exact', head: true })
    const { count: alunos } = await supabase.from('aluno').select('*', { count: 'exact', head: true })
    const { count: pendentes } = await supabase.from('solicitacoes').select('*', { count: 'exact', head: true }).eq('status', 'pendente')
    stats.value = { totalEpis: epis || 0, totalAlunos: alunos || 0, pendentes: pendentes || 0 }
  }
  return { stats, carregarDashboard }
}

export function useSupabase() { return { supabase } }