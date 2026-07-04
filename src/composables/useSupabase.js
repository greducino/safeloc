import { createClient } from '@supabase/supabase-js'
import { ref, computed } from 'vue'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Singleton — um único cliente
let _instance = null
export const supabase = (() => {
  if (!_instance) {
    _instance = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: true, detectSessionInUrl: true }
    })
  }
  return _instance
})()

const ADMIN_EMAIL = 'safeloc00@gmail.com'

export const handle = async (promise) => {
  const { data, error } = await promise
  if (error) { console.error('Supabase error:', error.message); throw error }
  return data
}

export async function waitForSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const user    = ref(null)
  const profile = ref(null)
  const loading = ref(false)

  const isAdmin       = computed(() => user.value?.email === ADMIN_EMAIL)
  const isFuncionario = computed(() => profile.value?.role === 'funcionario' || isAdmin.value)
  const isAluno       = computed(() => profile.value?.role === 'aluno')

  async function getCurrentUser() {
    loading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user ?? null
      if (!user.value) { profile.value = null; return { user: null, profile: null } }

      if (user.value.email === ADMIN_EMAIL) {
  profile.value = { nome: 'Administrador', email: ADMIN_EMAIL, role: 'admin' }
  // Garanta que este return envie exatamente as computadas locais corretas
  return { user: user.value, profile: profile.value, isAdmin: true, isFuncionario: true, isAluno: false }
}

      const role = user.value.user_metadata?.role
      if (role === 'funcionario') {
        const { data } = await supabase.from('funcionario').select('*').eq('auth_id', user.value.id).maybeSingle()
        profile.value = data ? { ...data, role: 'funcionario' } : { role: 'funcionario' }
      } else if (role === 'aluno') {
        const { data } = await supabase.from('aluno').select('*').eq('auth_id', user.value.id).maybeSingle()
        profile.value = data ? { ...data, role: 'aluno' } : { role: 'aluno' }
      } else {
        const { data: func } = await supabase.from('funcionario').select('*').eq('auth_id', user.value.id).maybeSingle()
        if (func) { profile.value = { ...func, role: 'funcionario' } }
        else {
          const { data: al } = await supabase.from('aluno').select('*').eq('auth_id', user.value.id).maybeSingle()
          profile.value = al ? { ...al, role: 'aluno' } : null
        }
      }

      return { user: user.value, profile: profile.value, isAdmin: isAdmin.value, isFuncionario: isFuncionario.value, isAluno: isAluno.value }
    } finally { loading.value = false }
  }

  const login = async (email, password) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return { ok: true, data }
    } catch (err) {
      return { ok: false, message: err.message }
    } finally { loading.value = false }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null; profile.value = null
  }

  async function registrarAluno(dados) {
    loading.value = true
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dados.email, password: dados.password,
        options: { data: { role: 'aluno', nome: dados.nome ?? '', sobrenome: dados.sobrenome ?? '', ra: dados.ra ?? '' } }
      })
      if (authError) throw authError
      await new Promise(r => setTimeout(r, 800))
      const { data: jaExiste } = await supabase.from('aluno').select('idaluno').eq('auth_id', authData.user.id).maybeSingle()
      if (!jaExiste) {
        const { error: e } = await supabase.from('aluno').insert([{
          auth_id: authData.user.id, nome: dados.nome ?? 'Sem nome',
          sobrenome: dados.sobrenome ?? '', ra: dados.ra ?? '', email: dados.email,
        }])
        if (e && !e.message.includes('duplicate')) throw e
      }
      return { ok: true, data: authData }
    } catch (err) { return { ok: false, message: err.message } }
    finally { loading.value = false }
  }

  async function registrarFuncionario(dados) {
    loading.value = true
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dados.email, password: dados.password,
        options: { data: { role: 'funcionario', nome: dados.nome ?? '', sobrenome: dados.sobrenome ?? '', cpf: dados.cpf ?? '', funcao: dados.funcao ?? '' } }
      })
      if (authError) throw authError
      await new Promise(r => setTimeout(r, 800))
      const { data: jaExiste } = await supabase.from('funcionario').select('idfuncionario').eq('auth_id', authData.user.id).maybeSingle()
      if (!jaExiste) {
        const { error: e } = await supabase.from('funcionario').insert([{
          auth_id: authData.user.id, nome: dados.nome ?? 'Sem nome', sobrenome: dados.sobrenome ?? '',
          cpf: dados.cpf ?? '', email: dados.email, funcao: dados.funcao ?? 'Não informado',
        }])
        if (e && !e.message.includes('duplicate')) throw e
      }
      return { ok: true }
    } catch (err) { return { ok: false, message: err.message } }
    finally { loading.value = false }
  }

  return { user, profile, loading, isAdmin, isFuncionario, isAluno, getCurrentUser, login, logout, registrarAluno, registrarFuncionario }
}

