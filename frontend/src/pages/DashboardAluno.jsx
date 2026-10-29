import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentos as acoesDocumentos, matriculas as acoesMatriculas } from '../actions';
import useTheme from '../hooks/useTheme';
import ThemeToggle from '../components/ThemeToggle';
import { baixarDocumento } from '../utils/documentos';
import { encerrarSessao } from '../utils/sessao';
import TabVisaoGeral from '../components/aluno/TabVisaoGeral';
import TabDocumentos from '../components/aluno/TabDocumentos';
import TabPreferencias from '../components/aluno/TabPreferencias';

// Página do painel do aluno: concentra apenas o estado, a carga de dados e os
// handlers de negócio. A renderização foi decomposta nas abas de components/aluno.
export default function DashboardAluno() {
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
  // Começa em true: a primeira carga acontece logo no mount, sem setState síncrono no efeito
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState('');
  const { isDarkMode, setTheme } = useTheme();

  // Preferências de aprendizagem por matrícula (texto em edição no formulário)
  const [preferencias, setPreferencias] = useState({});
  const [salvandoPref, setSalvandoPref] = useState(null);
  const [prefSalva, setPrefSalva] = useState(null);

  // Formulário de Upload de Documento
  const [uploadForm, setUploadForm] = useState({
    titulo: '',
    tipo: 'ATIVIDADE',
    arquivo: null,
  });

  // Logout declarado antes dos handlers que o utilizam no fluxo de erro
  const handleLogout = () => encerrarSessao(navigate);

  // 1. BUSCA DAS MATRÍCULAS DO ALUNO (GET /matriculas/minhas-matriculas-aluno)
  // Cadeia de promises (e não async/await) para o react-hooks/set-state-in-effect
  // não tratar os setStates como sincronos dentro do efeito de mount.
  const carregarMinhasMatriculas = useCallback(() => {
    return acoesMatriculas
      .minhasMatriculasDoAluno()
      .then((lista) => {
        const userSalvo = localStorage.getItem('user');
        if (userSalvo) {
          setUsuario(JSON.parse(userSalvo));
        }
        setMatriculas(lista);

        // Preenche o rascunho das preferências com o valor salvo de cada matrícula
        const iniciais = {};
        lista.forEach((m) => {
          iniciais[m.id] = m.preferencias_do_aluno || '';
        });
        setPreferencias(iniciais);

        if (lista.length > 0) {
          setMatriculaSelecionada((atual) => atual || lista[0]);
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar matrículas do aluno:', err);
        if (err.status === 401 || err.status === 403) {
          alert('Sessão expirada ou não autorizada. Faça login novamente.');
          encerrarSessao(navigate);
          return;
        }
        setErro(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  useEffect(() => {
    carregarMinhasMatriculas();
  }, [carregarMinhasMatriculas]);

  // 2. BUSCA DOS DOCUMENTOS DA MATRÍCULA SELECIONADA (GET /documentos/matricula/{id})
  // setLoadingDocs(true) acontece nos handlers de seleção; aqui só gravamos o resultado.
  const carregarDocumentosDaMatricula = useCallback((matriculaId) => {
    if (!matriculaId) return Promise.resolve();
    return acoesDocumentos
      .listarDocumentosDaMatricula(matriculaId)
      .then((lista) => {
        setDocumentosMatricula(lista);
      })
      .catch((err) => {
        console.error('Erro ao buscar documentos da matrícula:', err);
        alert(err.message || 'Erro ao carregar os anexos desta disciplina.');
      })
      .finally(() => {
        setLoadingDocs(false);
      });
  }, []);

  useEffect(() => {
    if (matriculaSelecionada) {
      carregarDocumentosDaMatricula(matriculaSelecionada.id);
    }
  }, [matriculaSelecionada, carregarDocumentosDaMatricula]);

  // 3. UPLOAD DE DOCUMENTO PARA O PROFESSOR (POST /documentos/upload/{matricula_id})
  const handleUploadDocumento = async (e) => {
    e.preventDefault();
    if (!matriculaSelecionada) {
      alert('Selecione uma disciplina primeiro.');
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

      alert('Documento enviado ao professor com sucesso!');
      setUploadForm({ titulo: '', tipo: 'ATIVIDADE', arquivo: null });
      const fileInput = document.getElementById('inputFileAluno');
      if (fileInput) fileInput.value = '';

      setLoadingDocs(true);
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
      setLoadingDocs(true);
      carregarDocumentosDaMatricula(matriculaSelecionada.id);
    } catch (err) {
      console.error('Erro ao deletar documento:', err);
      alert(err.message || 'Erro ao excluir o documento.');
    }
  };

  // 5. PREFERÊNCIAS DE APRENDIZAGEM (PATCH /matriculas/{id}/preferencias)
  const editarPreferencia = (matriculaId, texto) => {
    setPreferencias((prev) => ({ ...prev, [matriculaId]: texto }));
    setPrefSalva(null);
  };

  const salvarPreferencia = async (matriculaId) => {
    try {
      setSalvandoPref(matriculaId);
      const matricula = await acoesMatriculas.atualizarPreferencias(
        matriculaId,
        preferencias[matriculaId]
      );

      // O backend devolve a matrícula completa: mantém listas e rascunho em sincronia
      setMatriculas((prev) => prev.map((m) => (m.id === matriculaId ? matricula : m)));
      setPreferencias((prev) => ({ ...prev, [matriculaId]: matricula.preferencias_do_aluno || '' }));
      setPrefSalva(matriculaId);
    } catch (err) {
      console.error('Erro ao salvar preferências:', err);
      alert(err.message || 'Erro ao salvar suas preferências.');
    } finally {
      setSalvandoPref(null);
    }
  };

  // 6. Seleção e navegação (setLoadingDocs(true) aqui: é handler, não efeito)
  const selecionarMatriculaPorId = (matriculaId) => {
    const sel = matriculas.find((m) => m.id === matriculaId);
    setLoadingDocs(true);
    setMatriculaSelecionada(sel);
  };

  const verDocumentosDaMatricula = (m) => {
    setLoadingDocs(true);
    setMatriculaSelecionada(m);
    setActiveTab('documentos');
  };

  // Classes literais completas (o Tailwind não gera classes a partir de template dinâmico)
  const abas = [
    { id: 'overview', label: 'Visão Geral', ativo: 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' },
    { id: 'documentos', label: 'Documentos & Atividades', ativo: 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400' },
    { id: 'preferencias', label: 'Minhas Preferências de Aprendizagem', ativo: 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-blue-900 dark:bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold">SAEI — Painel do Aluno</h1>
          <p className="text-xs text-blue-200 dark:text-slate-400">
            {usuario ? `Estudante: ${usuario.nome}` : 'Minha jornada de aprendizagem inclusiva'}
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
            <p className="animate-pulse font-medium">Buscando suas disciplinas no servidor...</p>
          </div>
        )}

        {erro && !loading && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
            {erro}
          </div>
        )}

        {!loading && matriculas.length === 0 && !erro && (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center">
            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
              Você ainda não está vinculado a nenhuma disciplina
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Assim que a coordenação registrar sua matrícula, suas disciplinas e documentos aparecem aqui.
            </p>
          </div>
        )}

        {/* 1. ABA VISÃO GERAL */}
        {!loading && matriculas.length > 0 && activeTab === 'overview' && (
          <TabVisaoGeral matriculas={matriculas} onVerDocumentos={verDocumentosDaMatricula} />
        )}

        {/* 2. ABA DOCUMENTOS & ATIVIDADES */}
        {!loading && matriculas.length > 0 && activeTab === 'documentos' && (
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

        {/* 3. ABA PREFERÊNCIAS DE APRENDIZAGEM */}
        {!loading && matriculas.length > 0 && activeTab === 'preferencias' && (
          <TabPreferencias
            matriculas={matriculas}
            preferencias={preferencias}
            onEditar={editarPreferencia}
            onSalvar={salvarPreferencia}
            salvandoId={salvandoPref}
            salvoId={prefSalva}
          />
        )}
      </main>
    </div>
  );
}
