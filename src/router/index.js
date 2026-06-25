import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/composables/useSupabase.js'

import Home         from '@/views/Home.vue'
import Login        from '@/views/Login.vue'
import Registro     from '@/views/Registro.vue'
import Dashboard    from '@/views/Dashboard.vue'
import Epis         from '@/views/Epis.vue'
import Funcionarios from '@/views/Funcionarios.vue'
import Locacao      from '@/views/Locacao.vue'
import Entrega      from '@/views/Entrega.vue'
import Perfil       from '@/views/Perfil.vue'

const routes = [
  { path: '/',             component: Home,         name: 'home' },
  { path: '/login',        component: Login,        name: 'login' },
  { path: '/registro',     component: Registro,     name: 'registro' },
  {
    path: '/dashboard',
    component: Dashboard,
    name: 'dashboard',
    meta: { requiresAuth: true },
  },
  {
    path: '/epis',
    component: Epis,
    name: 'epis',
    meta: { requiresAuth: true },
  },
  {
    path: '/locacao',
    component: Locacao,
    name: 'locacao',
    meta: { requiresAuth: true },
  },
  {
    path: '/entrega',
    component: Entrega,
    name: 'entrega',
    meta: { requiresAuth: true, onlyFuncionario: true },
  },
  {
    path: '/funcionarios',
    component: Funcionarios,
    name: 'funcionarios',
    meta: { requiresAuth: true, onlyFuncionario: true },
  },
  {
    path: '/perfil',
    component: Perfil,
    name: 'perfil',
    meta: { requiresAuth: true },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})

router.beforeEach(async (to, _from, next) => {
  if (!to.meta.requiresAuth) return next()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return next({ name: 'login', query: { redirect: to.fullPath } })

  // Rotas só para funcionário
  if (to.meta.onlyFuncionario) {
    const { data: func } = await supabase
      .from('funcionario')
      .select('idfuncionario')
      .eq('auth_id', session.user.id)
      .maybeSingle()

    if (!func) return next({ name: 'dashboard' })
  }

  next()
})

export default router