import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function DashboardCoordenador() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Estados com dados reais
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Formulários de cadastro
  const [novaDisciplina, setNovaDisciplina] = useState({ nome: '', codigo: '' });
  const [novaMatricula, setNovaMatricula] = useState({
    aluno_matricula: '',
    professor_email: '',
    disciplina_codigo: '',
  });

  // Modal para editar nome de disciplina
  const [disciplinaEditando, setDisciplinaEditando] = useState(null);
  const [novoNomeDisciplina, setNovoNomeDisciplina] = useState('');

  // Modal para trocar professor da matrícula
  const [matriculaEditando, setMatriculaEditando] = useState(null);
  const [novoProfessorEmail, setNovoProfessorEmail] = useState('');

  // 1. CARREGAR DADOS DO BANCO
  const carregarDadosDoBanco = async () => {
    try {
      setLoading(true);
      setErro('');

      const [resDisciplinas, resProfessores, resMatriculas] = await Promise.all([
        api.get('/disciplinas/'),
        api.get('/auth/professores'),
        api.get('/matriculas/'),
      ]);

      setDisciplinas(resDisciplinas.data);
      setProfessores(resProfessores.data);
      setMatriculas(resMatriculas.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('Sessão expirada. Faça login novamente.');
        handleLogout();
        return;
      }
      setErro('Não foi possível carregar os dados do servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosDoBanco();
  }, []);

  // 2. CADASTRAR DISCIPLINA (POST /disciplinas/criar)
  const handleAddDisciplina = async (e) => {
    e.preventDefault();
    try {
      await api.post('/disciplinas/criar', {
        nome: novaDisciplina.nome.trim(),
        codigo: novaDisciplina.codigo.trim().toUpperCase(),
      });
      setNovaDisciplina({ nome: '', codigo: '' });
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao cadastrar disciplina.');
    }
  };

  // 3. EDITAR NOME DA DISCIPLINA (PATCH /disciplinas/{codigo}/nome)
  const handleEditarNomeDisciplina = async (e) => {
    e.preventDefault();
    if (!novoNomeDisciplina.trim()) return;

    try {
      await api.patch(`/disciplinas/${disciplinaEditando.codigo}/nome`, {
        novo_nome: novoNomeDisciplina.trim(),
      });
      setDisciplinaEditando(null);
      setNovoNomeDisciplina('');
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao atualizar nome da disciplina.');
    }
  };

  // 4. DELETAR DISCIPLINA PELO CÓDIGO (DELETE /disciplinas/{codigo})
  const handleDeletarDisciplina = async (codigo) => {
    if (!confirm(`Atenção: Ao excluir a disciplina ${codigo}, todas as matrículas ligadas a ela também serão canceladas. Deseja continuar?`)) {
      return;
    }

    try {
      await api.delete(`/disciplinas/${codigo}`);
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao excluir disciplina.');
    }
  };

  // 5. EFETIVAR MATRÍCULA (POST /matriculas/criar)
  const handleAddMatricula = async (e) => {
    e.preventDefault();
    try {
      await api.post('/matriculas/criar', {
        aluno_matricula: novaMatricula.aluno_matricula.trim(),
        professor_email: novaMatricula.professor_email,
        disciplina_codigo: novaMatricula.disciplina_codigo,
      });
      setNovaMatricula({ aluno_matricula: '', professor_email: '', disciplina_codigo: '' });
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao efetivar matrícula.');
    }
  };

  // 6. MUDAR PROFESSOR DA MATRÍCULA (PATCH /matriculas/{id}/mudar-professor)
  const handleMudarProfessor = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/matriculas/${matriculaEditando.id}/mudar-professor`, {
        novo_professor_email: novoProfessorEmail,
      });
      setMatriculaEditando(null);
      setNovoProfessorEmail('');
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao mudar professor.');
    }
  };

  // 7. CANCELAR MATRÍCULA (DELETE /matriculas/{id})
  const handleDeletarMatricula = async (id) => {
    if (!confirm('Deseja realmente cancelar esta matrícula?')) return;
    try {
      await api.delete(`/matriculas/${id}`);
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao cancelar matrícula.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-xl font-bold">SAEI — Painel da Coordenação Pedagógica</h1>
          <p className="text-xs text-blue-200">Gestão Inclusiva e Acompanhamento</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={carregarDadosDoBanco}
            className="text-xs bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded transition border border-blue-600"
          >
            🔄 Atualizar Dados
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Sair
          </button>
        </div>
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
            Disciplinas ({disciplinas.length})
          </button>
          <button
            onClick={() => setActiveTab('professores')}
            className={`pb-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'professores'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Professores ({professores.length})
          </button>
          <button
            onClick={() => setActiveTab('matriculas')}
            className={`pb-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'matriculas'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Matrículas ({matriculas.length})
          </button>
        </nav>
      </div>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {loading && (
          <div className="bg-white rounded-xl p-8 text-center text-slate-500 shadow">
            <p className="animate-pulse font-medium">Buscando dados no PostgreSQL...</p>
          </div>
        )}

        {erro && !loading && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {erro}
          </div>
        )}

        {/* 1. VISÃO GERAL */}
        {!loading && activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Painel Geral de Indicadores</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
                <p className="text-sm font-medium text-slate-500">Disciplinas Cadastradas</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-2">{disciplinas.length}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow border-l-4 border-purple-500">
                <p className="text-sm font-medium text-slate-500">Professores Registrados</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-2">{professores.length}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-500">
                <p className="text-sm font-medium text-slate-500">Matrículas Ativas</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-2">{matriculas.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. DISCIPLINAS (EDIÇÃO DE NOME E DELEÇÃO POR CÓDIGO) */}
        {!loading && activeTab === 'disciplinas' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Disciplinas</h2>

            {/* Form de Cadastro */}
            <form onSubmit={handleAddDisciplina} className="bg-white p-6 rounded-xl shadow space-y-4">
              <h3 className="text-lg font-bold text-slate-700">Cadastrar Nova Disciplina</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome da Disciplina (ex: Geografia Inclusiva)"
                  value={novaDisciplina.nome}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, nome: e.target.value })}
                  className="border p-2.5 rounded-lg text-sm w-full focus:outline-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Código Único (ex: GEO-01)"
                  value={novaDisciplina.codigo}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, codigo: e.target.value })}
                  className="border p-2.5 rounded-lg text-sm w-full focus:outline-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition"
              >
                Salvar Disciplina no Banco
              </button>
            </form>

            {/* Tabela com Ações */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                  <tr>
                    <th className="p-4">Código</th>
                    <th className="p-4">Nome da Disciplina</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {disciplinas.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-6 text-center text-slate-400">
                        Nenhuma disciplina cadastrada no banco.
                      </td>
                    </tr>
                  ) : (
                    disciplinas.map((disc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-mono font-bold text-blue-600">{disc.codigo}</td>
                        <td className="p-4 font-medium text-slate-800">{disc.nome}</td>
                        <td className="p-4 text-center space-x-3">
                          {/* Botão de Editar Nome */}
                          <button
                            onClick={() => {
                              setDisciplinaEditando(disc);
                              setNovoNomeDisciplina(disc.nome);
                            }}
                            className="text-blue-600 hover:underline text-xs font-semibold"
                          >
                            Editar Nome
                          </button>
                          {/* Botão de Deletar pelo Código */}
                          <button
                            onClick={() => handleDeletarDisciplina(disc.codigo)}
                            className="text-red-500 hover:underline text-xs font-semibold"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. CORPO DOCENTE */}
        {!loading && activeTab === 'professores' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Corpo Docente Registrado</h2>
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                  <tr>
                    <th className="p-4">Nome do Docente</th>
                    <th className="p-4">E-mail Institucional</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {professores.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="p-6 text-center text-slate-400">
                        Nenhum professor registrado no sistema.
                      </td>
                    </tr>
                  ) : (
                    professores.map((prof, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-bold text-slate-800">{prof.nome}</td>
                        <td className="p-4 font-mono text-slate-600">{prof.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. MATRÍCULAS */}
        {!loading && activeTab === 'matriculas' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Matrículas e Vínculos Escolares</h2>

            <form onSubmit={handleAddMatricula} className="bg-white p-6 rounded-xl shadow space-y-4">
              <h3 className="text-lg font-bold text-slate-700">Nova Matrícula</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Matrícula do Aluno</label>
                  <input
                    type="text"
                    placeholder="Ex: 20260101"
                    value={novaMatricula.aluno_matricula}
                    onChange={(e) => setNovaMatricula({ ...novaMatricula, aluno_matricula: e.target.value })}
                    className="border p-2.5 rounded-lg text-sm w-full focus:outline-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Professor Responsável</label>
                  <select
                    value={novaMatricula.professor_email}
                    onChange={(e) => setNovaMatricula({ ...novaMatricula, professor_email: e.target.value })}
                    className="border p-2.5 rounded-lg text-sm w-full focus:outline-blue-500"
                    required
                  >
                    <option value="">Selecione o professor</option>
                    {professores.map((p, idx) => (
                      <option key={idx} value={p.email}>
                        {p.nome} ({p.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Disciplina</label>
                  <select
                    value={novaMatricula.disciplina_codigo}
                    onChange={(e) => setNovaMatricula({ ...novaMatricula, disciplina_codigo: e.target.value })}
                    className="border p-2.5 rounded-lg text-sm w-full focus:outline-blue-500"
                    required
                  >
                    <option value="">Selecione a disciplina</option>
                    {disciplinas.map((d, idx) => (
                      <option key={idx} value={d.codigo}>
                        {d.codigo} — {d.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 transition"
              >
                Efetivar Matrícula no Banco
              </button>
            </form>

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
                  {matriculas.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-slate-400">
                        Nenhuma matrícula registrada no banco.
                      </td>
                    </tr>
                  ) : (
                    matriculas.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition">
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
                            Cancelar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: EDITAR NOME DA DISCIPLINA */}
      {disciplinaEditando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Renomear Disciplina</h3>
            <p className="text-sm text-slate-600">
              Código Único: <strong className="font-mono text-blue-700">{disciplinaEditando.codigo}</strong>
            </p>

            <form onSubmit={handleEditarNomeDisciplina} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Novo Nome</label>
                <input
                  type="text"
                  required
                  value={novoNomeDisciplina}
                  onChange={(e) => setNovoNomeDisciplina(e.target.value)}
                  placeholder="Ex: Novo Nome da Disciplina"
                  className="border p-2.5 rounded-lg text-sm w-full focus:outline-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDisciplinaEditando(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Salvar Alteração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MUDAR PROFESSOR DA MATRÍCULA */}
      {matriculaEditando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Alterar Professor Responsável</h3>
            <p className="text-sm text-slate-600">
              Aluno: <strong>{matriculaEditando.aluno.nome}</strong> ({matriculaEditando.disciplina.codigo})
            </p>

            <form onSubmit={handleMudarProfessor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Selecione o Novo Professor</label>
                <select
                  required
                  value={novoProfessorEmail}
                  onChange={(e) => setNovoProfessorEmail(e.target.value)}
                  className="border p-2.5 rounded-lg text-sm w-full focus:outline-blue-500"
                >
                  <option value="">Selecione um docente</option>
                  {professores.map((p, idx) => (
                    <option key={idx} value={p.email}>
                      {p.nome} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setMatriculaEditando(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Confirmar Alteração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}