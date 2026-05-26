import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/composables/useSupabase.js'

import Home         from '@/views/home.vue'
import Login        from '@/views/login.vue'
import Registro     from '@/views/registro.vue'
import Dashboard    from '@/views/dashboard.vue'
import Epis         from '@/views/epis.vue'
import Funcionarios from '@/views/funcionarios.vue'
import Locacao      from '@/views/locacao.vue'
import Entrega      from '@/views/entrega.vue'
import Perfil       from '@/views/perfil.vue'

const ADMIN_EMAIL = 'gabrielreducinodasilva@gmail.com'

const routes = [
  { path: '/',         component: Home,    name: 'home' },
  { path: '/login',    component: Login,   name: 'login' },
  { path: '/registro', component: Registro, name: 'registro' },
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

  if (to.meta.onlyFuncionario) {
    if (session.user.email === ADMIN_EMAIL) return next()

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