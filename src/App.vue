<template>
  <div class="app-container">
    <Sidebar v-if="$route.name !== 'login'" />
    
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView, useRoute } from 'vue-router'
// IMPORTANTE: Certifique-se de que o caminho do import da sua Sidebar está correto aqui embaixo
import Sidebar from '@/components/Sidebar.vue' 

const route = useRoute()
</script>

<style>
/* Reset básico para garantir que o app ocupe a tela toda */
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #d5d9e0; /* Fundo escuro padrão do seu sistema */
  font-family: sans-serif;
}

/* Container principal que coloca a Sidebar e o Conteúdo lado a lado */
.app-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

/* Área da página que vai se ajustar ao lado da Sidebar */
.main-content {
  flex-grow: 1;
  min-width: 0; /* Impede que tabelas largas empurrem a sidebar para fora */
  height: 100vh;
  overflow-y: auto; /* Deixa o scroll apenas no conteúdo da página */
  box-sizing: border-box;
}
</style>
