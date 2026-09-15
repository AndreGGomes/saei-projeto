import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // 1. O OAuth2 do FastAPI exige dados em formato x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append('username', identificador.trim());
      params.append('password', password);

      const response = await api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      // 2. Salva o Token JWT
      const token = response.data.access_token;
      localStorage.setItem('token', token);

      // 3. Busca os dados de quem acabou de logar
      const userRes = await api.get('/auth/me');
      const user = userRes.data;
      localStorage.setItem('user', JSON.stringify(user));

      // 4. Redireciona conforme a permissão
      if (user.role === 'COORDENADOR') {
        navigate('/coordenador/dashboard');
      } else if (user.role === 'PROFESSOR') {
        alert(`Bem-vindo, Prof. ${user.nome}! (Painel do professor em desenvolvimento)`);
      } else {
        alert(`Bem-vindo, ${user.nome}! (Painel do aluno em desenvolvimento)`);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Erro ao conectar com o servidor.';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-blue-900">SAEI</h1>
          <p className="mt-1 text-sm text-slate-500">Sistema de Apoio à Educação Inclusiva</p>
        </div>

        {erro && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">E-mail ou Matrícula</label>
            <input
              type="text"
              required
              placeholder="Digite seu e-mail ou matrícula de aluno"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Senha</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-semibold text-blue-600 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}