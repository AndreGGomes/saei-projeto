import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../actions';
import useTheme from '../hooks/useTheme';
import AuthLayout from '../layouts/AuthLayout';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import { Field, Input } from '../ui/Field';
import { IconeOlho } from '../ui/icons';
import { cx } from '../ui/utils';

const PAPEIS = [
  { id: 'ALUNO', rotulo: 'Aluno', descricao: 'Acompanha aulas e materiais' },
  { id: 'PROFESSOR', rotulo: 'Professor', descricao: 'Envia planos e atividades' },
  { id: 'COORDENADOR', rotulo: 'Coordenação', descricao: 'Gerencia vínculos e equipe' },
];

const VAZIO = { nome: '', email: '', senha: '', confirmarSenha: '', role: 'ALUNO', matricula: '' };

export default function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState(VAZIO);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [erros, setErros] = useState({});
  const { isDarkMode, setTheme } = useTheme();

  const alterar = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErros((prev) => ({ ...prev, [name]: undefined }));
    setErro('');
  };

  // Validação local antes de chamar a API: erros por campo, sem depender do backend.
  const validar = () => {
    const novos = {};
    if (form.nome.trim().length < 3) novos.nome = 'Informe seu nome completo.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) novos.email = 'Informe um e-mail válido.';
    if (form.role === 'ALUNO' && !form.matricula.trim())
      novos.matricula = 'A matrícula é obrigatória para alunos.';
    if (form.senha.length < 6) novos.senha = 'Use pelo menos 6 caracteres.';
    if (form.confirmarSenha !== form.senha) novos.confirmarSenha = 'As senhas não conferem.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (!validar()) return;

    setCarregando(true);
    try {
      await auth.registrar({
        papel: form.role,
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        matricula: form.matricula.trim(),
      });

      navigate('/login', {
        state: { aviso: 'Cadastro realizado com sucesso! Entre com suas credenciais.' },
      });
    } catch (err) {
      console.error(err);
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <AuthLayout isDarkMode={isDarkMode} setTheme={setTheme}>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Criar sua conta
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Escolha o perfil de acesso e preencha os dados institucionais.
          </p>
        </div>

        {erro && (
          <Alert tom="erro" titulo="Não foi possível concluir o cadastro" className="mb-4">
            {erro}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Perfil de acesso */}
          <fieldset>
            <legend className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Perfil de acesso
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Perfil de acesso">
              {PAPEIS.map((papel) => {
                const ativo = form.role === papel.id;
                return (
                  <button
                    key={papel.id}
                    type="button"
                    role="radio"
                    aria-checked={ativo}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, role: papel.id }));
                      setErros((prev) => ({ ...prev, matricula: undefined }));
                    }}
                    className={cx(
                      'rounded-xl border px-3 py-2.5 text-left transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                      ativo
                        ? 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500 dark:border-indigo-500 dark:bg-indigo-950/40'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800/60'
                    )}
                  >
                    <span
                      className={cx(
                        'block text-xs font-semibold',
                        ativo ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'
                      )}
                    >
                      {papel.rotulo}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                      {papel.descricao}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field label="Nome completo" erro={erros.nome} obrigatorio>
            {(props) => (
              <Input
                {...props}
                type="text"
                name="nome"
                autoComplete="name"
                placeholder="Como você aparece no sistema"
                value={form.nome}
                onChange={alterar}
              />
            )}
          </Field>

          <Field label="E-mail institucional" erro={erros.email} obrigatorio>
            {(props) => (
              <Input
                {...props}
                type="email"
                name="email"
                autoComplete="email"
                placeholder="nome@escola.edu.br"
                value={form.email}
                onChange={alterar}
              />
            )}
          </Field>

          {form.role === 'ALUNO' && (
            <Field label="Matrícula escolar" erro={erros.matricula} obrigatorio>
              {(props) => (
                <Input
                  {...props}
                  type="text"
                  name="matricula"
                  inputMode="numeric"
                  placeholder="Ex.: 20260101"
                  value={form.matricula}
                  onChange={alterar}
                />
              )}
            </Field>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Senha" erro={erros.senha} dica="Mínimo de 6 caracteres." obrigatorio>
              {(props) => (
                <div className="relative">
                  <Input
                    {...props}
                    type={mostrarSenha ? 'text' : 'password'}
                    name="senha"
                    autoComplete="new-password"
                    placeholder="Crie uma senha"
                    value={form.senha}
                    onChange={alterar}
                    className={cx(props.className, 'pr-11')}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    aria-label={mostrarSenha ? 'Ocultar senhas' : 'Mostrar senhas'}
                    aria-pressed={mostrarSenha}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <IconeOlho aberto={mostrarSenha} className="h-4 w-4" />
                  </button>
                </div>
              )}
            </Field>

            <Field label="Confirmar senha" erro={erros.confirmarSenha} obrigatorio>
              {(props) => (
                <Input
                  {...props}
                  type={mostrarSenha ? 'text' : 'password'}
                  name="confirmarSenha"
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  value={form.confirmarSenha}
                  onChange={alterar}
                />
              )}
            </Field>
          </div>

          <Button type="submit" tamanho="lg" carregando={carregando} className="w-full">
            {carregando ? 'Cadastrando...' : 'Criar conta'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Já possui conta?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
          >
            Voltar ao login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
