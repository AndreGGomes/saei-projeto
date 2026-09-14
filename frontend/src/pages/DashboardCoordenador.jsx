import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardCoordenador() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Estados simulados para UC06 (Disciplinas)
  const [disciplinas, setDisciplinas] = useState([
    { id: 1, nome: 'Matemática Adaptada', codigo: 'MAT-01', cargaHoraria: '60h' },
    { id: 2, nome: 'Língua Portuguesa e LIBRAS', codigo: 'POR-01', cargaHoraria: '80h' },
  ]);
  const [novaDisciplina, setNovaDisciplina] = useState({ nome: '', codigo: '', cargaHoraria: '' });

  // Estados simulados para UC07 (Turmas e Vínculos)
  const [turmas, setTurmas] = useState([
    { id: 1, nome: 'Turma 6º Ano A', disciplina: 'Matemática Adaptada', professor: 'Prof. Carlos Silva', alunosCount: 15 },
  ]);
  const [novaTurma, setNovaTurma] = useState({ nome: '', disciplina: '', professor: '' });

  // Handlers para UC06
  const handleAddDisciplina = (e) => {
    e.preventDefault();
    if (!novaDisciplina.nome || !novaDisciplina.codigo) return;
    setDisciplinas([...disciplinas, { ...novaDisciplina, id: Date.now() }]);
    setNovaDisciplina({ nome: '', codigo: '', cargaHoraria: '' });
  };

  // Handlers para UC07
  const handleAddTurma = (e) => {
    e.preventDefault();
    if (!novaTurma.nome || !novaTurma.disciplina) return;
    setTurmas([...turmas, { ...novaTurma, id: Date.now(), alunosCount: 0 }]);
    setNovaTurma({ nome: '', disciplina: '', professor: '' });
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar Superior */}
      <header className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-xl font-bold">SAEI — Painel da Coordenação Pedagógica</h1>
          <p className="text-xs text-blue-200">Gestão Inclusiva e Acompanhamento</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          Sair do Sistema
        </button>
      </header>

      {/* Menu de Navegação por Abas */}
      <div className="bg-white border-b border-slate-200 px-6 pt-4">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Visão Geral (UC08)
          </button>
          <button
            onClick={() => setActiveTab('disciplinas')}
            className={`pb-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'disciplinas'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Gestão de Disciplinas (UC06)
          </button>
          <button
            onClick={() => setActiveTab('turmas')}
            className={`pb-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'turmas'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Turmas e Vínculos (UC07)
          </button>
        </nav>
      </div>

      {/* Conteúdo das Abas */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* ABA 1: VISÃO GERAL (UC08) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Painel Geral da Coordenação</h2>
            
            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
                <p className="text-sm font-medium text-slate-500">Total de Disciplinas</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-2">{disciplinas.length}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-500">
                <p className="text-sm font-medium text-slate-500">Turmas Ativas</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-2">{turmas.length}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow border-l-4 border-purple-500">
                <p className="text-sm font-medium text-slate-500">Alunos Atendidos</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-2">15</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow border-l-4 border-amber-500">
                <p className="text-sm font-medium text-slate-500">PEIs em Acompanhamento</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-2">4</p>
              </div>
            </div>

            {/* Quadro de Informações Rápidas */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-lg font-bold text-slate-800 mb-3">Status dos Planos de Ensino Individualizado (PEI)</h3>
              <p className="text-slate-600 text-sm">
                Nesta seção, o coordenador acompanha os PEIs em elaboração e pendentes de validação técnica.
              </p>
            </div>
          </div>
        )}

        {/* ABA 2: GESTÃO DE DISCIPLINAS (UC06) */}
        {activeTab === 'disciplinas' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Cadastro e Gestão de Disciplinas</h2>
            
            {/* Form de Cadastro */}
            <form onSubmit={handleAddDisciplina} className="bg-white p-6 rounded-xl shadow space-y-4">
              <h3 className="text-lg font-bold text-slate-700">Nova Disciplina</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nome da Disciplina"
                  value={novaDisciplina.nome}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, nome: e.target.value })}
                  className="border p-2.5 rounded-lg text-sm w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Código (ex: MAT-01)"
                  value={novaDisciplina.codigo}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, codigo: e.target.value })}
                  className="border p-2.5 rounded-lg text-sm w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Carga Horária (ex: 60h)"
                  value={novaDisciplina.cargaHoraria}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, cargaHoraria: e.target.value })}
                  className="border p-2.5 rounded-lg text-sm w-full"
                />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700">
                Cadastrar Disciplina
              </button>
            </form>

            {/* Tabela de Listagem */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                  <tr>
                    <th className="p-4">Código</th>
                    <th className="p-4">Nome da Disciplina</th>
                    <th className="p-4">Carga Horária</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {disciplinas.map((disc) => (
                    <tr key={disc.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono font-bold text-blue-600">{disc.codigo}</td>
                      <td className="p-4 font-medium text-slate-800">{disc.nome}</td>
                      <td className="p-4">{disc.cargaHoraria}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: TURMAS E VÍNCULOS (UC07) */}
        {activeTab === 'turmas' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Criação de Turmas e Vinculação Pedagógica</h2>
            
            {/* Form de Cadastro de Turma */}
            <form onSubmit={handleAddTurma} className="bg-white p-6 rounded-xl shadow space-y-4">
              <h3 className="text-lg font-bold text-slate-700">Criar Nova Turma</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nome da Turma (ex: 7º Ano B)"
                  value={novaTurma.nome}
                  onChange={(e) => setNovaTurma({ ...novaTurma, nome: e.target.value })}
                  className="border p-2.5 rounded-lg text-sm w-full"
                  required
                />
                <select
                  value={novaTurma.disciplina}
                  onChange={(e) => setNovaTurma({ ...novaTurma, disciplina: e.target.value })}
                  className="border p-2.5 rounded-lg text-sm w-full"
                  required
                >
                  <option value="">Selecione a Disciplina</option>
                  {disciplinas.map((d) => (
                    <option key={d.id} value={d.nome}>{d.nome}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Nome do Professor Responsável"
                  value={novaTurma.professor}
                  onChange={(e) => setNovaTurma({ ...novaTurma, professor: e.target.value })}
                  className="border p-2.5 rounded-lg text-sm w-full"
                  required
                />
              </div>
              <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-green-700">
                Vincular e Salvar Turma
              </button>
            </form>

            {/* Tabela de Turmas */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                  <tr>
                    <th className="p-4">Turma</th>
                    <th className="p-4">Disciplina Vinculada</th>
                    <th className="p-4">Professor</th>
                    <th className="p-4">Alunos Vinculados</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {turmas.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-800">{t.nome}</td>
                      <td className="p-4 text-blue-600 font-medium">{t.disciplina}</td>
                      <td className="p-4">{t.professor}</td>
                      <td className="p-4">{t.alunosCount} alunos</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}