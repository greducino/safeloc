<template>
  <div class="login-page">
    
    <div class="login-left">
      <div class="geo geo-1"></div>
      <div class="geo geo-2"></div>
      <div class="geo geo-3"></div>

      <div class="left-content">
        <div class="brand-wrap">
          <div class="brand-logo">🛡️</div>
          <div>
            <h1>SafeLoc</h1>
            <div class="brand-sub">SENAI · Segurança em Primeiro Lugar</div>
          </div>
        </div>

        <div class="brand-desc">
          Gestão inteligente e segura de Equipamentos de Proteção Individual.
        </div>

        <div class="feature-list">
          <div class="feature-item" v-for="item in infoItems" :key="item.text">
            <span class="f-icon">✓</span>
            <div>
              <strong>{{ item.text }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="form-wrap">
        
        <div class="form-heading">
          <h2>{{ aba === 'login' ? 'Bem-vindo de volta!' : 'Criar nova conta' }}</h2>
          <p>{{ aba === 'login' ? 'Acesse o sistema com suas credenciais' : 'Preencha os dados para se cadastrar' }}</p>
        </div>

        <div class="auth-tabs">
          <button :class="['tab-btn', { active: aba === 'login' }]" @click="aba = 'login'">
            Entrar
          </button>
          <button :class="['tab-btn', { active: aba === 'registro' }]" @click="aba = 'registro'">
            Criar Conta
          </button>
        </div>

        <form v-if="aba === 'login'" @submit.prevent="handleLogin">
          <div class="form-field">
            <div class="label-row">
              <label>E-mail</label>
            </div>
            <div class="input-icon-wrap">
              <input
                v-model="loginForm.email"
                type="email"
                required
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div class="form-field">
            <div class="label-row">
              <label>Senha</label>
            </div>
            <div class="input-icon-wrap">
              <input
                v-model="loginForm.password"
                type="password"
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <p v-if="erro" class="form-error">⚠ {{ erro }}</p>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Entrando…' : 'Entrar no Sistema' }}
          </button>
        </form>

        <form v-else @submit.prevent="handleRegistro">
          <div class="form-row2">
            <div class="form-field">
              <div class="label-row"><label>Nome</label></div>
              <div class="input-icon-wrap">
                <input v-model="regForm.nome" required placeholder="João" />
              </div>
            </div>
            <div class="form-field">
              <div class="label-row"><label>Sobrenome</label></div>
              <div class="input-icon-wrap">
                <input v-model="regForm.sobrenome" required placeholder="Silva" />
              </div>
            </div>
          </div>

          <div class="form-field">
            <div class="label-row"><label>CPF</label></div>
            <div class="input-icon-wrap">
              <input v-model="regForm.cpf" required placeholder="000.000.000-00" maxlength="14" />
            </div>
          </div>

          <div class="form-field">
            <div class="label-row"><label>E-mail</label></div>
            <div class="input-icon-wrap">
              <input v-model="regForm.email" type="email" required placeholder="seu@email.com" />
            </div>
          </div>

          <div class="form-row2">
            <div class="form-field">
              <div class="label-row"><label>Telefone</label></div>
              <div class="input-icon-wrap">
                <input v-model="regForm.telefone" placeholder="(11) 9 0000-0000" />
              </div>
            </div>
            <div class="form-field">
              <div class="label-row"><label>Nascimento</label></div>
              <div class="input-icon-wrap">
                <input v-model="regForm.data_nascimento" type="date" />
              </div>
            </div>
          </div>

          <div class="form-field">
            <div class="label-row"><label>Senha</label></div>
            <div class="input-icon-wrap">
              <input v-model="regForm.password" type="password" required placeholder="••••••••" minlength="6" />
            </div>
          </div>

          <p v-if="erro" class="form-error">⚠ {{ erro }}</p>
          <p v-if="sucesso" class="form-success">✓ {{ sucesso }}</p>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Criando conta…' : 'Criar Conta' }}
          </button>
        </form>

      </div>
      
      <div class="right-footer">© 2026 SENAI SafeLoc</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useSupabase.js'

const router = useRouter()
const route  = useRoute()
const { login, registrarAluno, loading } = useAuth()

const aba     = ref('login')
const erro    = ref('')
const sucesso = ref('')

const loginForm = ref({ email: '', password: '' })
const regForm   = ref({
  nome: '', sobrenome: '', cpf: '', email: '',
  telefone: '', data_nascimento: '', password: ''
})

const infoItems = [
  { text: 'Acesso ao catálogo completo de EPIs' },
  { text: 'Solicitação e rastreamento em tempo real' },
  { text: 'Conformidade com normas NR da ABNT' },
  { text: 'Histórico completo de locações' },
]

async function handleLogin() {
  erro.value = ''
  loading.value = true
  
  try {
    const res = await login(loginForm.value.email, loginForm.value.password)
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (err) {
    console.error("Erro capturado:", err)
    erro.value = err.message || 'Erro ao realizar login. Verifique suas credenciais.'
  } finally {
    loading.value = false
  }
}

async function handleRegistro() {
  erro.value = ''
  sucesso.value = ''
  const res = await registrarAluno(regForm.value)
  if (!res.ok) { erro.value = res.message; return }
  sucesso.value = 'Conta criada! Verifique seu e-mail para confirmar e faça login.'
  aba.value = 'login'
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   LAYOUT SPLIT (CSS ANTIGO RESTAURADO)
═══════════════════════════════════════════════ */
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

/* ═══ PAINEL ESQUERDO ═══ */
.login-left {
  background: linear-gradient(145deg, #0f2744 0%, #1a3a5c 50%, #2563a8 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 50px 10%;
}
.left-content { position: relative; z-index: 2; }

.brand-wrap {
  display: flex; align-items: center; gap: 16px;
  margin-bottom: 32px;
}
.brand-logo {
  width: 64px; height: 64px;
  background: rgba(255,255,255,0.12);
  border: 2px solid rgba(255,255,255,0.25);
  border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem;
  backdrop-filter: blur(4px);
}
.brand-wrap h1 {
  font-size: 2.2rem; font-weight: 800;
  color: #fff; line-height: 1; margin: 0;
}
.brand-sub {
  font-size: 0.78rem; color: rgba(255,255,255,0.6);
  margin-top: 4px;
}

.brand-desc {
  color: rgba(255,255,255,0.75);
  font-size: 0.95rem; line-height: 1.7;
  margin-bottom: 36px; max-width: 380px;
}

.feature-list { display: flex; flex-direction: column; gap: 18px; margin-bottom: 36px; }
.feature-item {
  display: flex; align-items: flex-start; gap: 14px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 14px 16px;
  backdrop-filter: blur(4px);
}
.f-icon { font-size: 1.2rem; flex-shrink: 0; color: #fff; }
.feature-item strong { display: block; color: #fff; font-size: 0.9rem; font-weight: 500;}
.feature-item span   { color: rgba(255,255,255,0.6); font-size: 0.78rem; }

/* Decorações geométricas */
.geo {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
}
.geo-1 { width: 320px; height: 320px; bottom: -100px; right: -80px; }
.geo-2 { width: 180px; height: 180px; top: -50px;   right: 40px; }
.geo-3 { width: 100px; height: 100px; top: 200px;   right: -20px; }

/* ═══ PAINEL DIREITO ═══ */
.login-right {
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  position: relative;
}

.form-wrap {
  width: 100%; max-width: 440px;
  background: #fff;
  border-radius: 20px;
  padding: 36px 36px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
}

/* Tabs */
.auth-tabs {
  display: flex;
  background: #f0f4f8;
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 28px;
  gap: 4px;
}
.tab-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn.active {
  background: #fff;
  color: #1a3a5c;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Heading */
.form-heading { margin-bottom: 22px; }
.form-heading h2 { font-size: 1.35rem; font-weight: 700; color: #1a3a5c; margin: 0;}
.form-heading p  { color: #64748b; font-size: 0.87rem; margin-top: 4px; }

/* Inputs */
.form-field { margin-bottom: 16px; }
.form-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.input-icon-wrap {
  position: relative; display: flex; align-items: center;
}
.input-icon-wrap input {
  width: 100%;
  padding: 11px 14px; /* Ajustado para inputs sem ícone */
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.93rem;
  background: #f8fafc;
  color: #1e293b;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.input-icon-wrap input:focus {
  outline: none;
  border-color: #2563a8;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37,99,168,0.1);
}

/* Labels row */
.label-row {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 6px;
}
.label-row label { font-weight: 600; font-size: 0.875rem; color: #475569; }

/* Submit */
.btn-submit {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #1a3a5c, #2563a8);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.97rem;
  font-weight: 700;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: opacity 0.2s, transform 0.15s;
  letter-spacing: 0.02em;
  margin-top: 8px;
}
.btn-submit:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

/* Spinner */
.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Mensagens de Alerta (Adicionadas para o JS novo) */
.form-error {
  color: #c0392b; font-size: 0.85rem; background: #fef2f2;
  border: 1px solid #fecaca; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px;
}
.form-success {
  color: #166534; font-size: 0.85rem; background: #f0fdf4;
  border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px;
}

/* Rodapé */
.right-footer {
  position: absolute; bottom: 20px;
  color: #94a3b8; font-size: 0.75rem;
}

/* ═══ RESPONSIVO ═══ */
@media (max-width: 900px) {
  .login-page { grid-template-columns: 1fr; }
  .login-left { display: none; }
  .login-right { padding: 32px 20px; }
  .form-wrap { padding: 28px 22px; }
}
</style>
