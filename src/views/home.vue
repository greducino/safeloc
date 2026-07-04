<template>
  <div class="home-wrapper">
    <MenuNav />

    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg-pattern"></div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-brand-row">
            <div class="hero-shield-badge">🛡️</div>
            <div>
              <h1 class="hero-title">SafeLoc</h1>
              <p class="hero-sub">SENAI · Segurança em Primeiro Lugar</p>
            </div>
          </div>
          <p class="hero-desc">
            Gerencie seus equipamentos de proteção com eficiência. Acesse o catálogo completo de EPIs, faça solicitações e acompanhe seu histórico de segurança em um só lugar.
          </p>
          <div class="hero-actions">
            <RouterLink to="/epis" class="btn btn-outline-white">Ver Lista de EPIs</RouterLink>
            <RouterLink to="/registro" class="btn btn-accent">Criar Conta</RouterLink>
          </div>

          <div class="hero-stats">
            <div class="hero-stat">
              <span class="stat-num">500+</span>
              <span class="stat-label">EPIs Cadastrados</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <span class="stat-num">1200+</span>
              <span class="stat-label">Alunos Ativos</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <span class="stat-num">99%</span>
              <span class="stat-label">Conformidade NR</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Steps -->
    <section class="steps-section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Como Funciona</span>
          <h2 class="section-title">Simples e Rápido</h2>
        </div>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-num">1</div>
            <div class="step-icon">🔑</div>
            <h3>Acesse sua Conta</h3>
            <p>Faça login com seu e-mail institucional para acessar o catálogo completo e visualizar seu histórico de segurança.</p>
          </div>
          <div class="step-card">
            <div class="step-num">2</div>
            <div class="step-icon">🔍</div>
            <h3>Escolha seu EPI</h3>
            <p>Navegue pelas categorias e selecione o equipamento ideal — capacetes, luvas, respiradores e muito mais.</p>
          </div>
          <div class="step-card featured-step">
            <div class="step-num">3</div>
            <div class="step-icon">✅</div>
            <h3>Retire com Segurança</h3>
            <p>Confirme a locação. O sistema gera a reserva para retirada imediata no almoxarifado da SENAI.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="categories-section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Catálogo</span>
          <h2 class="section-title">Categorias de EPIs Disponíveis</h2>
        </div>
        <div class="cat-grid">
          <RouterLink
            v-for="cat in categorias"
            :key="cat.nome"
            :to="{ name: 'epis', query: { categoria: cat.nome } }"
            class="cat-card"
          >
            <div class="cat-icon-wrap" :style="{ background: cat.cor }">
              <span class="cat-icon">{{ cat.icon }}</span>
            </div>
            <span class="cat-name">{{ cat.nome }}</span>
            <span class="cat-arrow">→</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card">
          <div class="cta-text">
            <h2>Pronto para começar?</h2>
            <p>Crie sua conta agora e tenha acesso completo ao sistema de gerenciamento de EPIs do SENAI.</p>
          </div>
          <RouterLink to="/registro" class="btn btn-accent btn-lg">Criar Conta Gratuita →</RouterLink>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import MenuNav from '@/components/menu.vue'
import Footer from '@/components/footer.vue'

const categorias = [
  { nome: 'Capacete',           icon: '⛑️', cor: '#dbeafe' },
  { nome: 'Luvas',              icon: '🧤', cor: '#fef3c7' },
  { nome: 'Respirador',         icon: '😷', cor: '#fee2e2' },
  { nome: 'Óculos de Proteção', icon: '🥽', cor: '#dcfce7' },
  { nome: 'Bota de Segurança',  icon: '👢', cor: '#e0e7ff' },
  { nome: 'Proteção Auricular', icon: '🎧', cor: '#fce7f3' },
]
</script>

<style scoped>
.home-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f0f4fb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ─── Hero ─── */
.hero {
  background: #1a3a6b;
  padding: 80px 0 64px;
  position: relative;
  overflow: hidden;
}

