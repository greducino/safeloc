<div align="center">

```
███████╗ █████╗ ███████╗███████╗    ██╗      ██████╗  ██████╗
██╔════╝██╔══██╗██╔════╝██╔════╝    ██║     ██╔═══██╗██╔════╝
███████╗███████║█████╗  █████╗      ██║     ██║   ██║██║
╚════██║██╔══██║██╔══╝  ██╔══╝      ██║     ██║   ██║██║
███████║██║  ██║██║     ███████╗    ███████╗╚██████╔╝╚██████╗
╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝    ╚══════╝ ╚═════╝  ╚═════╝
```

**Sistema de Gestão de EPIs para Ambientes de Treinamento**

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-1a2942?style=for-the-badge&logo=vue.js&logoColor=42d392)
![Supabase](https://img.shields.io/badge/Supabase-Backend-1a2942?style=for-the-badge&logo=supabase&logoColor=3ECF8E)
![Vite](https://img.shields.io/badge/Vite-Build-1a2942?style=for-the-badge&logo=vite&logoColor=646CFF)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-RLS-1a2942?style=for-the-badge&logo=postgresql&logoColor=4169E1)

</div>

---

## 📌 O que é o SAFELOC?

**SAFELOC** é um dashboard web para **gestão de Equipamentos de Proteção Individual (EPIs)**, voltado para ambientes de ensino/treinamento. O sistema permite que funcionários controlem o estoque de EPIs, gerenciem alunos e funcionários, processem solicitações de empréstimo e acompanhem entregas — tudo com controle de acesso por perfil de usuário.

> **Stack:** Vue 3 (Composition API) + Supabase (Auth + Database + Storage) + Vite  
> **Tema visual:** Azul escuro (`#0f172a` / `#1e3a5f`)

---

## 🗂️ Estrutura do Projeto

```
safeloc/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── footer.vue       # Rodapé global
│   │   ├── menu.vue         # Navbar superior
│   │   └── sidebar.vue      # Barra lateral com links
│   ├── composables/
│   │   ├── useAuthStore.js  # Gerenciamento de autenticação e perfil
│   │   └── useSupabase.js   # Client Supabase
│   ├── router/
│   │   └── index.js         # Rotas + guards
│   ├── views/
│   │   ├── home.vue
│   │   ├── login.vue
│   │   ├── registro.vue
│   │   ├── dashboard.vue
│   │   ├── epis.vue
│   │   ├── funcionarios.vue
│   │   ├── alunos.vue
│   │   ├── turmas.vue
│   │   ├── locacao.vue
│   │   ├── entrega.vue
│   │   └── perfil.vue
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── .env                     # NÃO commitar!
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚙️ Configuração do Ambiente

### 1. Clone e instale

```bash
git clone https://github.com/seu-usuario/safeloc.git
cd safeloc
npm install
```

### 2. Variáveis de ambiente

Crie `.env` na raiz:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Supabase Dashboard → Settings → API → Project URL + anon public key**

### 3. Rode

```bash
npm run dev
```

---

## 🗃️ Banco de Dados — Schema Completo

> Aplique o schema no **Supabase → SQL Editor**. Para resetar: `DROP SCHEMA public CASCADE` → `CREATE SCHEMA public` → rodar o schema do zero.

---

### Tabela `public.funcionario`

Armazena os funcionários/instrutores do sistema. Ligada ao `auth.users` via `auth_id`.

| Coluna | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `idfuncionario` | `UUID` | ✅ PK | `uuid_generate_v4()` | ID único |
| `nome` | `VARCHAR(100)` | ✅ | — | Primeiro nome |
| `sobrenome` | `VARCHAR(100)` | ✅ | — | Sobrenome |
| `cpf` | `VARCHAR(14)` | ✅ UNIQUE | — | CPF formatado (ex: `000.000.000-00`) |
| `email` | `VARCHAR(150)` | ✅ UNIQUE | — | E-mail (igual ao do Auth) |
| `funcao` | `VARCHAR(80)` | ❌ | — | Cargo/função (ex: `"Instrutor"`) |
| `status` | `VARCHAR(30)` | ✅ | `'ativo'` | `'ativo'` ou `'inativo'` |
| `data_nascimento` | `DATE` | ❌ | — | Data de nascimento |
| `telefone` | `VARCHAR(20)` | ❌ | — | Telefone |
| `auth_id` | `UUID` | ❌ UNIQUE FK | — | FK → `auth.users(id)` |
| `foto` | `VARCHAR(255)` | ❌ | — | URL da foto de perfil |
| `created_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | Criação |
| `updated_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | Última atualização (trigger) |

**Índice:** `idx_funcionario_auth_id` em `auth_id`

---

### Tabela `public.aluno`

Alunos cadastrados no sistema. Mesma estrutura de vínculo com Auth que `funcionario`.

| Coluna | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `idaluno` | `UUID` | ✅ PK | `uuid_generate_v4()` | ID único |
| `nome` | `VARCHAR(100)` | ✅ | — | Primeiro nome |
| `sobrenome` | `VARCHAR(100)` | ✅ | — | Sobrenome |
| `cpf` | `VARCHAR(14)` | ✅ UNIQUE | — | CPF |
| `email` | `VARCHAR(150)` | ✅ UNIQUE | — | E-mail |
| `data_nascimento` | `DATE` | ❌ | — | Data de nascimento |
| `telefone` | `VARCHAR(20)` | ❌ | — | Telefone |
| `auth_id` | `UUID` | ❌ UNIQUE FK | — | FK → `auth.users(id)` |
| `foto` | `VARCHAR(255)` | ❌ | — | URL da foto de perfil |
| `created_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | Criação |
| `updated_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | Última atualização (trigger) |

**Índice:** `idx_aluno_auth_id` em `auth_id`

---

### Tabela `public.epi`

Catálogo e estoque de EPIs disponíveis.

| Coluna | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `idepi` | `UUID` | ✅ PK | `uuid_generate_v4()` | ID único |
| `nome` | `VARCHAR(120)` | ✅ | — | Nome do EPI (ex: `"Capacete Classe B"`) |
| `tipo` | `VARCHAR(80)` | ❌ | — | Categoria (ex: `"Proteção da Cabeça"`) |
| `quantidade` | `INT` | ✅ | `0` | Quantidade em estoque atual |
| `disponivel` | `BOOLEAN` | ✅ | `TRUE` | `true` se `quantidade > 0 AND ativo` |
| `data_validade` | `DATE` | ❌ | — | Data de validade do EPI |
| `codigo_patrimonio` | `VARCHAR(60)` | ❌ UNIQUE | — | Código patrimonial (ex: `"EPI-CAP-001"`) |
| `descricao` | `TEXT` | ❌ | — | Descrição detalhada |
| `ativo` | `BOOLEAN` | ✅ | `TRUE` | Se o EPI está ativo no sistema |
| `foto` | `VARCHAR(255)` | ❌ | — | URL da imagem (bucket `epis-imagens`) |
| `created_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | Criação |
| `updated_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | Última atualização (trigger) |

**Índices:** `idx_solicitacoes_epi` em `idepi` (via FK em solicitacoes)

> ⚠️ **`quantidade` e `disponivel` são atualizados automaticamente** pelos triggers `trg_decrementa_epi_*` e `trg_incrementa_epi_func`. Não altere manualmente via insert em `*_has_epi`.

---

### Tabela `public.turma`

Turmas/grupos de alunos.

| Coluna | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `idturma` | `UUID` | ✅ PK | `uuid_generate_v4()` | ID único |
| `nome` | `VARCHAR(100)` | ✅ | — | Nome da turma (ex: `"Turma A 2025"`) |
| `nomenclatura` | `VARCHAR(30)` | ❌ | — | Código curto (ex: `"TA-2025"`) |
| `data_inicio` | `DATE` | ❌ | — | Início das aulas |
| `data_termino` | `DATE` | ❌ | — | Término das aulas |
| `horario_inicio` | `TIME` | ❌ | — | Horário de início diário |
| `horario_termino` | `TIME` | ❌ | — | Horário de término diário |
| `capacidade_maxima` | `INT` | ✅ | `30` | Limite de alunos |
| `created_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | Criação |
| `updated_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | Última atualização (trigger) |

---

### Tabela `public.solicitacoes`

Pedidos de EPI feitos por alunos. É o coração do fluxo de locação.

| Coluna | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `idsolicitacao` | `UUID` | ✅ PK | `uuid_generate_v4()` | ID único |
| `aluno_id` | `UUID` | ✅ FK | — | FK → `aluno(idaluno)` CASCADE |
| `epi_id` | `UUID` | ✅ FK | — | FK → `epi(idepi)` RESTRICT |
| `status` | `VARCHAR(30)` | ✅ | `'pendente'` | Ver valores permitidos abaixo |
| `data_solicitacao` | `TIMESTAMPTZ` | ✅ | `NOW()` | Quando foi solicitado |
| `data_aprovacao` | `TIMESTAMPTZ` | ❌ | — | Quando foi aprovado |
| `data_entrega` | `TIMESTAMPTZ` | ❌ | — | Quando foi entregue fisicamente |
| `data_devolucao` | `TIMESTAMPTZ` | ❌ | — | Quando foi devolvido |
| `motivo_rejeicao` | `TEXT` | ❌ | — | Texto livre se `status = 'rejeitado'` |
| `created_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | Criação |
| `updated_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | Última atualização (trigger) |

**Valores válidos para `status`** (constraint `chk_status_solicitacao`):

| Valor | Significado |
|---|---|
| `pendente` | Aluno abriu, aguardando funcionário |
| `aprovado` | Funcionário aprovou, ainda não entregou |
| `rejeitado` | Funcionário rejeitou (preencher `motivo_rejeicao`) |
| `entregue` | EPI entregue fisicamente — **dispara trigger que cria registro em `aluno_has_epi`** |
| `devolvido` | EPI foi devolvido |

**Índices:** `idx_solicitacoes_aluno`, `idx_solicitacoes_epi`, `idx_solicitacoes_status`

---

### Tabela `public.funcionario_has_epi`

Registro de EPIs entregues diretamente a funcionários (não via solicitação).

| Coluna | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `id_entrega_func` | `UUID` | ✅ PK | `uuid_generate_v4()` | ID único |
| `funcionario_id` | `UUID` | ✅ FK | — | FK → `funcionario(idfuncionario)` CASCADE |
| `epi_id` | `UUID` | ✅ FK | — | FK → `epi(idepi)` RESTRICT |
| `data_entrega` | `DATE` | ❌ | — | Data da entrega |
| `data_devolucao` | `DATE` | ❌ | — | Ao preencher este campo, **trigger incrementa estoque** |
| `created_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | Criação |
| `updated_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | Última atualização (trigger) |

**Índice:** `idx_func_has_epi_func` em `funcionario_id`

---

### Tabela `public.aluno_has_epi`

Registro de EPIs entregues a alunos. Criada automaticamente pelo trigger quando uma solicitação vai para `entregue`, ou pode ser inserida manualmente por funcionários.

| Coluna | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `id_entrega_aluno` | `UUID` | ✅ PK | `uuid_generate_v4()` | ID único |
| `aluno_id` | `UUID` | ✅ FK | — | FK → `aluno(idaluno)` CASCADE |
| `epi_id` | `UUID` | ✅ FK | — | FK → `epi(idepi)` RESTRICT |
| `data_entrega` | `DATE` | ❌ | — | Data da entrega física |
| `created_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | Criação |
| `updated_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | Última atualização (trigger) |

**Índice:** `idx_aluno_has_epi_aluno` em `aluno_id`

---

### Tabela `public.aluno_has_turma`

Matrícula de alunos em turmas (relação N:N).

| Coluna | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `aluno_id` | `UUID` | ✅ PK + FK | — | FK → `aluno(idaluno)` CASCADE |
| `turma_id` | `UUID` | ✅ PK + FK | — | FK → `turma(idturma)` CASCADE |
| `data_matricula` | `DATE` | ✅ | `CURRENT_DATE` | Data da matrícula |
| `status` | `VARCHAR(30)` | ✅ | `'ativo'` | Ver valores abaixo |

**Chave primária composta:** `(aluno_id, turma_id)`

**Valores válidos para `status`** (constraint `chk_status_matricula`):
`'ativo'` | `'inativo'` | `'concluido'` | `'cancelado'`

**Índice:** `idx_aluno_has_turma_turma` em `turma_id`

---

## 👁️ Views

### `vw_aluno_turma`
Join entre `aluno_has_turma`, `aluno` e `turma`. Retorna:
`turma_id`, `nome_turma`, `nomenclatura_turma`, `aluno_id`, `nome_completo_aluno`, `email_aluno`, `cpf_aluno`, `data_matricula`, `status_matricula`

### `vw_epi_vencido`
Filtra EPIs ativos com `data_validade < hoje` ou `data_validade` nos próximos 30 dias. Retorna:
`idepi`, `nome_epi`, `tipo_epi`, `quantidade`, `disponivel`, `codigo_patrimonio`, `data_validade`, `dias_vencidos`, `status_validade` (`'Vencido'` ou `'Próximo do Vencimento (30 dias)'`)

### `vw_solicitacoes_detalhadas`
Join entre `solicitacoes`, `aluno` e `epi`. Retorna todos os campos da solicitação + `nome_completo_aluno`, `email_aluno`, `nome_epi`, `codigo_patrimonio_epi`, `foto_epi`

> Todas as views usam `security_invoker = true` — respeitam o RLS do usuário que faz a query.

---

## 🔄 Triggers e Funções do Banco

### Fluxo de estoque (automático)

```
INSERT em funcionario_has_epi  →  trg_decrementa_epi_func  →  epi.quantidade -= 1
INSERT em aluno_has_epi        →  trg_decrementa_epi_aluno →  epi.quantidade -= 1
UPDATE funcionario_has_epi
  (data_devolucao: NULL → valor) →  trg_incrementa_epi_func  →  epi.quantidade += 1
```

### Fluxo de solicitação (automático)

```
UPDATE solicitacoes SET status = 'entregue'
  →  trg_solicitacao_aprovada
  →  INSERT INTO aluno_has_epi (aluno_id, epi_id, data_entrega = CURRENT_DATE)
```

### Fluxo de cadastro (automático via Auth)

```
supabase.auth.signUp({ options: { data: { role: 'funcionario', ... } } })
  →  INSERT em auth.users
  →  trg_auth_new_funcionario
  →  INSERT em public.funcionario (nome, sobrenome, cpf, email, funcao)

supabase.auth.signUp({ options: { data: { role: 'aluno', ... } } })
  →  INSERT em auth.users
  →  trg_auth_new_aluno
  →  INSERT em public.aluno (nome, sobrenome, cpf, email)
```

> ⚠️ O código aguarda **800ms** após o signUp antes de fazer UPDATE nos campos extras do funcionário. Se o banco estiver lento, aumente esse delay em `registrarFuncionario()` no `useSupabase.js`.

### Tabela de todos os triggers

| Trigger | Tabela | Evento | Função chamada |
|---|---|---|---|
| `trg_funcionario_updated_at` | `funcionario` | BEFORE UPDATE | `fn_set_updated_at()` |
| `trg_epi_updated_at` | `epi` | BEFORE UPDATE | `fn_set_updated_at()` |
| `trg_aluno_updated_at` | `aluno` | BEFORE UPDATE | `fn_set_updated_at()` |
| `trg_turma_updated_at` | `turma` | BEFORE UPDATE | `fn_set_updated_at()` |
| `trg_solicitacoes_updated_at` | `solicitacoes` | BEFORE UPDATE | `fn_set_updated_at()` |
| `trg_funcionario_has_epi_updated_at` | `funcionario_has_epi` | BEFORE UPDATE | `fn_set_updated_at()` |
| `trg_aluno_has_epi_updated_at` | `aluno_has_epi` | BEFORE UPDATE | `fn_set_updated_at()` |
| `trg_auth_new_funcionario` | `auth.users` | AFTER INSERT | `fn_handle_new_funcionario()` |
| `trg_auth_new_aluno` | `auth.users` | AFTER INSERT | `fn_handle_new_aluno()` |
| `trg_decrementa_epi_func` | `funcionario_has_epi` | AFTER INSERT | `fn_epi_decrementa_estoque()` |
| `trg_decrementa_epi_aluno` | `aluno_has_epi` | AFTER INSERT | `fn_epi_decrementa_estoque()` |
| `trg_incrementa_epi_func` | `funcionario_has_epi` | AFTER UPDATE | `fn_epi_incrementa_estoque()` |
| `trg_solicitacao_aprovada` | `solicitacoes` | AFTER UPDATE | `fn_solicitacao_aprovada()` |

---

## 🔐 Autenticação e Perfis

### Perfis de usuário

| Perfil | Identificação | Acesso |
|---|---|---|
| `funcionario` | Linha na tabela `funcionario` com `auth_id` do usuário | Dashboard, EPIs (CRUD), Alunos, Funcionários, Turmas, Locação, Entrega |
| `aluno` | Linha na tabela `aluno` com `auth_id` do usuário | Dashboard, EPIs (só ver), Locação (abrir solicitação), Perfil |
| `admin` | E-mail `gabrielreducinodasilva@gmail.com` hardcoded | Tudo (bypass de todas as verificações) |

### Como o `useAuth` detecta o perfil

```js
// 1. Tenta buscar em 'funcionario' onde auth_id = user.id
// 2. Se não encontrar, busca em 'aluno'
// 3. Monta profile = { ...dados, role: 'funcionario' | 'aluno' }
// isAdmin  = email === ADMIN_EMAIL || profile.role === 'admin'
// isFuncionario = role === 'funcionario' || isAdmin
// isAluno  = role === 'aluno'
```

### Guards de rota

```js
meta: { requiresAuth: true }         // → /login se sem sessão
meta: { requiresAuth: true,
        onlyFuncionario: true }       // → /dashboard se for aluno
```

Rotas protegidas com `onlyFuncionario`: `/entrega`, `/funcionarios`

---

## 🛡️ Row Level Security (RLS)

Funções auxiliares usadas nas políticas:

```sql
-- Checa se o usuário logado (auth.uid()) tem linha na tabela funcionario
public.is_funcionario() RETURNS BOOLEAN

-- Checa se o usuário logado tem linha na tabela aluno
public.is_aluno() RETURNS BOOLEAN
```

Ambas são `SECURITY DEFINER` + `STABLE` — executam com permissões do owner, não do chamador.

### Resumo das políticas por tabela

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `funcionario` | Próprio ou is_funcionario | is_funcionario | Próprio (auth_id) | — |
| `aluno` | Próprio ou is_funcionario | is_funcionario | Próprio (auth_id) | — |
| `epi` | Qualquer autenticado | is_funcionario | is_funcionario | is_funcionario |
| `turma` | Qualquer autenticado | is_funcionario | is_funcionario | is_funcionario |
| `solicitacoes` | Próprio ou is_funcionario | Próprio aluno | is_funcionario | is_funcionario |
| `funcionario_has_epi` | is_funcionario | is_funcionario | is_funcionario | is_funcionario |
| `aluno_has_epi` | Próprio ou is_funcionario | is_funcionario | is_funcionario | is_funcionario |
| `aluno_has_turma` | Próprio ou is_funcionario | is_funcionario | is_funcionario | is_funcionario |

> **"Próprio"** significa que a policy filtra por `auth_id = auth.uid()` ou `aluno_id = (SELECT idaluno FROM aluno WHERE auth_id = auth.uid())`.

---

## 📦 Storage — Bucket `epis-imagens`

- **Tipo:** Público (qualquer um pode ler as URLs)
- **Usado em:** campo `foto` da tabela `epi`
- **Políticas:**
  - SELECT → `USING (bucket_id = 'epis-imagens')` — qualquer um
  - INSERT/UPDATE/DELETE → `is_funcionario()` obrigatório

### Como criar o bucket (se não existir)

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('epis-imagens', 'epis-imagens', true)
ON CONFLICT (id) DO NOTHING;
```

Ou manualmente: **Supabase → Storage → New Bucket → nome: `epis-imagens` → marcar Public**

### `uploadImagemEpi(file)` — fluxo interno

```
1. Upload do arquivo com nome `{timestamp}-{nome_original}`
2. Tenta getPublicUrl → retorna se bucket é público
3. Fallback: createSignedUrl com expiração de 60s
4. Retorna a URL final para salvar no campo epi.foto
```

---

## 🧩 Composable `useSupabase.js` — Referência Completa

### `useAuth()`

```js
const {
  user,            // ref — objeto do auth.users
  profile,         // ref — { ...dados da tabela, role: 'funcionario'|'aluno' }
  loading,         // ref<boolean>
  isAdmin,         // computed<boolean>
  isFuncionario,   // computed<boolean>
  isAluno,         // computed<boolean>
  getCurrentUser,  // async () => { user, profile, isAdmin, isFuncionario, isAluno }
  login,           // async (email, password) => { ok: bool, data? | message? }
  logout,          // async () => void
  registrarAluno,  // async (dados) => { ok: bool, message? }
  registrarFuncionario, // async (dados) => { ok: bool, message? }
} = useAuth()
```

**Campos esperados em `registrarFuncionario(dados)`:**

```js
{
  email: string,
  password: string,
  nome: string,
  sobrenome: string,
  cpf: string,            // ex: "000.000.000-00"
  funcao: string,         // ex: "Instrutor"
  telefone?: string,
  data_nascimento?: string // ex: "1990-05-20"
}
```

**Campos esperados em `registrarAluno(dados)`:**

```js
{
  email: string,
  password: string,
  nome: string,
  sobrenome: string,
  cpf: string
}
```

---

### `useEpis()`

```js
const { epis, loading, listarEpis, criarEpi, atualizarEpi, deletarEpi } = useEpis()

listarEpis({ busca?: string, tipo?: string })
// busca → ilike no campo nome
// tipo  → eq no campo tipo

criarEpi(dados)
// dados: { nome, tipo?, quantidade, disponivel?, data_validade?, codigo_patrimonio?, descricao?, ativo?, foto? }

atualizarEpi(id: string, dados: Partial<Epi>)
deletarEpi(id: string)
```

---

### `useFuncionarios()`

```js
listarFuncionarios(busca?: string)
// busca → OR: nome ilike OU cpf ilike

criarFuncionario(dados)
// dados: campos da tabela funcionario (sem idfuncionario, created_at, updated_at)

atualizarFuncionario(id: string, dados)
deletarFuncionario(id: string)
```

---

### `useAlunos()`

```js
listarAlunos(busca?: string)
// busca → ilike no nome

criarAluno(dados)
atualizarAluno(id: string, dados)
deletarAluno(id: string)
```

---

### `useLocacoes()`

```js
listarLocacoes()
// Retorna solicitacoes com join:
//   epi { nome, foto }
//   aluno { nome, sobrenome }
// Ordenado por data_solicitacao DESC

criarLocacao(dados)
// dados: { aluno_id, epi_id }
// status padrão = 'pendente' (definido pelo banco)
```

---

### `useDashboard()`

```js
carregarDashboard()
// Faz 5 queries paralelas (Promise.all) para:
//   - COUNT total de epis
//   - COUNT epis com disponivel = true
//   - COUNT solicitacoes com status = 'pendente'
//   - COUNT funcionarios com status = 'ativo'
//   - COUNT total de alunos

// stats.value resultado:
{
  totalEpis: number,
  episDisponiveis: number,
  episIndisponiveis: number,   // totalEpis - episDisponiveis
  pendentes: number,
  totalFuncionarios: number,
  totalAlunos: number
}
```

---

### `handle(promise)`

```js
// Helper global que trata erros do Supabase.
// Lança erro se houver, retorna data se não.
const data = await handle(supabase.from('epi').select('*'))
```

---

## 🚀 Build para Produção

```bash
npm run build    # Gera /dist
npm run preview  # Preview local do build
```

---

## 🐛 Problemas Comuns

**"permission denied" ao buscar funcionario/aluno no getCurrentUser:**
As funções `is_funcionario()` e `is_aluno()` precisam ser `SECURITY DEFINER`. Recrie-as com esse atributo no SQL Editor.

**Imagem de EPI não aparece:**
Confirme que o bucket `epis-imagens` está marcado como **público** no Supabase Storage.

**Trigger não criou linha após signUp:**
Verifique se está passando `role: 'funcionario'` ou `role: 'aluno'` dentro de `options.data` no `signUp`. O trigger lê `raw_user_meta_data->>'role'`.

**UPDATE de funcionário falha logo após o registro:**
O código faz `await new Promise(r => setTimeout(r, 800))` para esperar o trigger. Se o banco estiver lento, aumente esse valor em `registrarFuncionario()`.

**Solicitação vai para `entregue` mas `aluno_has_epi` não é criado:**
Verifique se o trigger `trg_solicitacao_aprovada` está ativo e se a função `fn_solicitacao_aprovada` existe. O trigger só dispara quando `NEW.status = 'entregue' AND OLD.status <> 'entregue'`.

**`epi.quantidade` ficou negativo:**
Não insira manualmente em `aluno_has_epi` ou `funcionario_has_epi` sem passar pelo fluxo normal — os triggers decrementam a cada INSERT.

---

<div align="center">

**SAFELOC** — Segurança começa com organização.

*Vue 3 + Supabase + PostgreSQL*

</div>
