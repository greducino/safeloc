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
</style>
