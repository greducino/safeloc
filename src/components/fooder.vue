<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-brand-row">
          <span class="footer-shield">🛡️</span>
          <span class="footer-brand-name">SafeLoc</span>
        </div>
        <p class="footer-brand-desc">Sistema de Gerenciamento de EPIs<br>SENAI · Segurança em Primeiro Lugar</p>
      </div>

      <div class="footer-col">
        <h4>Redes Sociais</h4>
        <div class="social-links">
          <a href="#" class="social-link">📸 Instagram</a>
          <a href="#" class="social-link">💼 LinkedIn</a>
          <a href="#" class="social-link">▶️ YouTube</a>
        </div>
      </div>

      <div class="footer-col">
        <h4>Contato</h4>
        <a href="mailto:suportesafeloc@gmail.com" class="footer-email">suportesafeloc@gmail.com</a>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2025 SENAI – Sistema de Gerenciamento de EPIs · Todos os direitos reservados</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #1a3a6b;
  border-top: 3px solid #e8a020;
  margin-top: auto;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
  flex-wrap: wrap;
}

.footer-brand {
  flex: 1;
  min-width: 200px;
}

.footer-brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.footer-shield {
  font-size: 1.6rem;
}

.footer-brand-name {
  font-size: 1.3rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.footer-brand-desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.6;
  margin: 0;
}

.footer-col h4 {
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.social-link,
.footer-email {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: color 0.2s;
}

.social-link:hover,
.footer-email:hover {
  color: #e8a020;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  text-align: center;
}

.footer-bottom p {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

@media (max-width: 600px) {
  .footer-inner {
    flex-direction: column;
    gap: 24px;
  }
}
</style>