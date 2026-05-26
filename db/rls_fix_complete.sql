-- ============================================================================
-- CORREÇÃO COMPLETA DE RLS PARA SUPABASE
-- Execute TUDO isso no SQL Editor do Supabase (Ctrl+A → Execute)
-- ============================================================================

-- 1. RECRIAR A FUNÇÃO is_funcionario COM SECURITY DEFINER
DROP FUNCTION IF EXISTS public.is_funcionario CASCADE;

CREATE OR REPLACE FUNCTION public.is_funcionario()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.funcionario
    WHERE auth_id = auth.uid()
  );
END;
$$;

-- 2. RECRIAR A FUNÇÃO is_aluno COM SECURITY DEFINER
DROP FUNCTION IF EXISTS public.is_aluno CASCADE;

CREATE OR REPLACE FUNCTION public.is_aluno()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.aluno
    WHERE auth_id = auth.uid()
  );
END;
$$;

-- 3. DELETAR TODAS AS POLÍTICAS ANTIGAS

-- funcionario
DROP POLICY IF EXISTS "funcionario: ver próprio perfil" ON public.funcionario;
DROP POLICY IF EXISTS "funcionario: atualizar próprio perfil" ON public.funcionario;
DROP POLICY IF EXISTS "funcionario: inserir (apenas funcionários)" ON public.funcionario;

-- epi
DROP POLICY IF EXISTS "epi: visualizar (autenticados)" ON public.epi;
DROP POLICY IF EXISTS "epi: gerenciar (apenas funcionários)" ON public.epi;
DROP POLICY IF EXISTS "EPI: Permitir visualizar" ON public.epi;
DROP POLICY IF EXISTS "EPI: Permitir criar" ON public.epi;
DROP POLICY IF EXISTS "EPI: Permitir editar" ON public.epi;
DROP POLICY IF EXISTS "EPI: Permitir deletar" ON public.epi;

-- aluno
DROP POLICY IF EXISTS "aluno: ver perfil" ON public.aluno;
DROP POLICY IF EXISTS "aluno: atualizar próprio perfil" ON public.aluno;
DROP POLICY IF EXISTS "aluno: inserir (apenas funcionários)" ON public.aluno;

-- turma
DROP POLICY IF EXISTS "turma: visualizar (autenticados)" ON public.turma;
DROP POLICY IF EXISTS "turma: gerenciar (apenas funcionários)" ON public.turma;

-- solicitacoes
DROP POLICY IF EXISTS "solicitacoes: ver" ON public.solicitacoes;
DROP POLICY IF EXISTS "solicitacoes: aluno abre" ON public.solicitacoes;
DROP POLICY IF EXISTS "solicitacoes: funcionário gerencia" ON public.solicitacoes;
DROP POLICY IF EXISTS "solicitacoes: funcionário deleta" ON public.solicitacoes;

-- funcionario_has_epi
DROP POLICY IF EXISTS "func_has_epi: ver (funcionários)" ON public.funcionario_has_epi;
DROP POLICY IF EXISTS "func_has_epi: gerenciar (funcionários)" ON public.funcionario_has_epi;

-- aluno_has_epi
DROP POLICY IF EXISTS "aluno_has_epi: ver" ON public.aluno_has_epi;
DROP POLICY IF EXISTS "aluno_has_epi: gerenciar (funcionários)" ON public.aluno_has_epi;

-- aluno_has_turma
DROP POLICY IF EXISTS "aluno_has_turma: ver" ON public.aluno_has_turma;
DROP POLICY IF EXISTS "aluno_has_turma: gerenciar (funcionários)" ON public.aluno_has_turma;

-- 4. RECRIAR POLÍTICAS DE funcionario

CREATE POLICY "funcionario: ver próprio perfil"
  ON public.funcionario FOR SELECT
  USING (auth_id = auth.uid() OR public.is_funcionario());

