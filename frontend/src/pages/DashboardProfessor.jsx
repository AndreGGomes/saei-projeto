import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, documentos as acoesDocumentos, matriculas as acoesMatriculas } from '../actions';
import useTheme from '../hooks/useTheme';
import DashboardLayout from '../layouts/DashboardLayout';
import EmptyState from '../ui/EmptyState';
import { useAvisos } from '../ui/avisos';
import { IconeDocumento, IconeGrafico, IconeLivro, IconeUsuarios } from '../ui/icons';
import { baixarDocumento } from '../utils/documentos';
import { encerrarSessao } from '../utils/sessao';
import TabVisaoGeral from '../components/professor/TabVisaoGeral';
import TabAlunos from '../components/professor/TabAlunos';
import TabDocumentos from '../components/professor/TabDocumentos';

// Painel do professor: estado, carga de dados e handlers aqui; visual nas abas + shell.
export default function DashboardProfessor() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('overview');

  // Lido direto da sessão no primeiro render (sem setState dentro de efeito)
  const [usuario] = useState(() => auth.usuarioDaSessao());
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

  const [uploadForm, setUploadForm] = useState({
    titulo: '',
    tipo: 'PLANO_DE_AULA',
    arquivo: null,
  });

  const handleLogout = () => encerrarSessao(navigate);

  const { sucesso, erro: avisarErro, confirmar } = useAvisos();

  // 1. MATRÍCULAS SOB DOCÊNCIA
  // Cadeia de promises (e não async/await) para o setState acontecer só nos callbacks,
  // nunca de forma síncrona dentro do efeito de mount (regra react-hooks/set-state-in-effect).
  const carregarMinhasMatriculas = useCallback(() => {
    return acoesMatriculas
      .minhasMatriculasDoProfessor()
      .then((lista) => {
        setMatriculas(lista);
        setErro('');
        setMatriculaSelecionada((atual) => atual || lista[0] || null);
      })
      .catch((err) => {
        console.error('Erro ao carregar matrículas do professor:', err);
        if (err.status === 401 || err.status === 403) {
          avisarErro('Sua sessão expirou. Entre novamente para continuar.');
          encerrarSessao(navigate);
          return;
        }
        setErro(err.message || 'Não foi possível carregar suas turmas e alunos.');
      })
      .finally(() => setLoading(false));
  }, [navigate, avisarErro]);

  useEffect(() => {
    carregarMinhasMatriculas();
  }, [carregarMinhasMatriculas]);

  // 2. ANEXOS DA MATRÍCULA SELECIONADA
  // O estado de carregamento é ligado pelos handlers (eventos), não pelo efeito.
  const carregarDocumentosDaMatricula = useCallback((matriculaId) => {
    if (!matriculaId) return Promise.resolve();
    return acoesDocumentos
      .listarDocumentosDaMatricula(matriculaId)
      .then((lista) => setDocumentosMatricula(lista))
      .catch((err) => {
        console.error('Erro ao buscar documentos da matrícula:', err);
        avisarErro(err.message || 'Erro ao carregar anexos desta matrícula.');
      })
      .finally(() => setLoadingDocs(false));
  }, [avisarErro]);

  // Dependência no id: repetir a mesma matrícula não deve deixar a carga pendente.
  const matriculaSelecionadaId = matriculaSelecionada?.id;

  useEffect(() => {
    if (matriculaSelecionadaId) {
      carregarDocumentosDaMatricula(matriculaSelecionadaId);
    }
  }, [matriculaSelecionadaId, carregarDocumentosDaMatricula]);

  // 3. UPLOAD DE MATERIAL PARA O ALUNO
  const handleUploadDocumento = async (e) => {
    e.preventDefault();
    if (!matriculaSelecionada) {
      avisarErro('Selecione uma matrícula antes de enviar o material.');
      return;
    }
    if (!uploadForm.arquivo) {
      avisarErro('Escolha um arquivo para enviar.');
      return;
    }

    try {
      setUploading(true);
      await acoesDocumentos.enviarDocumento(matriculaSelecionada.id, {
        titulo: uploadForm.titulo.trim(),
        tipo: uploadForm.tipo,
        arquivo: uploadForm.arquivo,
      });

      setUploadForm({ titulo: '', tipo: 'PLANO_DE_AULA', arquivo: null });
      const fileInput = document.getElementById('inputFileProfessor');
      if (fileInput) fileInput.value = '';

      setLoadingDocs(true);
      carregarDocumentosDaMatricula(matriculaSelecionada.id);
      sucesso('Material publicado para o estudante.');
    } catch (err) {
      console.error('Erro no upload:', err);
      avisarErro(err.message || 'Falha ao realizar upload.');
    } finally {
      setUploading(false);
    }
  };

  // 4. DOWNLOAD E EXCLUSÃO
  const handleDownloadDocumento = (docId, titulo) =>
    baixarDocumento(docId, titulo).catch((err) => avisarErro(err.message));

  const handleDeletarDocumento = async (docId) => {
    const confirmado = await confirmar({
      titulo: 'Excluir documento?',
      mensagem: 'O arquivo será removido para você e para o estudante. Essa ação não pode ser desfeita.',
      textoConfirmar: 'Excluir documento',
    });
    if (!confirmado) return;

    try {
      await acoesDocumentos.excluirDocumento(docId);
      sucesso('Documento excluído.');
      setLoadingDocs(true);
      carregarDocumentosDaMatricula(matriculaSelecionada.id);
    } catch (err) {
      console.error('Erro ao deletar documento:', err);
      avisarErro(err.message || 'Erro ao excluir o documento.');
    }
  };

  // 5. NAVEGAÇÃO
  const selecionarMatriculaPorId = (matriculaId) => {
    setLoadingDocs(true);
    setMatriculaSelecionada(matriculas.find((m) => m.id === matriculaId) || null);
  };

  const verDocumentosDaMatricula = (m) => {
    setLoadingDocs(true);
    setMatriculaSelecionada(m);
    setAbaAtiva('documentos');
  };

  const disciplinasUnicas = Array.from(new Set(matriculas.map((m) => m.disciplina.codigo)));

  const abas = [
    { id: 'overview', label: 'Visão geral', icone: <IconeGrafico className="h-4 w-4" /> },
    {
      id: 'alunos',
      label: 'Alunos e disciplinas',
      icone: <IconeUsuarios className="h-4 w-4" />,
      contagem: matriculas.length,
    },
    { id: 'documentos', label: 'Documentos', icone: <IconeDocumento className="h-4 w-4" /> },
  ];

  const semTurmas = !loading && matriculas.length === 0 && !erro;

  return (
    <DashboardLayout
      papel="PROFESSOR"
      titulo={`Olá${usuario?.nome ? `, ${usuario.nome.split(' ')[0]}` : ''}`}
      descricao="Acompanhe seus estudantes e gerencie materiais inclusivos."
      usuario={usuario}
      isDarkMode={isDarkMode}
      setTheme={setTheme}
      onSair={handleLogout}
      abas={abas}
      abaAtiva={abaAtiva}
      onChangeAba={setAbaAtiva}
      carregando={loading}
      mensagemCarregando="Buscando suas turmas..."
      erro={erro}
    >
      {semTurmas ? (
        <EmptyState
          icone={<IconeLivro className="h-6 w-6" />}
          titulo="Nenhuma turma vinculada ainda"
          descricao="Quando a coordenação registrar uma matrícula sob sua responsabilidade, os estudantes aparecem aqui."
        />
      ) : (
        <>
          {abaAtiva === 'overview' && (
            <TabVisaoGeral matriculas={matriculas} disciplinasUnicas={disciplinasUnicas} />
          )}

          {abaAtiva === 'alunos' && (
            <TabAlunos matriculas={matriculas} onVerDocumentos={verDocumentosDaMatricula} />
          )}

          {abaAtiva === 'documentos' && (
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
        </>
      )}
    </DashboardLayout>
  );
}
