import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  auth,
  coordenador as acoesCoordenador,
  disciplinas as acoesDisciplinas,
  documentos as acoesDocumentos,
  matriculas as acoesMatriculas,
} from '../actions';
import useTheme from '../hooks/useTheme';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAvisos } from '../ui/avisos';
import { IconeDocumento, IconeGrafico, IconeLivro, IconeTutoria, IconeUsuarios } from '../ui/icons';
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

// Painel da coordenação: estado, carga e handlers aqui; visual nas abas, modais e shell.
export default function DashboardCoordenador() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('overview');

  // Lido direto da sessão no primeiro render (sem setState dentro de efeito)
  const [usuario] = useState(() => auth.usuarioDaSessao());
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [tutorados, setTutorados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const { isDarkMode, setTheme } = useTheme();

  const [novaDisciplina, setNovaDisciplina] = useState({ nome: '', codigo: '' });
  const [novaMatricula, setNovaMatricula] = useState({
    aluno_matricula: '',
    professor_email: '',
    disciplina_codigo: '',
  });
  const [matriculaTutorar, setMatriculaTutorar] = useState('');

  const [disciplinaEditando, setDisciplinaEditando] = useState(null);
  const [novoNomeDisciplina, setNovoNomeDisciplina] = useState('');
  const [matriculaEditando, setMatriculaEditando] = useState(null);
  const [novoProfessorEmail, setNovoProfessorEmail] = useState('');

  const [matriculaDocsVisualizando, setMatriculaDocsVisualizando] = useState(null);
  const [documentosMatricula, setDocumentosMatricula] = useState({
    enviados_pelo_aluno: [],
    enviados_pelo_professor: [],
  });
  const [loadingDocs, setLoadingDocs] = useState(false);

  const handleLogout = () => encerrarSessao(navigate);

  const { sucesso, erro: avisarErro, confirmar } = useAvisos();

  // 1. CARGA COMPLETA
  // Cadeia de promises: os setState acontecem nos callbacks, nunca de forma síncrona
  // dentro do efeito de mount (regra react-hooks/set-state-in-effect).
  const carregarDadosDoBanco = useCallback(() => {
    return Promise.all([
      acoesDisciplinas.listarDisciplinas(),
      auth.listarProfessores(),
      acoesMatriculas.listarMatriculas(),
      acoesCoordenador.listarMeusVinculos(),
    ])
      .then(([listaDisciplinas, listaProfessores, listaMatriculas, listaTutorados]) => {
        setDisciplinas(listaDisciplinas);
        setProfessores(listaProfessores);
        setMatriculas(listaMatriculas);
        setTutorados(listaTutorados);
        setErro('');
      })
      .catch((err) => {
        console.error('Erro ao carregar dados:', err);
        if (err.status === 401 || err.status === 403) {
          avisarErro('Sua sessão expirou. Entre novamente para continuar.');
          encerrarSessao(navigate);
          return;
        }
        setErro(err.message || 'Não foi possível carregar os dados do servidor.');
      })
      .finally(() => setLoading(false));
  }, [navigate, avisarErro]);

  useEffect(() => {
    carregarDadosDoBanco();
  }, [carregarDadosDoBanco]);

  // Recarga manual pelo botão do cabeçalho (handler, pode mexer no loading na hora)
  const atualizarDados = () => {
    setLoading(true);
    carregarDadosDoBanco();
  };

  // 2. DOCUMENTOS DE UMA MATRÍCULA
  const abrirModalDocumentos = async (matricula) => {
    setMatriculaDocsVisualizando(matricula);
    setLoadingDocs(true);
    try {
      setDocumentosMatricula(await acoesDocumentos.listarDocumentosDaMatricula(matricula.id));
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
      avisarErro(err.message || 'Erro ao carregar os documentos desta matrícula.');
    } finally {
      setLoadingDocs(false);
    }
  };

  // 3. DOWNLOAD E EXCLUSÃO
  const handleDownloadDocumento = (docId, titulo) =>
    baixarDocumento(docId, titulo).catch((err) => avisarErro(err.message));

  const handleDeletarDocumento = async (docId) => {
    const confirmado = await confirmar({
      titulo: 'Excluir documento permanentemente?',
      mensagem: 'Como coordenação, a exclusão vale para o aluno e para o professor desta matrícula.',
      textoConfirmar: 'Excluir documento',
    });
    if (!confirmado) return;

    try {
      await acoesDocumentos.excluirDocumento(docId);
      sucesso('Documento excluído.');
      if (matriculaDocsVisualizando) abrirModalDocumentos(matriculaDocsVisualizando);
    } catch (err) {
      console.error('Erro ao excluir documento:', err);
      avisarErro(err.message || 'Erro ao excluir documento.');
    }
  };

  // 4. DISCIPLINAS
  const handleAddDisciplina = async (e) => {
    e.preventDefault();
    try {
      await acoesDisciplinas.criarDisciplina({
        nome: novaDisciplina.nome.trim(),
        codigo: novaDisciplina.codigo.trim().toUpperCase(),
      });
      setNovaDisciplina({ nome: '', codigo: '' });
      sucesso('Disciplina cadastrada.');
      carregarDadosDoBanco();
    } catch (err) {
      avisarErro(err.message || 'Erro ao cadastrar disciplina.');
    }
  };

  const handleEditarNomeDisciplina = async (e) => {
    e.preventDefault();
    if (!novoNomeDisciplina.trim()) return;

    try {
      await acoesDisciplinas.renomearDisciplina(disciplinaEditando.codigo, novoNomeDisciplina.trim());
      setDisciplinaEditando(null);
      setNovoNomeDisciplina('');
      sucesso('Nome da disciplina atualizado.');
      carregarDadosDoBanco();
    } catch (err) {
      avisarErro(err.message || 'Erro ao atualizar nome da disciplina.');
    }
  };

  const handleDeletarDisciplina = async (codigo) => {
    const confirmado = await confirmar({
      titulo: `Excluir ${codigo}?`,
      mensagem: 'As matrículas ligadas a esta disciplina também serão canceladas.',
      textoConfirmar: 'Excluir disciplina',
    });
    if (!confirmado) return;

    try {
      await acoesDisciplinas.excluirDisciplina(codigo);
      sucesso(`Disciplina ${codigo} excluída.`);
      carregarDadosDoBanco();
    } catch (err) {
      avisarErro(err.message || 'Erro ao excluir disciplina.');
    }
  };

  // 5. MATRÍCULAS
  const handleAddMatricula = async (e) => {
    e.preventDefault();
    try {
      await acoesMatriculas.criarMatricula({
        alunoMatricula: novaMatricula.aluno_matricula.trim(),
        professorEmail: novaMatricula.professor_email,
        disciplinaCodigo: novaMatricula.disciplina_codigo,
      });
      setNovaMatricula({ aluno_matricula: '', professor_email: '', disciplina_codigo: '' });
      sucesso('Matrícula efetivada.');
      carregarDadosDoBanco();
    } catch (err) {
      avisarErro(err.message || 'Erro ao efetivar matrícula.');
    }
  };

  const handleMudarProfessor = async (e) => {
    e.preventDefault();
    try {
      await acoesMatriculas.mudarProfessorDaMatricula(matriculaEditando.id, novoProfessorEmail);
      setMatriculaEditando(null);
      setNovoProfessorEmail('');
      sucesso('Professor da matrícula atualizado.');
      carregarDadosDoBanco();
    } catch (err) {
      avisarErro(err.message || 'Erro ao mudar professor.');
    }
  };

  const handleDeletarMatricula = async (id) => {
    const confirmado = await confirmar({
      titulo: 'Cancelar matrícula?',
      mensagem: 'O aluno deixa de ver a disciplina e os documentos enviados nesse vínculo.',
      textoConfirmar: 'Cancelar matrícula',
    });
    if (!confirmado) return;

    try {
      await acoesMatriculas.cancelarMatricula(id);
      sucesso('Matrícula cancelada.');
      carregarDadosDoBanco();
    } catch (err) {
      avisarErro(err.message || 'Erro ao cancelar matrícula.');
    }
  };

  // 6. TUTORIA
  const handleVincularTutor = async (e) => {
    e.preventDefault();
    if (!matriculaTutorar.trim()) return;

    try {
      await acoesCoordenador.definirCoordenadorTutor(matriculaTutorar.trim());
      sucesso('Tutoria assumida. O aluno já aparece no seu acompanhamento.');
      setMatriculaTutorar('');
      carregarDadosDoBanco();
    } catch (err) {
      avisarErro(err.message || 'Erro ao vincular tutoria.');
    }
  };

  // 7. MODAIS
  const abrirEdicaoDisciplina = async (disc) => {
    setDisciplinaEditando(disc);
    setNovoNomeDisciplina(disc.nome);
    try {
      const atual = await acoesDisciplinas.buscarDisciplina(disc.codigo);
      setDisciplinaEditando(atual);
      setNovoNomeDisciplina(atual.nome);
    } catch (err) {
      // Sem servidor: o modal segue com os dados da lista (fallback)
      console.error('Erro ao buscar disciplina para edição:', err);
    }
  };

  const abrirTrocaProfessor = (m) => {
    setMatriculaEditando(m);
    setNovoProfessorEmail(m.professor.email);
  };

  const abas = [
    { id: 'overview', label: 'Visão geral', icone: <IconeGrafico className="h-4 w-4" /> },
    {
      id: 'tutoria',
      label: 'Tutoria',
      icone: <IconeTutoria className="h-4 w-4" />,
      contagem: tutorados.length,
    },
    {
      id: 'disciplinas',
      label: 'Disciplinas',
      icone: <IconeLivro className="h-4 w-4" />,
      contagem: disciplinas.length,
    },
    {
      id: 'professores',
      label: 'Professores',
      icone: <IconeUsuarios className="h-4 w-4" />,
      contagem: professores.length,
    },
    {
      id: 'matriculas',
      label: 'Matrículas',
      icone: <IconeDocumento className="h-4 w-4" />,
      contagem: matriculas.length,
    },
  ];

  return (
    <>
      <DashboardLayout
        papel="COORDENADOR"
        titulo="Coordenação pedagógica"
        descricao="Gerencie disciplinas, vínculos e o acompanhamento inclusivo."
        usuario={usuario}
        isDarkMode={isDarkMode}
        setTheme={setTheme}
        onSair={handleLogout}
        onAtualizar={atualizarDados}
        abas={abas}
        abaAtiva={abaAtiva}
        onChangeAba={setAbaAtiva}
        carregando={loading}
        mensagemCarregando="Carregando dados da coordenação..."
        erro={erro}
      >
        {abaAtiva === 'overview' && (
          <TabVisaoGeral
            tutorados={tutorados}
            disciplinas={disciplinas}
            professores={professores}
            matriculas={matriculas}
          />
        )}

        {abaAtiva === 'tutoria' && (
          <TabTutoria
            tutorados={tutorados}
            matriculaTutorar={matriculaTutorar}
            setMatriculaTutorar={setMatriculaTutorar}
            onVincularTutor={handleVincularTutor}
          />
        )}

        {abaAtiva === 'disciplinas' && (
          <TabDisciplinas
            disciplinas={disciplinas}
            novaDisciplina={novaDisciplina}
            setNovaDisciplina={setNovaDisciplina}
            onAddDisciplina={handleAddDisciplina}
            onEditarDisciplina={abrirEdicaoDisciplina}
            onDeletarDisciplina={handleDeletarDisciplina}
          />
        )}

        {abaAtiva === 'professores' && <TabProfessores professores={professores} />}

        {abaAtiva === 'matriculas' && (
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
      </DashboardLayout>

      {disciplinaEditando && (
        <ModalEditarDisciplina
          disciplina={disciplinaEditando}
          novoNome={novoNomeDisciplina}
          setNovoNome={setNovoNomeDisciplina}
          onSubmit={handleEditarNomeDisciplina}
          onCancelar={() => setDisciplinaEditando(null)}
        />
      )}

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
    </>
  );
}
