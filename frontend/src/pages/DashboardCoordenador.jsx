import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardCoordenador() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Disciplinas alinhadas com o back (apenas nome e código)
  const [disciplinas, setDisciplinas] = useState([
    { id: 1, nome: 'Matemática Adaptada', codigo: 'MAT-01' },
    { id: 2, nome: 'Língua Portuguesa e LIBRAS', codigo: 'POR-01' },
  ]);
  const [novaDisciplina, setNovaDisciplina] = useState({ nome: '', codigo: '' });

  // Matrículas alinhadas com os modelos e schemas da PR 14
  const [matriculas, setMatriculas] = useState([
    {
      id: 1,
      aluno: { nome: 'Lucas Gabriel', matricula: '20260101' },
      professor: { nome: 'Prof. Carlos Silva', email: 'carlos.silva@escola.edu.br' },
      disciplina: { nome: 'Matemática Adaptada', codigo: 'MAT-01' },
    },
  ]);
  const [novaMatricula, setNovaMatricula] = useState({
    aluno_matricula: '',
    professor_email: '',
    disciplina_codigo: '',
  });

  // Modal para mudar professor da matrícula (PATCH /matriculas/{id}/mudar-professor)
  const [matriculaEditando, setMatriculaEditando] = useState(null);
  const [novoProfessorEmail, setNovoProfessorEmail] = useState('');

  // Handler de Disciplina (POST /disciplinas/)
  const handleAddDisciplina = (e) => {
    e.preventDefault();
    if (!novaDisciplina.nome || !novaDisciplina.codigo) return;

    if (disciplinas.some((d) => d.codigo.toUpperCase() === novaDisciplina.codigo.toUpperCase())) {
      alert('Já existe uma disciplina com este código.');
      return;
    }

    setDisciplinas([
      ...disciplinas,
      {
        id: Date.now(),
        nome: novaDisciplina.nome,
        codigo: novaDisciplina.codigo.toUpperCase(),
      },
    ]);
    setNovaDisciplina({ nome: '', codigo: '' });
  };

  // Handler de Matrícula (POST /matriculas/criar)
  const handleAddMatricula = (e) => {
    e.preventDefault();
    if (!novaMatricula.aluno_matricula || !novaMatricula.professor_email || !novaMatricula.disciplina_codigo) {
      alert('Preencha todos os campos da matrícula.');
      return;
    }

    // Valida duplicidade como o back faz
    const duplicada = matriculas.some(
      (m) =>
        m.aluno.matricula === novaMatricula.aluno_matricula &&
        m.disciplina.codigo === novaMatricula.disciplina_codigo.toUpperCase()
    );

    if (duplicada) {
      alert('Este aluno já está matriculado nesta disciplina.');
      return;
    }

    const disciplinaObj = disciplinas.find(
      (d) => d.codigo.toUpperCase() === novaMatricula.disciplina_codigo.toUpperCase()
    );

    const nova = {
      id: Date.now(),
      aluno: {
        nome: `Aluno (Matrícula: ${novaMatricula.aluno_matricula})`,
        matricula: novaMatricula.aluno_matricula,
      },
      professor: {
        nome: novaMatricula.professor_email.split('@')[0],
        email: novaMatricula.professor_email.toLowerCase(),
      },
      disciplina: {
        nome: disciplinaObj ? disciplinaObj.nome : 'Disciplina Selecionada',
        codigo: novaMatricula.disciplina_codigo.toUpperCase(),
      },
    };

    setMatriculas([...matriculas, nova]);
    setNovaMatricula({ aluno_matricula: '', professor_email: '', disciplina_codigo: '' });
  };

  // Handler de Troca de Professor (PATCH /matriculas/{id}/mudar-professor)
  const handleMudarProfessor = (e) => {
    e.preventDefault();
    if (!novoProfessorEmail) return;

    setMatriculas(
      matriculas.map((m) => {
        if (m.id === matriculaEditando.id) {
          return {
            ...m,
            professor: {
              nome: novoProfessorEmail.split('@')[0],
              email: novoProfessorEmail.toLowerCase(),
            },
          };
        }
        return m;
      })
    );

    setMatriculaEditando(null);
    setNovoProfessorEmail('');
  };

  // Handler de Cancelar Matrícula (DELETE /matriculas/{id})
  const handleDeletarMatricula = (id) => {
    if (confirm('Tem certeza que deseja cancelar esta matrícula?')) {
      setMatriculas(matriculas.filter((m) => m.id !== id));
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Topo */}
      <header className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-xl font-bold">SAEI — Painel da Coordenação Pedagógica</h1>
          <p className="text-xs text-blue-200">Gestão Inclusiva e Matrículas</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          Sair do Sistema
        </button>
      </header>

      {/* Abas */}
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
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('disciplinas')}
            className={`pb-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'disciplinas'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Disciplinas
          </button>
          <button
            onClick={() => setActiveTab('matriculas')}
            className={`pb-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'matriculas'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Matrículas e Vínculos
          </button>
        </nav>
      </div>

      {/* Conteúdo */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* ABA 1: VISÃO GERAL */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Indicadores Acadêmicos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
                <p className="text-sm font-medium text-slate-500">Disciplinas Cadastradas</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-2">{disciplinas.length}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-500">
                <p className="text-sm font-medium text-slate-500">Total de Matrículas Ativas</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-2">{matriculas.length}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow border-l-4 border-purple-500">
                <p className="text-sm font-medium text-slate-500">Acompanhamento e Tutoria</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-2">Ativo</p>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: DISCIPLINAS (UC06) */}
        {activeTab === 'disciplinas' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Disciplinas</h2>

            <form onSubmit={handleAddDisciplina} className="bg-white p-6 rounded-xl shadow space-y-4">
              <h3 className="text-lg font-bold text-slate-700">Cadastrar Nova Disciplina</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome da Disciplina (ex: História Adaptada)"
                  value={novaDisciplina.nome}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, nome: e.target.value })}
                  className="border p-2.5 rounded-lg text-sm w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Código Único (ex: HIS-01)"
                  value={novaDisciplina.codigo}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, codigo: e.target.value })}
                  className="border p-2.5 rounded-lg text-sm w-full"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700"
              >
                Salvar Disciplina
              </button>
            </form>

            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                  <tr>
                    <th className="p-4">Código</th>
                    <th className="p-4">Nome da Disciplina</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {disciplinas.map((disc) => (
                    <tr key={disc.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono font-bold text-blue-600">{disc.codigo}</td>
                      <td className="p-4 font-medium text-slate-800">{disc.nome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: MATRÍCULAS E VÍNCULOS (ALINHADO À PR 14) */}
        {activeTab === 'matriculas' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Matrículas e Vínculos Acadêmicos</h2>

            <form onSubmit={handleAddMatricula} className="bg-white p-6 rounded-xl shadow space-y-4">
              <h3 className="text-lg font-bold text-slate-700">Nova Matrícula (Aluno + Professor + Matéria)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Matrícula do Aluno</label>
                  <input
                    type="text"
                    placeholder="Ex: 20260101"
                    value={novaMatricula.aluno_matricula}
                    onChange={(e) => setNovaMatricula({ ...novaMatricula, aluno_matricula: e.target.value })}
                    className="border p-2.5 rounded-lg text-sm w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail do Professor</label>
                  <input
                    type="email"
                    placeholder="Ex: professor@escola.edu.br"
                    value={novaMatricula.professor_email}
                    onChange={(e) => setNovaMatricula({ ...novaMatricula, professor_email: e.target.value })}
                    className="border p-2.5 rounded-lg text-sm w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Disciplina</label>
                  <select
                    value={novaMatricula.disciplina_codigo}
                    onChange={(e) => setNovaMatricula({ ...novaMatricula, disciplina_codigo: e.target.value })}
                    className="border p-2.5 rounded-lg text-sm w-full"
                    required
                  >
                    <option value="">Selecione pelo código</option>
                    {disciplinas.map((d) => (
                      <option key={d.id} value={d.codigo}>
                        {d.codigo} — {d.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-green-700"
              >
                Efetivar Matrícula
              </button>
            </form>

            {/* Listagem de Matrículas */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                  <tr>
                    <th className="p-4">Aluno</th>
                    <th className="p-4">Disciplina</th>
                    <th className="p-4">Professor Responsável</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {matriculas.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{m.aluno.nome}</p>
                        <p className="text-xs text-slate-400 font-mono">Matrícula: {m.aluno.matricula}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-mono bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-bold mr-2">
                          {m.disciplina.codigo}
                        </span>
                        <span className="font-medium text-slate-700">{m.disciplina.nome}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-800">{m.professor.nome}</p>
                        <p className="text-xs text-slate-400">{m.professor.email}</p>
                      </td>
                      <td className="p-4 text-center space-x-3">
                        <button
                          onClick={() => {
                            setMatriculaEditando(m);
                            setNovoProfessorEmail(m.professor.email);
                          }}
                          className="text-blue-600 hover:underline text-xs font-semibold"
                        >
                          Mudar Professor
                        </button>
                        <button
                          onClick={() => handleDeletarMatricula(m.id)}
                          className="text-red-500 hover:underline text-xs font-semibold"
                        >
                          Cancelar Matrícula
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal para Troca Parcial de Professor (PATCH) */}
      {matriculaEditando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Alterar Professor Responsável</h3>
            <p className="text-sm text-slate-600">
              Matrícula do aluno: <strong>{matriculaEditando.aluno.matricula}</strong> ({matriculaEditando.disciplina.codigo})
            </p>

            <form onSubmit={handleMudarProfessor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Novo E-mail do Professor</label>
                <input
                  type="email"
                  required
                  value={novoProfessorEmail}
                  onChange={(e) => setNovoProfessorEmail(e.target.value)}
                  placeholder="novo.professor@escola.edu.br"
                  className="border p-2.5 rounded-lg text-sm w-full"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setMatriculaEditando(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Atualizar Professor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}