.hero-bg-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 80% 20%, rgba(232, 160, 32, 0.12) 0%, transparent 50%),
                    radial-gradient(circle at 10% 80%, rgba(255, 255, 255, 0.04) 0%, transparent 40%);
  pointer-events: none;
}

.hero-content {
  max-width: 680px;
  position: relative;
  z-index: 1;
}

.hero-brand-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.hero-shield-badge {
  font-size: 3rem;
  line-height: 1;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
  margin: 0;
  letter-spacing: -0.5px;
}

.hero-sub {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 4px 0 0;
}

.hero-desc {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.75;
  margin-bottom: 32px;
  max-width: 520px;
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
  border: 2px solid transparent;
  cursor: pointer;
}

.btn-outline-white {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.5);
  color: #ffffff;
}

.btn-outline-white:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.8);
}

.btn-accent {
  background: #e8a020;
  border-color: #e8a020;
  color: #ffffff;
}

.btn-accent:hover {
  background: #f0b030;
  border-color: #f0b030;
}

.btn-lg {
  padding: 14px 36px;
  font-size: 1rem;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: #e8a020;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
}

.hero-stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
}

/* ─── Section Header ─── */
.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-label {
  display: inline-block;
  background: #dbeafe;
  color: #1a3a6b;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 4px 14px;
  border-radius: 20px;
  margin-bottom: 10px;
}

.section-title {
  font-size: 1.7rem;
  font-weight: 800;
  color: #1a3a6b;
  margin: 0;
}

/* ─── Steps ─── */
.steps-section {
  padding: 72px 0;
  background: #ffffff;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.step-card {
  background: #f8faff;
  border: 1.5px solid #dbeafe;
  border-radius: 12px;
  padding: 32px 28px;
  position: relative;
  transition: box-shadow 0.2s, transform 0.2s;
}

.step-card:hover {
  box-shadow: 0 8px 24px rgba(26, 58, 107, 0.12);
  transform: translateY(-3px);
}

.featured-step {
  background: #1a3a6b;
  border-color: #1a3a6b;
}

.featured-step h3,
.featured-step p {
  color: rgba(255, 255, 255, 0.9) !important;
}

.step-num {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  background: #e8a020;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
}

.featured-step .step-num {
  background: rgba(255, 255, 255, 0.2);
}

.step-icon {
  font-size: 2rem;
  margin-bottom: 16px;
}

.step-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1a3a6b;
  margin: 0 0 10px;
}

.step-card p {
  font-size: 0.875rem;
  color: #5a7a9e;
  line-height: 1.7;
  margin: 0;
}

/* ─── Categories ─── */
.categories-section {
  padding: 72px 0;
  background: #f0f4fb;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 16px;
}

.cat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1.5px solid #dbeafe;
  border-radius: 12px;
  padding: 28px 16px;
  text-decoration: none;
  transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
  position: relative;
}

.cat-card:hover {
  box-shadow: 0 8px 20px rgba(26, 58, 107, 0.12);
  transform: translateY(-4px);
  border-color: #1a3a6b;
}

.cat-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cat-icon {
  font-size: 2rem;
}

.cat-name {
  font-weight: 700;
  font-size: 0.85rem;
  text-align: center;
  color: #1a3a6b;
}

.cat-arrow {
  font-size: 0.8rem;
  color: #e8a020;
  font-weight: 700;
}

/* ─── CTA ─── */
.cta-section {
  padding: 48px 0 64px;
  background: #ffffff;
}

.cta-card {
  background: #1a3a6b;
  border-radius: 16px;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
  border-top: 4px solid #e8a020;
}

.cta-text h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 8px;
}

.cta-text p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  max-width: 480px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .hero-title { font-size: 2.2rem; }
  .cta-card { flex-direction: column; text-align: center; padding: 32px 24px; }
  .hero-stats { gap: 16px; }
}
</style>