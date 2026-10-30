import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../actions';
import useTheme from '../hooks/useTheme';
import AuthLayout from '../layouts/AuthLayout';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import { Field, Input } from '../ui/Field';
import { IconeOlho, IconeSeta } from '../ui/icons';
import { cx } from '../ui/utils';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const { isDarkMode, setTheme } = useTheme();

  // Mensagem vinda do cadastro (ex.: conta criada com sucesso)
  const aviso = location.state?.aviso;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const usuario = await auth.entrar(identificador, senha);

      if (usuario.role === 'COORDENADOR') {
        navigate('/coordenador/dashboard');
      } else if (usuario.role === 'PROFESSOR') {
        navigate('/professor/dashboard');
      } else if (usuario.role === 'ALUNO') {
        navigate('/aluno/dashboard');
      } else {
        setErro('Perfil de usuário não reconhecido pelo sistema.');
      }
    } catch (err) {
      console.error('Erro de autenticação:', err);
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <AuthLayout isDarkMode={isDarkMode} setTheme={setTheme}>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Entrar na sua conta
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Use o e-mail institucional ou o número de matrícula.
          </p>
        </div>

        {aviso && !erro && (
          <Alert tom="sucesso" className="mb-4">
            {aviso}
          </Alert>
        )}

        {erro && (
          <Alert tom="erro" titulo="Não foi possível entrar" className="mb-4">
            {erro}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field label="E-mail ou matrícula" obrigatorio>
            {(props) => (
              <Input
                {...props}
                type="text"
                autoComplete="username"
                autoFocus
                placeholder="nome@escola.edu.br ou 20260101"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                required
              />
            )}
          </Field>

          <Field label="Senha" obrigatorio>
            {(props) => (
              <div className="relative">
                <Input
                  {...props}
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={cx(props.className, 'pr-11')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={mostrarSenha}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-slate-200"
                >
                  <IconeOlho aberto={mostrarSenha} className="h-4 w-4" />
                </button>
              </div>
            )}
          </Field>

          <Button
            type="submit"
            tamanho="lg"
            carregando={carregando}
            iconeDireita={<IconeSeta className="h-4 w-4" />}
            className="w-full"
          >
            {carregando ? 'Entrando...' : 'Entrar no sistema'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Ainda não tem conta?{' '}
          <Link
            to="/cadastro"
            className="font-semibold text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
          >
            Cadastre-se
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-[11px] text-slate-400 dark:text-slate-500">
        Acesso restrito a estudantes, professores e coordenação pedagógica.
      </p>
    </AuthLayout>
  );
}
