import { createClient } from '@supabase/supabase-js'
import { ref, computed } from 'vue'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
})

const ADMIN_EMAIL = 'gabrielreducinodasilva@gmail.com'

// Helper para tratar erros automaticamente
export const handle = async (promise) => {
  const { data, error } = await promise
  if (error) {
    console.error('Erro no Supabase:', error.message)
    throw error
  }
  return data
}

// ─── SESSÃO GARANTIDA ─────────────────────────────────────────────────────────
// Aguarda o Supabase restaurar a sessão do localStorage antes de qualquer query.
// Blindado contra erros de leitura do cache.
let _sessionReady = null
export function waitForSession() {
  if (_sessionReady) return _sessionReady
  
  _sessionReady = new Promise((resolve, reject) => {
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Erro ao recuperar sessão:', error.message)
          resolve(null) // Resolve nulo em vez de rejeitar para não quebrar a UI inteira
        } else {
          resolve(session)
        }
      })
      .catch((err) => {
        console.error('Falha crítica no getSession:', err)
        resolve(null)
      })
  })
  
  return _sessionReady
}

// ─── AUTH & PERMISSÕES ────────────────────────────────────────────────────────
export function useAuth() {
  const user    = ref(null)
  const profile = ref(null)
  const loading = ref(false)

  const isAdmin = computed(() =>
    user.value?.email === ADMIN_EMAIL ||
    profile.value?.role === 'admin'
  )
  const isFuncionario = computed(() =>
    profile.value?.role === 'funcionario' || isAdmin.value
  )
  const isAluno = computed(() => profile.value?.role === 'aluno')

  async function getCurrentUser() {
    loading.value = true
    try {
      // Garante que a sessão foi restaurada antes de qualquer coisa
      const session = await waitForSession()
      user.value = session?.user ?? null

      if (!user.value) {
        profile.value = null
        return { user: null, profile: null, isAdmin: false, isFuncionario: false, isAluno: false }
      }

      // Lê o role do metadata JWT — sem query ao banco, sem chance de 403
      const role = user.value.user_metadata?.role

      if (role === 'funcionario' || user.value.email === ADMIN_EMAIL) {
        const { data: func } = await supabase
          .from('funcionario')
          .select('*')
          .eq('auth_id', user.value.id)
          .maybeSingle()

        profile.value = func ? { ...func, role: 'funcionario' } : null

      } else if (role === 'aluno') {
        const { data: al } = await supabase
          .from('aluno')
          .select('*')
          .eq('auth_id', user.value.id)
          .maybeSingle()

        profile.value = al ? { ...al, role: 'aluno' } : null

      } else {
        // Fallback sem role no metadata
        const { data: func } = await supabase
          .from('funcionario')
          .select('*')
          .eq('auth_id', user.value.id)
          .maybeSingle()

        if (func) {
          profile.value = { ...func, role: 'funcionario' }
        } else {
          const { data: al } = await supabase
            .from('aluno')
            .select('*')
            .eq('auth_id', user.value.id)
            .maybeSingle()
          profile.value = al ? { ...al, role: 'aluno' } : null
        }
      }

      return {
        user: user.value,
        profile: profile.value,
        isAdmin: isAdmin.value,
        isFuncionario: isFuncionario.value,
        isAluno: isAluno.value,
      }
    } finally {
      loading.value = false
    }
  }

  const login = async (email, password) => {
    loading.value = true
    // Reseta o cache de sessão para forçar re-leitura após login
    _sessionReady = null
    try {
      const data = await handle(supabase.auth.signInWithPassword({ email, password }))
      _sessionReady = null // reseta de novo depois do login para garantir
      return { ok: true, data }
    } catch (err) {
      return { ok: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    _sessionReady = null
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  // ── Registro de ALUNO ────────────────────────────────────────────────────
  async function registrarAluno(dados) {
    loading.value = true
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email:    dados.email,
        password: dados.password,
        options: {
          data: {
            role:      'aluno',
            nome:      dados.nome      ?? '',
            sobrenome: dados.sobrenome ?? '',
            cpf:       dados.cpf       ?? '',
          }
        }
      })
      if (authError) throw authError

      await new Promise(r => setTimeout(r, 800))

      const { data: jaExiste } = await supabase
        .from('aluno')
        .select('idaluno')
        .eq('auth_id', authData.user.id)
        .maybeSingle()

      if (!jaExiste) {
        const { error: insertErr } = await supabase.from('aluno').insert([{
          auth_id:   authData.user.id,
          nome:      dados.nome      ?? 'Sem nome',
          sobrenome: dados.sobrenome ?? '',
          cpf:       dados.cpf       ?? '',
          email:     dados.email,
        }])
        if (insertErr && !insertErr.message.includes('duplicate')) throw insertErr
      }

      return { ok: true, data: authData }
    } catch (err) {
      return { ok: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // ── Registro de FUNCIONÁRIO ──────────────────────────────────────────────
  async function registrarFuncionario(dados) {
    loading.value = true
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email:    dados.email,
        password: dados.password,
        options: {
          data: {
            role:      'funcionario',
            nome:      dados.nome      ?? '',
            sobrenome: dados.sobrenome ?? '',
            cpf:       dados.cpf       ?? '',
            funcao:    dados.funcao    ?? '',
          }
        }
      })
      if (authError) throw authError

      await new Promise(r => setTimeout(r, 800))

      const { data: jaExiste } = await supabase
        .from('funcionario')
        .select('idfuncionario')
        .eq('auth_id', authData.user.id)
        .maybeSingle()

      if (!jaExiste) {
        const { error: insertErr } = await supabase.from('funcionario').insert([{
          auth_id:   authData.user.id,
          nome:      dados.nome      ?? 'Sem nome',
          sobrenome: dados.sobrenome ?? '',
          cpf:       dados.cpf       ?? '',
          email:     dados.email,
          funcao:    dados.funcao    ?? 'Não informado',
        }])
        if (insertErr && !insertErr.message.includes('duplicate')) throw insertErr
      }

      const { error: updError } = await supabase
        .from('funcionario')
        .update({
          telefone:        dados.telefone        ?? null,
          data_nascimento: dados.data_nascimento ?? null,
        })
        .eq('auth_id', authData.user.id)

      if (updError) throw updError

      return { ok: true }
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
    registrarAluno,
    registrarFuncionario,
  }
}

// ─── GESTÃO DE EPIs ───────────────────────────────────────────────────────────
export function useEpis() {
  const epis    = ref([])
  const loading = ref(false)

  const listarEpis = async (filtros = {}) => {
    // Garante sessão antes de qualquer query
    await waitForSession()
    loading.value = true
    try {
      let q = supabase.from('epi').select('*').order('nome')
      if (filtros.busca) q = q.ilike('nome', `%${filtros.busca}%`)
      if (filtros.tipo)  q = q.eq('tipo', filtros.tipo)
      const data = await handle(q)
      epis.value = data.map(e => ({ ...e, disponivel: e.quantidade > 0 && e.ativo }))
    } finally {
      loading.value = false
    }
  }

  return {
    epis, loading, listarEpis,
    criarEpi:     async (d)     => { await waitForSession(); return handle(supabase.from('epi').insert([d])) },
    atualizarEpi: async (id, d) => { await waitForSession(); return handle(supabase.from('epi').update(d).eq('idepi', id)) },
    deletarEpi:   async (id)    => { await waitForSession(); return handle(supabase.from('epi').delete().eq('idepi', id)) },
  }
}

// ─── UPLOAD DE IMAGEM ─────────────────────────────────────────────────────────
export async function uploadImagemEpi(file) {
  await waitForSession()
  const fileName = `${Date.now()}-${file.name}`
  await handle(supabase.storage.from('epis-imagens').upload(fileName, file))

  const { data: publicData } = supabase.storage.from('epis-imagens').getPublicUrl(fileName)
  if (publicData?.publicUrl) return publicData.publicUrl

  const { data: signedData, error: signedError } = await supabase.storage
    .from('epis-imagens')
    .createSignedUrl(fileName, 60)

  if (signedError) throw signedError
  if (!signedData?.signedUrl) throw new Error('Não foi possível gerar a URL de acesso à imagem.')

  return signedData.signedUrl
}

// ─── FUNCIONÁRIOS ─────────────────────────────────────────────────────────────
export function useFuncionarios() {
  const funcionarios = ref([])
  const loading      = ref(false)

  const listarFuncionarios = async (busca = '') => {
    await waitForSession()
    loading.value = true
    try {
      let q = supabase.from('funcionario').select('*').order('nome')
      if (busca) q = q.or(`nome.ilike.%${busca}%,cpf.ilike.%${busca}%`)
      funcionarios.value = await handle(q)
    } finally {
      loading.value = false
    }
  }

  return {
    funcionarios, loading, listarFuncionarios,
    criarFuncionario:     async (d)     => { await waitForSession(); return handle(supabase.from('funcionario').insert([d])) },
    atualizarFuncionario: async (id, d) => { await waitForSession(); return handle(supabase.from('funcionario').update(d).eq('idfuncionario', id)) },
    deletarFuncionario:   async (id)    => { await waitForSession(); return handle(supabase.from('funcionario').delete().eq('idfuncionario', id)) },
  }
}

// ─── ALUNOS ───────────────────────────────────────────────────────────────────
export function useAlunos() {
  const alunos  = ref([])
  const loading = ref(false)

  const listarAlunos = async (busca = '') => {
    await waitForSession()
    loading.value = true
    try {
      let q = supabase.from('aluno').select('*').order('nome')
      if (busca) q = q.ilike('nome', `%${busca}%`)
      alunos.value = await handle(q)
    } finally {
      loading.value = false
    }
  }

  return {
    alunos, loading, listarAlunos,
    criarAluno:     async (d)     => { await waitForSession(); return handle(supabase.from('aluno').insert([d])) },
    atualizarAluno: async (id, d) => { await waitForSession(); return handle(supabase.from('aluno').update(d).eq('idaluno', id)) },
    deletarAluno:   async (id)    => { await waitForSession(); return handle(supabase.from('aluno').delete().eq('idaluno', id)) },
  }
}

// ─── SOLICITAÇÕES ─────────────────────────────────────────────────────────────
export function useLocacoes() {
  const locacoes = ref([])
  const loading  = ref(false)

  const listarLocacoes = async () => {
    await waitForSession()
    loading.value = true
    try {
      locacoes.value = await handle(
        supabase
          .from('solicitacoes')
          .select('*, epi ( nome, foto ), aluno ( nome, sobrenome )')
          .order('data_solicitacao', { ascending: false })
      )
    } finally {
      loading.value = false
    }
  }

  return {
    locacoes, loading, listarLocacoes,
    criarLocacao: async (l) => { await waitForSession(); return handle(supabase.from('solicitacoes').insert([l])) },
  }
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export function useDashboard() {
  const stats = ref({
    totalEpis:         0,
    episDisponiveis:   0,
    episIndisponiveis: 0,
    pendentes:         0,
    totalFuncionarios: 0,
    totalAlunos:       0,
  })

  const carregarDashboard = async () => {
    await waitForSession()
    const [
      { count: totalEpis },
      { count: episDisponiveis },
      { count: pendentes },
      { count: totalFuncionarios },
      { count: totalAlunos },
    ] = await Promise.all([
      supabase.from('epi').select('*', { count: 'exact', head: true }),
      supabase.from('epi').select('*', { count: 'exact', head: true }).eq('disponivel', true),
      supabase.from('solicitacoes').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
      supabase.from('funcionario').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
      supabase.from('aluno').select('*', { count: 'exact', head: true }),
    ])

    const total = totalEpis ?? 0
    const disp  = episDisponiveis ?? 0

    stats.value = {
      totalEpis:         total,
      episDisponiveis:   disp,
      episIndisponiveis: total - disp,
      pendentes:         pendentes         ?? 0,
      totalFuncionarios: totalFuncionarios ?? 0,
      totalAlunos:       totalAlunos       ?? 0,
    }
  }

  return { stats, carregarDashboard }
}

export function useSupabase() { return { supabase } }