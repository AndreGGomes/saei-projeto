import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Cadastro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'ALUNO', // Alinhado aos enums do back: ALUNO, PROFESSOR, COORDENADOR
    matricula: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.role === 'ALUNO' && !formData.matricula.trim()) {
      alert('A matrícula é obrigatória para cadastro de alunos.');
      return;
    }

    alert(`Conta de ${formData.role} registrada com sucesso! Faça seu login.`);
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-blue-900">SAEI</h1>
          <p className="mt-1 text-sm text-slate-500">Criar nova conta de usuário</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nome Completo</label>
            <input
              type="text"
              name="nome"
              required
              placeholder="Digite seu nome completo"
              value={formData.nome}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Papel de Acesso</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALUNO">Aluno</option>
              <option value="PROFESSOR">Professor</option>
              <option value="COORDENADOR">Coordenador Pedagógico</option>
            </select>
          </div>

          {/* Campo condicional: Obrigatório apenas para alunos */}
          {formData.role === 'ALUNO' && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Matrícula Escolar</label>
              <input
                type="text"
                name="matricula"
                required
                placeholder="Ex: 20260199"
                value={formData.matricula}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">E-mail</label>
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
              name="senha"
              required
              placeholder="Crie uma senha forte"
              value={formData.senha}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white transition hover:bg-green-700"
          >
            Cadastrar Conta
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Já possui conta?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Voltar ao Login
          </Link>
        </p>
      </div>
    </div>
  );
}