CREATE POLICY "funcionario: atualizar próprio perfil"
  ON public.funcionario FOR UPDATE
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "funcionario: inserir (apenas funcionários)"
  ON public.funcionario FOR INSERT
  WITH CHECK (public.is_funcionario() OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com');

-- 5. RECRIAR POLÍTICAS DE epi - SIMPLES E FUNCIONAL

CREATE POLICY "epi: visualizar (todos autenticados)"
  ON public.epi FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "epi: inserir (funcionário ou admin)"
  ON public.epi FOR INSERT
  WITH CHECK (
    public.is_funcionario()
    OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com'
  );

CREATE POLICY "epi: atualizar (funcionário ou admin)"
  ON public.epi FOR UPDATE
  USING (
    public.is_funcionario()
    OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com'
  )
  WITH CHECK (
    public.is_funcionario()
    OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com'
  );

CREATE POLICY "epi: deletar (funcionário ou admin)"
  ON public.epi FOR DELETE
  USING (
    public.is_funcionario()
    OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com'
  );

-- 6. RECRIAR POLÍTICAS DE aluno

CREATE POLICY "aluno: ver perfil"
  ON public.aluno FOR SELECT
  USING (auth_id = auth.uid() OR public.is_funcionario());

CREATE POLICY "aluno: atualizar próprio perfil"
  ON public.aluno FOR UPDATE
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "aluno: inserir (funcionário ou admin)"
  ON public.aluno FOR INSERT
  WITH CHECK (public.is_funcionario() OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com');

-- 7. RECRIAR POLÍTICAS DE turma

CREATE POLICY "turma: visualizar (autenticados)"
  ON public.turma FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "turma: gerenciar (funcionário ou admin)"
  ON public.turma FOR ALL
  USING (public.is_funcionario() OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com')
  WITH CHECK (public.is_funcionario() OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com');

-- 8. RECRIAR POLÍTICAS DE solicitacoes

CREATE POLICY "solicitacoes: ver"
  ON public.solicitacoes FOR SELECT
  USING (
    public.is_funcionario()
    OR aluno_id = (SELECT idaluno FROM public.aluno WHERE auth_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "solicitacoes: aluno abre"
  ON public.solicitacoes FOR INSERT
  WITH CHECK (
    aluno_id = (SELECT idaluno FROM public.aluno WHERE auth_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "solicitacoes: funcionário gerencia"
  ON public.solicitacoes FOR UPDATE
  USING (public.is_funcionario() OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com')
  WITH CHECK (public.is_funcionario() OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com');

CREATE POLICY "solicitacoes: funcionário deleta"
  ON public.solicitacoes FOR DELETE
  USING (public.is_funcionario() OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com');

-- 9. RECRIAR POLÍTICAS DE funcionario_has_epi

CREATE POLICY "func_has_epi: ver"
  ON public.funcionario_has_epi FOR SELECT
  USING (public.is_funcionario());

CREATE POLICY "func_has_epi: gerenciar"
  ON public.funcionario_has_epi FOR ALL
  USING (public.is_funcionario() OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com')
  WITH CHECK (public.is_funcionario() OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com');

-- 10. RECRIAR POLÍTICAS DE aluno_has_epi

CREATE POLICY "aluno_has_epi: ver"
  ON public.aluno_has_epi FOR SELECT
  USING (
    public.is_funcionario()
    OR aluno_id = (SELECT idaluno FROM public.aluno WHERE auth_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "aluno_has_epi: gerenciar"
  ON public.aluno_has_epi FOR ALL
  USING (public.is_funcionario() OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com')
  WITH CHECK (public.is_funcionario() OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com');

-- 11. RECRIAR POLÍTICAS DE aluno_has_turma

CREATE POLICY "aluno_has_turma: ver"
  ON public.aluno_has_turma FOR SELECT
  USING (
    public.is_funcionario()
    OR aluno_id = (SELECT idaluno FROM public.aluno WHERE auth_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "aluno_has_turma: gerenciar"
  ON public.aluno_has_turma FOR ALL
  USING (public.is_funcionario() OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com')
  WITH CHECK (public.is_funcionario() OR (auth.jwt() ->> 'email') = 'gabrielreducinodasilva@gmail.com');

-- 12. CONFIRMAR QUE RLS ESTÁ HABILITADO EM TODAS AS TABELAS
ALTER TABLE public.funcionario       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epi               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aluno             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turma             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionario_has_epi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aluno_has_epi     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aluno_has_turma   ENABLE ROW LEVEL SECURITY;

-- FIM DO SCRIPT DE RLS
-- ============================================================================
-- PRÓXIMOS PASSOS:
-- 1. Cole este script inteiro no SQL Editor do Supabase
-- 2. Execute tudo (Ctrl+A → Execute ou botão "Execute")
-- 3. Verifique se não houve erros
-- 4. Recarregue a página do aplicativo (F5)
-- ============================================================================
