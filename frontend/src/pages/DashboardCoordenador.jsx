import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function DashboardCoordenador() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Estados com dados reais do banco
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [tutorados, setTutorados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Formulários de cadastro
  const [novaDisciplina, setNovaDisciplina] = useState({ nome: '', codigo: '' });
  const [novaMatricula, setNovaMatricula] = useState({
    aluno_matricula: '',
    professor_email: '',
    disciplina_codigo: '',
  });
  const [matriculaTutorar, setMatriculaTutorar] = useState('');

  // Modais de edição
  const [disciplinaEditando, setDisciplinaEditando] = useState(null);
  const [novoNomeDisciplina, setNovoNomeDisciplina] = useState('');
  const [matriculaEditando, setMatriculaEditando] = useState(null);
  const [novoProfessorEmail, setNovoProfessorEmail] = useState('');

  // Modal de Documentos e Anexos da Matrícula (Para o Coordenador ver e baixar)
  const [matriculaDocsVisualizando, setMatriculaDocsVisualizando] = useState(null);
  const [documentosMatricula, setDocumentosMatricula] = useState({
    enviados_pelo_aluno: [],
    enviados_pelo_professor: [],
  });
  const [loadingDocs, setLoadingDocs] = useState(false);

  // 1. CARREGAMENTO E PERSISTÊNCIA DO TEMA (DARK/LIGHT)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const setTheme = (dark) => {
    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // 2. BUSCA COMPLETA DE DADOS NO BACKEND
  const carregarDadosDoBanco = async () => {
    try {
      setLoading(true);
      setErro('');

      const [resDisciplinas, resProfessores, resMatriculas, resTutorados] = await Promise.all([
        api.get('/disciplinas/'),
        api.get('/auth/professores'),
        api.get('/matriculas/'),
        api.get('/coordenador/meus-vinculos'),
      ]);

      setDisciplinas(resDisciplinas.data);
      setProfessores(resProfessores.data);
      setMatriculas(resMatriculas.data);
      setTutorados(resTutorados.data.tutorados || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('Sessão expirada ou não autorizada. Faça login novamente.');
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

  // 3. CARREGAR DOCUMENTOS DE UMA MATRÍCULA SELECIONADA
  const abrirModalDocumentos = async (matricula) => {
    setMatriculaDocsVisualizando(matricula);
    setLoadingDocs(true);
    try {
      const res = await api.get(`/documentos/matricula/${matricula.id}`);
      setDocumentosMatricula({
        enviados_pelo_aluno: res.data.enviados_pelo_aluno || [],
        enviados_pelo_professor: res.data.enviados_pelo_professor || [],
      });
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
      alert(err.response?.data?.detail || 'Erro ao carregar os documentos desta matrícula.');
    } finally {
      setLoadingDocs(false);
    }
  };

  // 4. DOWNLOAD DE DOCUMENTO COM EXTENSÃO CORRETA (.PDF) E ÍCONE HEROICONS
  const handleDownloadDocumento = async (docId, titulo) => {
    try {
      const response = await api.get(`/documentos/download/${docId}`, {
        responseType: 'blob',
      });

      let nomeArquivo = titulo || 'documento';
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const matches = contentDisposition.match(/filename="?([^"]+)"?/);
        if (matches && matches[1]) {
          nomeArquivo = decodeURIComponent(matches[1]);
        }
      }

      if (!nomeArquivo.includes('.')) {
        nomeArquivo = `${nomeArquivo}.pdf`;
      }

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nomeArquivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro no download:', err);
      alert(err.response?.data?.detail || 'Erro ao realizar download do documento.');
    }
  };

  // 5. DELETAR DOCUMENTO PELO COORDENADOR
  const handleDeletarDocumento = async (docId) => {
    if (!confirm('Como coordenador, tem certeza que deseja excluir este documento permanentemente?')) return;
    try {
      await api.delete(`/documentos/${docId}`);
      alert('Documento excluído.');
      if (matriculaDocsVisualizando) {
        abrirModalDocumentos(matriculaDocsVisualizando);
      }
    } catch (err) {
      console.error('Erro ao excluir documento:', err);
      alert(err.response?.data?.detail || 'Erro ao excluir documento.');
    }
  };

  // 6. AÇÕES DE DISCIPLINA
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

  const handleDeletarDisciplina = async (codigo) => {
    if (!confirm(`Atenção: Ao excluir ${codigo}, as matrículas ligadas a ela serão canceladas. Deseja continuar?`)) {
      return;
    }

    try {
      await api.delete(`/disciplinas/${codigo}`);
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao excluir disciplina.');
    }
  };

  // 7. AÇÕES DE MATRÍCULA
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

  const handleDeletarMatricula = async (id) => {
    if (!confirm('Deseja realmente cancelar esta matrícula?')) return;
    try {
      await api.delete(`/matriculas/${id}`);
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao cancelar matrícula.');
    }
  };

  // 8. AÇÕES DE TUTORIA
  const handleVincularTutor = async (e) => {
    e.preventDefault();
    if (!matriculaTutorar.trim()) return;

    try {
      await api.post('/aluno/definir-coordenador-tutor', {
        aluno_matricula: matriculaTutorar.trim(),
      });
      alert('Você agora é o tutor responsável por este aluno!');
      setMatriculaTutorar('');
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao vincular tutoria.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-blue-900 dark:bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold">SAEI — Painel da Coordenação Pedagógica</h1>
          <p className="text-xs text-blue-200 dark:text-slate-400">Gestão Inclusiva e Acompanhamento</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Seletor de Tema Sol e Lua */}
          <div className="flex items-center bg-blue-800 dark:bg-slate-800 rounded-full p-1 border border-blue-700 dark:border-slate-700 space-x-1">
            <button
              type="button"
              onClick={() => setTheme(false)}
              className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
                !isDarkMode
                  ? 'bg-white text-amber-500 shadow-md scale-105'
                  : 'text-blue-200 hover:text-white'
              }`}
              title="Modo Claro"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setTheme(true)}
              className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
                isDarkMode
                  ? 'bg-slate-900 text-yellow-400 shadow-md scale-105'
                  : 'text-blue-200 hover:text-white'
              }`}
              title="Modo Escuro"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            </button>
          </div>
          <button
            onClick={carregarDadosDoBanco}
            className="text-xs bg-blue-800 hover:bg-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded-lg transition border border-blue-600 dark:border-slate-700 font-semibold"
          >
            🔄 Atualizar
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Navegação por Abas */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 pt-4 transition-colors">
        <nav className="flex space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('tutoria')}
            className={`pb-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'tutoria'
                ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Tutoria Inclusiva ({tutorados.length})
          </button>
          <button
            onClick={() => setActiveTab('disciplinas')}
            className={`pb-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'disciplinas'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Disciplinas ({disciplinas.length})
          </button>
          <button
            onClick={() => setActiveTab('professores')}
            className={`pb-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'professores'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Professores ({professores.length})
          </button>
          <button
            onClick={() => setActiveTab('matriculas')}
            className={`pb-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'matriculas'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Matrículas & Documentos ({matriculas.length})
          </button>
        </nav>
      </div>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {loading && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center text-slate-500 dark:text-slate-400 shadow">
            <p className="animate-pulse font-medium">Carregando dados...</p>
          </div>
        )}

        {erro && !loading && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
            {erro}
          </div>
        )}

        {/* 1. ABA VISÃO GERAL */}
        {!loading && activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Painel Geral de Indicadores</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow border-l-4 border-purple-500 border border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Meus Alunos Tutorados</p>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{tutorados.length}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow border-l-4 border-blue-500 border border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Disciplinas Cadastradas</p>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{disciplinas.length}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow border-l-4 border-indigo-500 border border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Professores Registrados</p>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{professores.length}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow border-l-4 border-green-500 border border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Matrículas Ativas</p>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{matriculas.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. ABA TUTORIA INCLUSIVA */}
        {!loading && activeTab === 'tutoria' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              Tutoria e Acompanhamento Pedagógico Individual
            </h2>

            <form
              onSubmit={handleVincularTutor}
              className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow space-y-4 border border-slate-100 dark:border-slate-800"
            >
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                Assumir Tutoria de Aluno
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Digite a matrícula do estudante com necessidades educacionais para vinculá-lo ao seu acompanhamento direto.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
                <input
                  type="text"
                  placeholder="Matrícula do Estudante (ex: 20260101)"
                  value={matriculaTutorar}
                  onChange={(e) => setMatriculaTutorar(e.target.value)}
                  className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm flex-1 text-slate-800 dark:text-white focus:outline-purple-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow"
                >
                  Assumir Tutoria
                </button>
              </div>
            </form>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b dark:border-slate-700">
                  <tr>
                    <th className="p-4">Matrícula</th>
                    <th className="p-4">Nome do Aluno Tutorado</th>
                    <th className="p-4 text-center">Status de Acompanhamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {tutorados.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-6 text-center text-slate-400">
                        Você ainda não assumiu a tutoria de nenhum aluno.
                      </td>
                    </tr>
                  ) : (
                    tutorados.map((aluno, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                          {aluno.matricula}
                        </td>
                        <td className="p-4 font-bold text-slate-800 dark:text-white">
                          {aluno.nome}
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                            Em Tutoria Ativa
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ABA DISCIPLINAS */}
        {!loading && activeTab === 'disciplinas' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gestão de Disciplinas</h2>

            <form onSubmit={handleAddDisciplina} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow space-y-4 border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Cadastrar Nova Disciplina</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome da Disciplina (ex: Geografia Adaptada)"
                  value={novaDisciplina.nome}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, nome: e.target.value })}
                  className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Código Único (ex: GEO-01)"
                  value={novaDisciplina.codigo}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, codigo: e.target.value })}
                  className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition"
              >
                Salvar Disciplina no Banco
              </button>
            </form>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b dark:border-slate-700">
                  <tr>
                    <th className="p-4">Código</th>
                    <th className="p-4">Nome da Disciplina</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {disciplinas.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-6 text-center text-slate-400">
                        Nenhuma disciplina cadastrada.
                      </td>
                    </tr>
                  ) : (
                    disciplinas.map((disc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">{disc.codigo}</td>
                        <td className="p-4 font-medium text-slate-800 dark:text-white">{disc.nome}</td>
                        <td className="p-4 text-center space-x-3">
                          <button
                            onClick={() => {
                              setDisciplinaEditando(disc);
                              setNovoNomeDisciplina(disc.nome);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-semibold"
                          >
                            Editar Nome
                          </button>
                          <button
                            onClick={() => handleDeletarDisciplina(disc.codigo)}
                            className="text-red-500 dark:text-red-400 hover:underline text-xs font-semibold"
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

        {/* 4. ABA PROFESSORES */}
        {!loading && activeTab === 'professores' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Corpo Docente Registrado</h2>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b dark:border-slate-700">
                  <tr>
                    <th className="p-4">Nome do Docente</th>
                    <th className="p-4">E-mail Institucional</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {professores.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="p-6 text-center text-slate-400">
                        Nenhum professor registrado.
                      </td>
                    </tr>
                  ) : (
                    professores.map((prof, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-4 font-bold text-slate-800 dark:text-white">{prof.nome}</td>
                        <td className="p-4 font-mono text-slate-600 dark:text-slate-400">{prof.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. ABA MATRÍCULAS COM VISUALIZAÇÃO DE DOCUMENTOS */}
        {!loading && activeTab === 'matriculas' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Matrículas e Vínculos Escolares</h2>

            <form onSubmit={handleAddMatricula} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow space-y-4 border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Nova Matrícula</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Matrícula do Aluno</label>
                  <input
                    type="text"
                    placeholder="Ex: 20260101"
                    value={novaMatricula.aluno_matricula}
                    onChange={(e) => setNovaMatricula({ ...novaMatricula, aluno_matricula: e.target.value })}
                    className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Professor Responsável</label>
                  <select
                    value={novaMatricula.professor_email}
                    onChange={(e) => setNovaMatricula({ ...novaMatricula, professor_email: e.target.value })}
                    className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-blue-500"
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
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Disciplina</label>
                  <select
                    value={novaMatricula.disciplina_codigo}
                    onChange={(e) => setNovaMatricula({ ...novaMatricula, disciplina_codigo: e.target.value })}
                    className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-blue-500"
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
                className="bg-green-600 dark:bg-green-500 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition"
              >
                Efetivar Matrícula no Banco
              </button>
            </form>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b dark:border-slate-700">
                  <tr>
                    <th className="p-4">Aluno</th>
                    <th className="p-4">Disciplina</th>
                    <th className="p-4">Professor Responsável</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {matriculas.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-slate-400">
                        Nenhuma matrícula registrada.
                      </td>
                    </tr>
                  ) : (
                    matriculas.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-4">
                          <p className="font-bold text-slate-800 dark:text-white">{m.aluno.nome}</p>
                          <p className="text-xs text-slate-400 font-mono">Matrícula: {m.aluno.matricula}</p>
                        </td>
                        <td className="p-4">
                          <span className="font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded font-bold mr-2">
                            {m.disciplina.codigo}
                          </span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{m.disciplina.nome}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-slate-800 dark:text-white">{m.professor.nome}</p>
                          <p className="text-xs text-slate-400">{m.professor.email}</p>
                        </td>
                        <td className="p-4 text-center space-x-2">
                          {/* BOTÃO PARA VISUALIZAR DOCUMENTOS / LAUDOS */}
                          <button
                            onClick={() => abrirModalDocumentos(m)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm inline-flex items-center gap-1"
                            title="Ver laudos, atividades e planos de aula desta matrícula"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            <span>Anexos</span>
                          </button>

                          <button
                            onClick={() => {
                              setMatriculaEditando(m);
                              setNovoProfessorEmail(m.professor.email);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-semibold"
                          >
                            Mudar Professor
                          </button>
                          <button
                            onClick={() => handleDeletarMatricula(m.id)}
                            className="text-red-500 dark:text-red-400 hover:underline text-xs font-semibold"
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

      {/* MODAL 1: EDITAR NOME DE DISCIPLINA */}
      {disciplinaEditando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Renomear Disciplina</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Código: <strong className="font-mono text-blue-700 dark:text-blue-400">{disciplinaEditando.codigo}</strong>
            </p>

            <form onSubmit={handleEditarNomeDisciplina} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Novo Nome</label>
                <input
                  type="text"
                  required
                  value={novoNomeDisciplina}
                  onChange={(e) => setNovoNomeDisciplina(e.target.value)}
                  className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDisciplinaEditando(null)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MUDAR PROFESSOR DA MATRÍCULA */}
      {matriculaEditando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Alterar Professor Responsável</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Aluno: <strong>{matriculaEditando.aluno.nome}</strong> ({matriculaEditando.disciplina.codigo})
            </p>

            <form onSubmit={handleMudarProfessor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Novo Professor</label>
                <select
                  required
                  value={novoProfessorEmail}
                  onChange={(e) => setNovoProfessorEmail(e.target.value)}
                  className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-blue-500"
                >
                  <option value="">Selecione</option>
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
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VISUALIZAR E BAIXAR DOCUMENTOS / LAUDOS (COORDENAÇÃO) */}
      {matriculaDocsVisualizando && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-6 max-w-4xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Topo do Modal */}
            <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Documentos & Laudos da Matrícula
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Estudante:{' '}
                  <strong className="text-slate-700 dark:text-slate-200">
                    {matriculaDocsVisualizando.aluno.nome}
                  </strong>{' '}
                  ({matriculaDocsVisualizando.aluno.matricula}) | Disciplina:{' '}
                  <strong className="text-slate-700 dark:text-slate-200">
                    {matriculaDocsVisualizando.disciplina.codigo} — {matriculaDocsVisualizando.disciplina.nome}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setMatriculaDocsVisualizando(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold p-1"
                title="Fechar"
              >
                ✕
              </button>
            </div>

            {loadingDocs ? (
              <p className="text-center py-10 text-slate-400 animate-pulse">Carregando histórico de anexos...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. DOCUMENTOS ENVIADOS PELO ALUNO (Laudos Médicos, Entregas) */}
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 dark:border-slate-700">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                      Enviados pelo Aluno ({documentosMatricula.enviados_pelo_aluno.length})
                    </h4>
                    <span className="text-[11px] text-slate-400">Laudos e Entregas</span>
                  </div>

                  {documentosMatricula.enviados_pelo_aluno.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Nenhum documento anexado pelo aluno.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {documentosMatricula.enviados_pelo_aluno.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
                        >
                          <div className="pr-2">
                            <p className="font-semibold text-slate-800 dark:text-white text-xs">{doc.titulo}</p>
                            <span className="inline-block bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] px-1.5 py-0.5 rounded font-mono mt-1">
                              {doc.tipo}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            {/* BOTÃO DE DOWNLOAD OFICIAL */}
                            <button
                              onClick={() => handleDownloadDocumento(doc.id, doc.titulo)}
                              className="flex items-center gap-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-md font-semibold transition shadow-sm"
                              title="Baixar em PDF"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.5V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                              </svg>
                              <span>Baixar</span>
                            </button>
                            {/* BOTÃO DE EXCLUSÃO */}
                            <button
                              onClick={() => handleDeletarDocumento(doc.id)}
                              className="flex items-center justify-center p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
                              title="Excluir Arquivo"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. DOCUMENTOS ENVIADOS PELO PROFESSOR (Planos de Aula, Atividades) */}
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 dark:border-slate-700">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                      Enviados pelo Professor ({documentosMatricula.enviados_pelo_professor.length})
                    </h4>
                    <span className="text-[11px] text-slate-400">Planos e Materiais</span>
                  </div>

                  {documentosMatricula.enviados_pelo_professor.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Nenhum documento anexado pelo professor.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {documentosMatricula.enviados_pelo_professor.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
                        >
                          <div className="pr-2">
                            <p className="font-semibold text-slate-800 dark:text-white text-xs">{doc.titulo}</p>
                            <span className="inline-block bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-mono mt-1">
                              {doc.tipo}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            {/* BOTÃO DE DOWNLOAD OFICIAL */}
                            <button
                              onClick={() => handleDownloadDocumento(doc.id, doc.titulo)}
                              className="flex items-center gap-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-md font-semibold transition shadow-sm"
                              title="Baixar em PDF"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.5V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                              </svg>
                              <span>Baixar</span>
                            </button>
                            {/* BOTÃO DE EXCLUSÃO */}
                            <button
                              onClick={() => handleDeletarDocumento(doc.id)}
                              className="flex items-center justify-center p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
                              title="Excluir Arquivo"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMatriculaDocsVisualizando(null)}
                className="px-5 py-2 text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition"
              >
                Fechar Janela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}