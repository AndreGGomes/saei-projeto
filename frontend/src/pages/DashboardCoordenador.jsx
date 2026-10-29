import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  auth,
  coordenador as acoesCoordenador,
  disciplinas as acoesDisciplinas,
  documentos as acoesDocumentos,
  matriculas as acoesMatriculas,
} from '../actions';
import useTheme from '../hooks/useTheme';
import ThemeToggle from '../components/ThemeToggle';
import { baixarDocumento } from '../utils/documentos';
import { encerrarSessao } from '../utils/sessao';
import TabVisaoGeral from '../components/coordenador/TabVisaoGeral';
import TabTutoria from '../components/coordenador/TabTutoria';
import TabDisciplinas from '../components/coordenador/TabDisciplinas';
import TabProfessores from '../components/coordenador/TabProfessores';
import TabMatriculas from '../components/coordenador/TabMatriculas';
import ModalEditarDisciplina from '../components/coordenador/ModalEditarDisciplina';
import ModalMudarProfessor from '../components/coordenador/ModalMudarProfessor';
import ModalDocumentosMatricula from '../components/coordenador/ModalDocumentosMatricula';

// Página do painel da coordenação: concentra apenas o estado, a carga de dados e os
// handlers de negócio. A renderização foi decomposta nas abas/modais de components/coordenador.
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
  const { isDarkMode, setTheme } = useTheme();

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

  // Logout declarado antes dos handlers que o utilizam no fluxo de erro
  const handleLogout = () => encerrarSessao(navigate);

  // 1. BUSCA COMPLETA DE DADOS NO BACKEND
  const carregarDadosDoBanco = async () => {
    try {
      setLoading(true);
      setErro('');

      const [listaDisciplinas, listaProfessores, listaMatriculas, listaTutorados] =
        await Promise.all([
          acoesDisciplinas.listarDisciplinas(),
          auth.listarProfessores(),
          acoesMatriculas.listarMatriculas(),
          acoesCoordenador.listarMeusVinculos(),
        ]);

      setDisciplinas(listaDisciplinas);
      setProfessores(listaProfessores);
      setMatriculas(listaMatriculas);
      setTutorados(listaTutorados);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      if (err.status === 401 || err.status === 403) {
        alert('Sessão expirada ou não autorizada. Faça login novamente.');
        handleLogout();
        return;
      }
      setErro(err.message || 'Não foi possível carregar os dados do servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosDoBanco();
  }, []);

  // 2. CARREGAR DOCUMENTOS DE UMA MATRÍCULA SELECIONADA
  const abrirModalDocumentos = async (matricula) => {
    setMatriculaDocsVisualizando(matricula);
    setLoadingDocs(true);
    try {
      setDocumentosMatricula(await acoesDocumentos.listarDocumentosDaMatricula(matricula.id));
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
      alert(err.message || 'Erro ao carregar os documentos desta matrícula.');
    } finally {
      setLoadingDocs(false);
    }
  };

  // 3. DOWNLOAD E EXCLUSÃO DE DOCUMENTO (lógica compartilhada em utils/documentos)
  const handleDownloadDocumento = (docId, titulo) => baixarDocumento(docId, titulo);

  const handleDeletarDocumento = async (docId) => {
    if (!confirm('Como coordenador, tem certeza que deseja excluir este documento permanentemente?')) return;
    try {
      await acoesDocumentos.excluirDocumento(docId);
      alert('Documento excluído.');
      if (matriculaDocsVisualizando) {
        abrirModalDocumentos(matriculaDocsVisualizando);
      }
    } catch (err) {
      console.error('Erro ao excluir documento:', err);
      alert(err.message || 'Erro ao excluir documento.');
    }
  };

  // 4. AÇÕES DE DISCIPLINA
  const handleAddDisciplina = async (e) => {
    e.preventDefault();
    try {
      await acoesDisciplinas.criarDisciplina({
        nome: novaDisciplina.nome.trim(),
        codigo: novaDisciplina.codigo.trim().toUpperCase(),
      });
      setNovaDisciplina({ nome: '', codigo: '' });
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.message || 'Erro ao cadastrar disciplina.');
    }
  };

  const handleEditarNomeDisciplina = async (e) => {
    e.preventDefault();
    if (!novoNomeDisciplina.trim()) return;

    try {
      await acoesDisciplinas.renomearDisciplina(disciplinaEditando.codigo, novoNomeDisciplina.trim());
      setDisciplinaEditando(null);
      setNovoNomeDisciplina('');
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.message || 'Erro ao atualizar nome da disciplina.');
    }
  };

  const handleDeletarDisciplina = async (codigo) => {
    if (!confirm(`Atenção: Ao excluir ${codigo}, as matrículas ligadas a ela serão canceladas. Deseja continuar?`)) {
      return;
    }

    try {
      await acoesDisciplinas.excluirDisciplina(codigo);
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.message || 'Erro ao excluir disciplina.');
    }
  };

  // 5. AÇÕES DE MATRÍCULA
  const handleAddMatricula = async (e) => {
    e.preventDefault();
    try {
      await acoesMatriculas.criarMatricula({
        alunoMatricula: novaMatricula.aluno_matricula.trim(),
        professorEmail: novaMatricula.professor_email,
        disciplinaCodigo: novaMatricula.disciplina_codigo,
      });
      setNovaMatricula({ aluno_matricula: '', professor_email: '', disciplina_codigo: '' });
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.message || 'Erro ao efetivar matrícula.');
    }
  };

  const handleMudarProfessor = async (e) => {
    e.preventDefault();
    try {
      await acoesMatriculas.mudarProfessorDaMatricula(matriculaEditando.id, novoProfessorEmail);
      setMatriculaEditando(null);
      setNovoProfessorEmail('');
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.message || 'Erro ao mudar professor.');
    }
  };

  const handleDeletarMatricula = async (id) => {
    if (!confirm('Deseja realmente cancelar esta matrícula?')) return;
    try {
      await acoesMatriculas.cancelarMatricula(id);
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.message || 'Erro ao cancelar matrícula.');
    }
  };

  // 6. AÇÕES DE TUTORIA
  const handleVincularTutor = async (e) => {
    e.preventDefault();
    if (!matriculaTutorar.trim()) return;

    try {
      await acoesCoordenador.definirCoordenadorTutor(matriculaTutorar.trim());
      alert('Você agora é o tutor responsável por este aluno!');
      setMatriculaTutorar('');
      carregarDadosDoBanco();
    } catch (err) {
      alert(err.message || 'Erro ao vincular tutoria.');
    }
  };

  // 7. Abertura dos modais a partir das tabelas
  // A edição busca os dados atuais da disciplina no servidor (GET /disciplinas/{codigo})
  // para não editar um nome já desatualizado na lista carregada no início da sessão.
  const abrirEdicaoDisciplina = async (disc) => {
    setDisciplinaEditando(disc);
    setNovoNomeDisciplina(disc.nome);
    try {
      const atual = await acoesDisciplinas.buscarDisciplina(disc.codigo);
      setDisciplinaEditando(atual);
      setNovoNomeDisciplina(atual.nome);
    } catch (err) {
      // Sem internet/servidor: o modal segue com os dados da lista (fallback)
      console.error('Erro ao buscar disciplina para edição:', err);
    }
  };

  const abrirTrocaProfessor = (m) => {
    setMatriculaEditando(m);
    setNovoProfessorEmail(m.professor.email);
  };

  // Classes literais completas (o Tailwind não gera classes a partir de template dinâmico)
  const abas = [
    { id: 'overview', label: 'Visão Geral', ativo: 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' },
    { id: 'tutoria', label: `Tutoria Inclusiva (${tutorados.length})`, ativo: 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400' },
    { id: 'disciplinas', label: `Disciplinas (${disciplinas.length})`, ativo: 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' },
    { id: 'professores', label: `Professores (${professores.length})`, ativo: 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' },
    { id: 'matriculas', label: `Matrículas & Documentos (${matriculas.length})`, ativo: 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' },
  ];

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
          <ThemeToggle isDarkMode={isDarkMode} setTheme={setTheme} variant="dashboard" />
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
          <TabVisaoGeral
            tutorados={tutorados}
            disciplinas={disciplinas}
            professores={professores}
            matriculas={matriculas}
          />
        )}

        {/* 2. ABA TUTORIA INCLUSIVA */}
        {!loading && activeTab === 'tutoria' && (
          <TabTutoria
            tutorados={tutorados}
            matriculaTutorar={matriculaTutorar}
            setMatriculaTutorar={setMatriculaTutorar}
            onVincularTutor={handleVincularTutor}
          />
        )}

        {/* 3. ABA DISCIPLINAS */}
        {!loading && activeTab === 'disciplinas' && (
          <TabDisciplinas
            disciplinas={disciplinas}
            novaDisciplina={novaDisciplina}
            setNovaDisciplina={setNovaDisciplina}
            onAddDisciplina={handleAddDisciplina}
            onEditarDisciplina={abrirEdicaoDisciplina}
            onDeletarDisciplina={handleDeletarDisciplina}
          />
        )}

        {/* 4. ABA PROFESSORES */}
        {!loading && activeTab === 'professores' && <TabProfessores professores={professores} />}

        {/* 5. ABA MATRÍCULAS COM VISUALIZAÇÃO DE DOCUMENTOS */}
        {!loading && activeTab === 'matriculas' && (
          <TabMatriculas
            matriculas={matriculas}
            professores={professores}
            disciplinas={disciplinas}
            novaMatricula={novaMatricula}
            setNovaMatricula={setNovaMatricula}
            onAddMatricula={handleAddMatricula}
            onVerDocumentos={abrirModalDocumentos}
            onMudarProfessor={abrirTrocaProfessor}
            onDeletarMatricula={handleDeletarMatricula}
          />
        )}
      </main>

      {/* MODAL 1: EDITAR NOME DE DISCIPLINA */}
      {disciplinaEditando && (
        <ModalEditarDisciplina
          disciplina={disciplinaEditando}
          novoNome={novoNomeDisciplina}
          setNovoNome={setNovoNomeDisciplina}
          onSubmit={handleEditarNomeDisciplina}
          onCancelar={() => setDisciplinaEditando(null)}
        />
      )}

      {/* MODAL 2: MUDAR PROFESSOR DA MATRÍCULA */}
      {matriculaEditando && (
        <ModalMudarProfessor
          matricula={matriculaEditando}
          professores={professores}
          novoEmail={novoProfessorEmail}
          setNovoEmail={setNovoProfessorEmail}
          onSubmit={handleMudarProfessor}
          onCancelar={() => setMatriculaEditando(null)}
        />
      )}

      {/* MODAL 3: VISUALIZAR E BAIXAR DOCUMENTOS / LAUDOS (COORDENAÇÃO) */}
      {matriculaDocsVisualizando && (
        <ModalDocumentosMatricula
          matricula={matriculaDocsVisualizando}
          documentos={documentosMatricula}
          loading={loadingDocs}
          onFechar={() => setMatriculaDocsVisualizando(null)}
          onDownload={handleDownloadDocumento}
          onDeletar={handleDeletarDocumento}
        />
      )}
    </div>
  );
}
