import { createRouter, createWebHistory } from 'vue-router'
import { supabase, useAuth } from '@/composables/useSupabase.js'

const routes = [
  { path: '/',          name: 'home',         component: () => import('@/views/home.vue') },
  { path: '/login',     name: 'login',        component: () => import('@/views/login.vue') },

  { path: '/dashboard', name: 'dashboard',    component: () => import('@/views/dashboard.vue'),    meta: { requiresAuth: true } },
  { path: '/epis',      name: 'epis',         component: () => import('@/views/epis.vue'),         meta: { requiresAuth: true } },
  
  { path: '/locacao',   name: 'locacao',      component: () => import('@/views/locacao.vue'),      meta: { requiresAuth: true } },
  { path: '/profile',   name: 'profile',      component: () => import('@/views/perfil.vue'),       meta: { requiresAuth: true } },

  { path: '/entrega',   name: 'entrega',      component: () => import('@/views/entrega.vue'),      meta: { requiresAuth: true, onlyFuncionario: true } },
  { path: '/alunos',    name: 'alunos',       component: () => import('@/views/alunos.vue'),       meta: { requiresAuth: true, onlyFuncionario: true } },
  { path: '/turmas',    name: 'turmas',       component: () => import('@/views/turmas.vue'),       meta: { requiresAuth: true, onlyFuncionario: true } },

  { path: '/funcionarios', name: 'funcionarios', component: () => import('@/views/funcionarios.vue'), meta: { requiresAuth: true, onlyAdmin: true } },

  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// FUNÇÃO AUXILIAR: Aguarda a inicialização e recuperação da sessão do Supabase
function esperarSupabase() {
  return new Promise((resolve) => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) return resolve(true)
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
        if (event === 'INITIAL_SESSION' || currentSession) {
          subscription.unsubscribe()
          resolve(true)
        }
      })
      
      // Timeout de segurança de 1.5s para não travar a aplicação infinitamente
      setTimeout(() => {
        subscription.unsubscribe()
        resolve(false)
      }, 1500)
    })
  })
}

router.beforeEach(async (to) => {
  // 1. Se a rota não exige autenticação, permite o acesso imediato
  if (!to.meta.requiresAuth) return true

  // 2. NOVA TRAVA: Aguarda o Supabase carregar a sessão antes de testar o usuário
  await esperarSupabase()

  // 3. Instancia o useAuth para ter acesso aos dados atualizados do usuário
  const { getCurrentUser } = useAuth()
  
  // 4. Executa a busca detalhada do usuário e suas respectivas roles
  const res = await getCurrentUser()

  // Se não retornou um usuário válido, barra o acesso e joga para o login
  if (!res || !res.user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // 5. Extrai os privilégios reais mapeados pelo backend/regras de negócio
  const usuarioEhAdmin = res.isAdmin
  const usuarioEhFuncionario = res.isFuncionario 

  // 6. Validação de bloqueio para telas exclusivas de Administrador
  if (to.meta.onlyAdmin && !usuarioEhAdmin) {
    console.warn('Acesso negado: Rota exclusiva para Administradores.')
    return { name: 'dashboard' }
  }

  // 7. Validação de bloqueio para telas de nível Funcionário (onde Admin também entra)
  if (to.meta.onlyFuncionario && !usuarioEhFuncionario) {
    console.warn('Acesso negado: Rota exclusiva para Funcionários/Administradores.')
    return { name: 'dashboard' }
  }

  return true
})

export default router