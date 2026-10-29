import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentos as acoesDocumentos, matriculas as acoesMatriculas } from '../actions';
import useTheme from '../hooks/useTheme';
import ThemeToggle from '../components/ThemeToggle';
import { baixarDocumento } from '../utils/documentos';
import { encerrarSessao } from '../utils/sessao';
import TabVisaoGeral from '../components/professor/TabVisaoGeral';
import TabAlunos from '../components/professor/TabAlunos';
import TabDocumentos from '../components/professor/TabDocumentos';

// Página do painel do professor: concentra apenas o estado, a carga de dados e os
// handlers de negócio. A renderização foi decomposta nas abas de components/professor.
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
  const { isDarkMode, setTheme } = useTheme();

  // Formulário de Upload de Documento
  const [uploadForm, setUploadForm] = useState({
    titulo: '',
    tipo: 'PLANO_DE_AULA',
    arquivo: null,
  });

  // Logout declarado antes dos handlers que o utilizam no fluxo de erro
  const handleLogout = () => encerrarSessao(navigate);

  // 1. BUSCA DAS MATRÍCULAS DO PROFESSOR (GET /matriculas/minhas-matriculas-professor)
  const carregarMinhasMatriculas = async () => {
    try {
      setLoading(true);
      setErro('');

      const userSalvo = localStorage.getItem('user');
      if (userSalvo) {
        setUsuario(JSON.parse(userSalvo));
      }

      const lista = await acoesMatriculas.minhasMatriculasDoProfessor();
      setMatriculas(lista);

      if (lista.length > 0 && !matriculaSelecionada) {
        setMatriculaSelecionada(lista[0]);
      }
    } catch (err) {
      console.error('Erro ao carregar matrículas do professor:', err);
      if (err.status === 401 || err.status === 403) {
        alert('Sessão expirada ou não autorizada. Faça login novamente.');
        handleLogout();
        return;
      }
      setErro(err.message || 'Não foi possível carregar suas turmas e alunos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMinhasMatriculas();
  }, []);

  // 2. BUSCA DOS DOCUMENTOS DA MATRÍCULA SELECIONADA (GET /documentos/matricula/{id})
  const carregarDocumentosDaMatricula = async (matriculaId) => {
    if (!matriculaId) return;
    try {
      setLoadingDocs(true);
      setDocumentosMatricula(await acoesDocumentos.listarDocumentosDaMatricula(matriculaId));
    } catch (err) {
      console.error('Erro ao buscar documentos da matrícula:', err);
      alert(err.message || 'Erro ao carregar anexos desta matrícula.');
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (matriculaSelecionada) {
      carregarDocumentosDaMatricula(matriculaSelecionada.id);
    }
  }, [matriculaSelecionada]);

  // 3. UPLOAD DE DOCUMENTO (POST /documentos/upload/{matricula_id})
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
      await acoesDocumentos.enviarDocumento(matriculaSelecionada.id, {
        titulo: uploadForm.titulo.trim(),
        tipo: uploadForm.tipo,
        arquivo: uploadForm.arquivo,
      });

      alert('Documento enviado com sucesso!');
      setUploadForm({ titulo: '', tipo: 'PLANO_DE_AULA', arquivo: null });
      const fileInput = document.getElementById('inputFileProfessor');
      if (fileInput) fileInput.value = '';

      carregarDocumentosDaMatricula(matriculaSelecionada.id);
    } catch (err) {
      console.error('Erro no upload:', err);
      alert(err.message || 'Falha ao realizar upload.');
    } finally {
      setUploading(false);
    }
  };

  // 4. DOWNLOAD E EXCLUSÃO DE DOCUMENTO (lógica compartilhada em utils/documentos)
  const handleDownloadDocumento = (docId, titulo) => baixarDocumento(docId, titulo);

  const handleDeletarDocumento = async (docId) => {
    if (!confirm('Deseja realmente excluir este documento?')) return;
    try {
      await acoesDocumentos.excluirDocumento(docId);
      alert('Documento excluído com sucesso.');
      carregarDocumentosDaMatricula(matriculaSelecionada.id);
    } catch (err) {
      console.error('Erro ao deletar documento:', err);
      alert(err.message || 'Erro ao excluir o documento.');
    }
  };

  // 5. Seleção de matrícula pela lista da aba de documentos
  const selecionarMatriculaPorId = (matriculaId) => {
    const sel = matriculas.find((m) => m.id === matriculaId);
    setMatriculaSelecionada(sel);
  };

  // Visão geral: "Ver Laudos e Arquivos" leva à aba de documentos com a matrícula escolhida
  const verDocumentosDaMatricula = (m) => {
    setMatriculaSelecionada(m);
    setActiveTab('documentos');
  };

  const disciplinasUnicas = Array.from(new Set(matriculas.map((m) => m.disciplina.codigo)));

  // Classes literais completas (o Tailwind não gera classes a partir de template dinâmico)
  const abas = [
    { id: 'overview', label: 'Visão Geral', ativo: 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' },
    { id: 'alunos', label: `Meus Alunos & Disciplinas (${matriculas.length})`, ativo: 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' },
    { id: 'documentos', label: 'Documentos & Laudos Inclusivos', ativo: 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400' },
  ];

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
          <ThemeToggle isDarkMode={isDarkMode} setTheme={setTheme} variant="dashboard" />
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
          {abas.map((aba) => (
            <button
              key={aba.id}
              onClick={() => setActiveTab(aba.id)}
              className={`pb-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
                activeTab === aba.id
                  ? aba.ativo
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              {aba.label}
            </button>
          ))}
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
          <TabVisaoGeral matriculas={matriculas} disciplinasUnicas={disciplinasUnicas} />
        )}

        {/* 2. ABA MEUS ALUNOS E DISCIPLINAS */}
        {!loading && activeTab === 'alunos' && (
          <TabAlunos matriculas={matriculas} onVerDocumentos={verDocumentosDaMatricula} />
        )}

        {/* 3. ABA DOCUMENTOS & LAUDOS */}
        {!loading && activeTab === 'documentos' && (
          <TabDocumentos
            matriculas={matriculas}
            matriculaSelecionada={matriculaSelecionada}
            onSelectMatricula={selecionarMatriculaPorId}
            uploadForm={uploadForm}
            setUploadForm={setUploadForm}
            uploading={uploading}
            onSubmitUpload={handleUploadDocumento}
            loadingDocs={loadingDocs}
            documentosMatricula={documentosMatricula}
            onDownload={handleDownloadDocumento}
            onDeletar={handleDeletarDocumento}
          />
        )}
      </main>
    </div>
  );
}
