import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useTheme from '../hooks/useTheme';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const navigate = useNavigate();
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  // Tema (dark/light) compartilhado via hook
  const { isDarkMode, setTheme } = useTheme();

  // Submissão do formulário de autenticação
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // O OAuth2 do FastAPI espera os dados no padrão application/x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append('username', identificador.trim());
      params.append('password', password);

      const response = await api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      // Salva o token JWT no navegador
      const token = response.data.access_token;
      localStorage.setItem('token', token);

      // Consulta o usuário logado para obter seu papel (role) e matrícula
      const userRes = await api.get('/auth/me');
      const user = userRes.data;
      localStorage.setItem('user', JSON.stringify(user));

      // Redireciona o usuário para seu respectivo painel
      if (user.role === 'COORDENADOR') {
        navigate('/coordenador/dashboard');
      } else if (user.role === 'PROFESSOR') {
        navigate('/professor/dashboard');
      } else if (user.role === 'ALUNO') {
        navigate('/aluno/dashboard');
      } else {
        setErro('Perfil de usuário não reconhecido pelo sistema.');
      }
    } catch (err) {
      console.error('Erro de autenticação:', err);
      const msg = err.response?.data?.detail || 'Erro ao conectar com o servidor.';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      {/* Seletor de Tema (Sol e Lua) */}
      <div className="absolute top-6 right-6">
        <ThemeToggle isDarkMode={isDarkMode} setTheme={setTheme} variant="login" />
      </div>

      {/* Cartão de Login */}
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-blue-900 dark:text-blue-400">SAEI</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sistema de Apoio à Educação Inclusiva</p>
        </div>

        {/* Mensagem de Erro */}
        {erro && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
            {erro}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              E-mail ou Matrícula
            </label>
            <input
              type="text"
              required
              placeholder="Digite seu e-mail ou matrícula"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Senha
            </label>
            <div className="relative mt-1">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 pr-10 text-sm text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                tabIndex="-1"
              >
                {mostrarSenha ? (
                  /* Olho Aberto */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  /* Olho Fechado */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2.5 font-semibold text-white transition disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}