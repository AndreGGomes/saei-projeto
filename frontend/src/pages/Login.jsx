import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', role: 'professor' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulação de redirecionamento de acordo com o papel escolhido
    if (formData.role === 'coordenador') {
      navigate('/coordenador/dashboard');
    } else if (formData.role === 'professor') {
      alert('Login como Professor efetuado (Painel será desenvolvido nas próximas sprints)');
    } else {
      alert('Login como Aluno efetuado (Painel será desenvolvido na Sprint 3)');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-blue-900">SAEI</h1>
          <p className="mt-1 text-sm text-slate-500">Sistema de Apoio à Educação Inclusiva</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Perfil de Acesso</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="coordenador">Coordenador Pedagógico</option>
              <option value="professor">Professor</option>
              <option value="aluno">Aluno</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">E-mail institucional</label>
            <input
              type="email"
              name="email"
              required
              placeholder="seuemail@escola.edu.br"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Senha</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700"
          >
            Entrar no Sistema
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