// ─── EPIs ─────────────────────────────────────────────────────────────────────
export function useEpis() {
  const epis = ref([]); const loading = ref(false)
  const listarEpis = async (filtros = {}) => {
    loading.value = true
    try {
      let q = supabase.from('epi').select('*').order('nome')
      if (filtros.busca) q = q.ilike('nome', `%${filtros.busca}%`)
      if (filtros.tipo)  q = q.eq('tipo', filtros.tipo)
      const data = await handle(q)
      epis.value = data.map(e => ({ ...e, disponivel: e.quantidade > 0 && e.ativo }))
    } finally { loading.value = false }
  }
  return {
    epis, loading, listarEpis,
    criarEpi:     async (d)     => handle(supabase.from('epi').insert([d])),
    atualizarEpi: async (id, d) => handle(supabase.from('epi').update(d).eq('idepi', id)),
    deletarEpi:   async (id)    => handle(supabase.from('epi').delete().eq('idepi', id)),
  }
}

// ─── UPLOAD ───────────────────────────────────────────────────────────────────
export async function uploadImagemEpi(file) {
  const fileName = `${Date.now()}-${file.name}`
  await handle(supabase.storage.from('epis-imagens').upload(fileName, file))
  const { data } = supabase.storage.from('epis-imagens').getPublicUrl(fileName)
  if (data?.publicUrl) return data.publicUrl
  const { data: signed, error } = await supabase.storage.from('epis-imagens').createSignedUrl(fileName, 60)
  if (error) throw error
  return signed.signedUrl
}

// ─── FUNCIONÁRIOS ─────────────────────────────────────────────────────────────
export function useFuncionarios() {
  const funcionarios = ref([]); const loading = ref(false)
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
    criarFuncionario:     async (d)     => handle(supabase.from('funcionario').insert([d])),
    atualizarFuncionario: async (id, d) => handle(supabase.from('funcionario').update(d).eq('idfuncionario', id)),
    deletarFuncionario:   async (id)    => handle(supabase.from('funcionario').delete().eq('idfuncionario', id)),
  }
}

// ─── ALUNOS ───────────────────────────────────────────────────────────────────
export function useAlunos() {
  const alunos = ref([]); const loading = ref(false)
  const listarAlunos = async (busca = '') => {
    loading.value = true
    try {
      let q = supabase.from('aluno').select('*').order('nome')
      if (busca) q = q.or(`nome.ilike.%${busca}%,ra.ilike.%${busca}%`)
      alunos.value = await handle(q)
    } finally { loading.value = false }
  }
  return {
    alunos, loading, listarAlunos,
    criarAluno:     async (d)     => handle(supabase.from('aluno').insert([d])),
    atualizarAluno: async (id, d) => handle(supabase.from('aluno').update(d).eq('idaluno', id)),
    deletarAluno:   async (id)    => handle(supabase.from('aluno').delete().eq('idaluno', id)),
  }
}

// ─── LOCAÇÕES ────────────────────────────────────────────────────────────────
export function useLocacoes() {
  const locacoes = ref([]); const loading = ref(false)
  const listarLocacoes = async () => {
    loading.value = true
    try {
      locacoes.value = await handle(
        supabase.from('solicitacoes')
          .select('*, epi(nome,foto), aluno(nome,sobrenome)')
          .order('data_solicitacao', { ascending: false })
      )
    } finally { loading.value = false }
  }
  return {
    locacoes, loading, listarLocacoes,
    criarLocacao:     async (l)     => handle(supabase.from('solicitacoes').insert([l])),
    atualizarLocacao: async (id, d) => handle(supabase.from('solicitacoes').update(d).eq('idsolicitacao', id)),
  }
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export function useDashboard() {
  const stats = ref({ totalEpis: 0, episDisponiveis: 0, episIndisponiveis: 0, pendentes: 0, totalFuncionarios: 0, totalAlunos: 0 })
  const carregarDashboard = async () => {
    const [
      { count: totalEpis }, { count: episDisp }, { count: pendentes },
      { count: totalFunc }, { count: totalAlunos },
    ] = await Promise.all([
      supabase.from('epi').select('*', { count: 'exact', head: true }),
      supabase.from('epi').select('*', { count: 'exact', head: true }).eq('disponivel', true),
      supabase.from('solicitacoes').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
      supabase.from('funcionario').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
      supabase.from('aluno').select('*', { count: 'exact', head: true }),
    ])
    const total = totalEpis ?? 0; const disp = episDisp ?? 0
    stats.value = { totalEpis: total, episDisponiveis: disp, episIndisponiveis: total - disp, pendentes: pendentes ?? 0, totalFuncionarios: totalFunc ?? 0, totalAlunos: totalAlunos ?? 0 }
  }
  return { stats, carregarDashboard }
}

export function useSupabase() { return { supabase } }