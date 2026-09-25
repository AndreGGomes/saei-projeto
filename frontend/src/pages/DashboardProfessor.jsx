import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function DashboardProfessor() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Dados do usuário logado
  const [usuario, setUsuario] = useState(null);

  // Estados principais
  const [matriculas, setMatriculas] = useState([]);
  const [matriculaSelecionada, setMatriculaSelecionada] = useState(null);
  const [documentosMatricula, setDocumentosMatricula] = useState({
    enviados_pelo_aluno: [],
    enviados_pelo_professor: [],
  });

  const [loading, setLoading] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Formulário de Upload de Documento
  const [uploadForm, setUploadForm] = useState({
    titulo: '',
    tipo: 'PLANO_DE_AULA',
    arquivo: null,
  });

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

  // 2. BUSCA DAS MATRÍCULAS DO PROFESSOR (GET /matriculas/minhas-matriculas-professor)
  const carregarMinhasMatriculas = async () => {
    try {
      setLoading(true);
      setErro('');

      const userSalvo = localStorage.getItem('user');
      if (userSalvo) {
        setUsuario(JSON.parse(userSalvo));
      }

      const res = await api.get('/matriculas/minhas-matriculas-professor');
      const lista = res.data.matriculas || [];
      setMatriculas(lista);

      if (lista.length > 0 && !matriculaSelecionada) {
        setMatriculaSelecionada(lista[0]);
      }
    } catch (err) {
      console.error('Erro ao carregar matrículas do professor:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('Sessão expirada ou não autorizada. Faça login novamente.');
        handleLogout();
        return;
      }
      setErro('Não foi possível carregar suas turmas e alunos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMinhasMatriculas();
  }, []);

  // 3. BUSCA DOS DOCUMENTOS DA MATRÍCULA SELECIONADA (GET /documentos/matricula/{id})
  const carregarDocumentosDaMatricula = async (matriculaId) => {
    if (!matriculaId) return;
    try {
      setLoadingDocs(true);
      const res = await api.get(`/documentos/matricula/${matriculaId}`);
      setDocumentosMatricula({
        enviados_pelo_aluno: res.data.enviados_pelo_aluno || [],
        enviados_pelo_professor: res.data.enviados_pelo_professor || [],
      });
    } catch (err) {
      console.error('Erro ao buscar documentos da matrícula:', err);
      alert(err.response?.data?.detail || 'Erro ao carregar anexos desta matrícula.');
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (matriculaSelecionada) {
      carregarDocumentosDaMatricula(matriculaSelecionada.id);
    }
  }, [matriculaSelecionada]);

  // 4. UPLOAD DE DOCUMENTO (POST /documentos/upload/{matricula_id})
  const handleUploadDocumento = async (e) => {
    e.preventDefault();
    if (!matriculaSelecionada) {
      alert('Selecione uma matrícula primeiro.');
      return;
    }
    if (!uploadForm.arquivo) {
      alert('Selecione um arquivo para enviar.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('titulo', uploadForm.titulo.trim());
      formData.append('tipo', uploadForm.tipo);
      formData.append('arquivo', uploadForm.arquivo);

      await api.post(`/documentos/upload/${matriculaSelecionada.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Documento enviado com sucesso!');
      setUploadForm({ titulo: '', tipo: 'PLANO_DE_AULA', arquivo: null });
      const fileInput = document.getElementById('inputFileProfessor');
      if (fileInput) fileInput.value = '';

      carregarDocumentosDaMatricula(matriculaSelecionada.id);
    } catch (err) {
      console.error('Erro no upload:', err);
      alert(err.response?.data?.detail || 'Falha ao realizar upload.');
    } finally {
      setUploading(false);
    }
  };

  // 5. DOWNLOAD DE DOCUMENTO CORRIGIDO (PDF COM ÍCONE HEROICONS)
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

  // 6. DELETAR DOCUMENTO (DELETE /documentos/{documento_id})
  const handleDeletarDocumento = async (docId) => {
    if (!confirm('Deseja realmente excluir este documento?')) return;
    try {
      await api.delete(`/documentos/${docId}`);
      alert('Documento excluído com sucesso.');
      carregarDocumentosDaMatricula(matriculaSelecionada.id);
    } catch (err) {
      console.error('Erro ao deletar documento:', err);
      alert(err.response?.data?.detail || 'Erro ao excluir o documento.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const disciplinasUnicas = Array.from(new Set(matriculas.map((m) => m.disciplina.codigo)));

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-blue-900 dark:bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold">SAEI — Painel do Professor</h1>
          <p className="text-xs text-blue-200 dark:text-slate-400">
            {usuario ? `Docente: ${usuario.nome}` : 'Gestão Pedagógica e Material Didático Inclusivo'}
          </p>
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
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Abas */}
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
            onClick={() => setActiveTab('alunos')}
            className={`pb-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'alunos'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Meus Alunos & Disciplinas ({matriculas.length})
          </button>
          <button
            onClick={() => setActiveTab('documentos')}
            className={`pb-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'documentos'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Documentos & Laudos Inclusivos
          </button>
        </nav>
      </div>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {loading && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center text-slate-500 dark:text-slate-400 shadow">
            <p className="animate-pulse font-medium">Buscando suas turmas no servidor...</p>
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
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Painel Geral do Docente</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow border-l-4 border-blue-500 border border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Alunos Matriculados</p>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{matriculas.length}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow border-l-4 border-emerald-500 border border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Disciplinas Ministradas</p>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{disciplinasUnicas.length}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow border-l-4 border-purple-500 border border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Acompanhamento Inclusivo</p>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">Ativo</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow border border-slate-100 dark:border-slate-800 space-y-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Educação Inclusiva e Anexos</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Acesse a aba <strong>Documentos & Laudos Inclusivos</strong> para consultar laudos e materiais de cada estudante vinculado às suas turmas.
              </p>
            </div>
          </div>
        )}

        {/* 2. ABA MEUS ALUNOS E DISCIPLINAS */}
        {!loading && activeTab === 'alunos' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Alunos e Disciplinas Vinculadas</h2>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b dark:border-slate-700">
                  <tr>
                    <th className="p-4">Estudante</th>
                    <th className="p-4">Matrícula</th>
                    <th className="p-4">Disciplina</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {matriculas.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-slate-400">
                        Nenhum aluno vinculado às suas disciplinas no momento.
                      </td>
                    </tr>
                  ) : (
                    matriculas.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-4 font-bold text-slate-800 dark:text-white">{m.aluno.nome}</td>
                        <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">{m.aluno.matricula}</td>
                        <td className="p-4">
                          <span className="font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded font-bold mr-2">
                            {m.disciplina.codigo}
                          </span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{m.disciplina.nome}</span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setMatriculaSelecionada(m);
                              setActiveTab('documentos');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                          >
                            Ver Laudos e Arquivos
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

        {/* 3. ABA DOCUMENTOS & LAUDOS */}
        {!loading && activeTab === 'documentos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Documentos e Atividades por Matrícula
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gerencie laudos médicos, atividades adaptadas e planos de aula
                </p>
              </div>

              {matriculas.length > 0 && (
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Matrícula/Aluno:</label>
                  <select
                    value={matriculaSelecionada ? matriculaSelecionada.id : ''}
                    onChange={(e) => {
                      const sel = matriculas.find((m) => m.id === Number(e.target.value));
                      setMatriculaSelecionada(sel);
                    }}
                    className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-emerald-500"
                  >
                    {matriculas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.aluno.nome} ({m.disciplina.codigo})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {matriculaSelecionada && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4 flex flex-wrap justify-between items-center text-sm">
                <div>
                  <span className="text-emerald-800 dark:text-emerald-300 font-bold">Aluno:</span>{' '}
                  <span className="text-slate-800 dark:text-white font-medium">{matriculaSelecionada.aluno.nome}</span>{' '}
                  <span className="text-xs text-slate-500 font-mono">({matriculaSelecionada.aluno.matricula})</span>
                </div>
                <div>
                  <span className="text-emerald-800 dark:text-emerald-300 font-bold">Disciplina:</span>{' '}
                  <span className="text-slate-800 dark:text-white font-medium">
                    {matriculaSelecionada.disciplina.codigo} — {matriculaSelecionada.disciplina.nome}
                  </span>
                </div>
              </div>
            )}

            {/* Formulário de Upload */}
            {matriculaSelecionada && (
              <form
                onSubmit={handleUploadDocumento}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow space-y-4 border border-slate-100 dark:border-slate-800"
              >
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                  Enviar Novo Documento para o Aluno
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Título do Documento
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Plano Adaptado - Semana 1"
                      value={uploadForm.titulo}
                      onChange={(e) => setUploadForm({ ...uploadForm, titulo: e.target.value })}
                      className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Tipo de Material
                    </label>
                    <select
                      value={uploadForm.tipo}
                      onChange={(e) => setUploadForm({ ...uploadForm, tipo: e.target.value })}
                      className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-emerald-500"
                    >
                      <option value="PLANO_DE_AULA">Plano de Aula Adaptado</option>
                      <option value="ATIVIDADE">Atividade Adaptada</option>
                      <option value="LAUDO_MEDICO">Laudo Médico</option>
                      <option value="OUTROS">Outros Documentos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Arquivo Físico (PDF, Imagem, etc.)
                    </label>
                    <input
                      id="inputFileProfessor"
                      type="file"
                      onChange={(e) => setUploadForm({ ...uploadForm, arquivo: e.target.files[0] })}
                      className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-lg text-xs w-full text-slate-800 dark:text-white file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow disabled:opacity-50"
                >
                  {uploading ? 'Enviando Arquivo...' : 'Anexar Documento'}
                </button>
              </form>
            )}

            {/* Listas Divididas (Aluno vs Professor) */}
            {loadingDocs ? (
              <p className="text-center py-6 text-slate-400 animate-pulse">Carregando anexos da matrícula...</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. DOCUMENTOS ENVIADOS PELO ALUNO */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-100 dark:border-slate-800 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                      Enviados pelo Aluno ({documentosMatricula.enviados_pelo_aluno.length})
                    </h4>
                    <span className="text-xs text-slate-400">Laudos e Entregas</span>
                  </div>

                  {documentosMatricula.enviados_pelo_aluno.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">Nenhum anexo enviado pelo aluno.</p>
                  ) : (
                    <div className="space-y-3">
                      {documentosMatricula.enviados_pelo_aluno.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                        >
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white text-sm">{doc.titulo}</p>
                            <span className="inline-block bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded font-mono mt-1">
                              {doc.tipo}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDownloadDocumento(doc.id, doc.titulo)}
                            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-semibold transition shadow-sm"
                            title="Baixar Arquivo"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.5V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            <span>Baixar</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. DOCUMENTOS ENVIADOS PELO PROFESSOR */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-100 dark:border-slate-800 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                      Enviados por Você ({documentosMatricula.enviados_pelo_professor.length})
                    </h4>
                    <span className="text-xs text-slate-400">Planos e Materiais</span>
                  </div>

                  {documentosMatricula.enviados_pelo_professor.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">Você ainda não anexou materiais para este aluno.</p>
                  ) : (
                    <div className="space-y-3">
                      {documentosMatricula.enviados_pelo_professor.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                        >
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white text-sm">{doc.titulo}</p>
                            <span className="inline-block bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-0.5 rounded font-mono mt-1">
                              {doc.tipo}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDownloadDocumento(doc.id, doc.titulo)}
                              className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md font-semibold transition shadow-sm"
                              title="Baixar Arquivo"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.5V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                              </svg>
                              <span>Baixar</span>
                            </button>
                            <button
                              onClick={() => handleDeletarDocumento(doc.id)}
                              className="flex items-center justify-center p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition border border-transparent hover:border-red-200 dark:hover:border-red-900"
                              title="Excluir Documento"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
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
          </div>
        )}
      </main>
    </div>
  );
}