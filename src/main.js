import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
app.use(router)

// Inicia auth ANTES de montar — garante que isAdmin/isFuncionario já estão prontos

  app.mount('#app')
