import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentos as acoesDocumentos, matriculas as acoesMatriculas } from '../actions';
import useTheme from '../hooks/useTheme';
import DashboardLayout from '../layouts/DashboardLayout';
import EmptyState from '../ui/EmptyState';
import { useAvisos } from '../ui/avisos';
import { IconeBrilhos, IconeDocumento, IconeGrafico, IconeLivro } from '../ui/icons';
import { baixarDocumento } from '../utils/documentos';
import { encerrarSessao } from '../utils/sessao';
import TabVisaoGeral from '../components/aluno/TabVisaoGeral';
import TabDocumentos from '../components/aluno/TabDocumentos';
import TabPreferencias from '../components/aluno/TabPreferencias';

// Painel do aluno: concentra estado, carga de dados e handlers. A renderização fica
// nas abas de components/aluno e o shell visual em layouts/DashboardLayout.
export default function DashboardAluno() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('overview');

  const [usuario, setUsuario] = useState(null);
  const [matriculas, setMatriculas] = useState([]);
  const [matriculaSelecionada, setMatriculaSelecionada] = useState(null);
  const [documentosMatricula, setDocumentosMatricula] = useState({
    enviados_pelo_aluno: [],
    enviados_pelo_professor: [],
  });

  const [loading, setLoading] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [versaoDocs, setVersaoDocs] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState('');
  const { isDarkMode, setTheme } = useTheme();

  const [preferencias, setPreferencias] = useState({});
  const [salvandoPref, setSalvandoPref] = useState(null);
  const [prefSalva, setPrefSalva] = useState(null);

  const [uploadForm, setUploadForm] = useState({ titulo: '', tipo: 'ATIVIDADE', arquivo: null });

  const { sucesso, erro: avisarErro, confirmar } = useAvisos();

  const handleLogout = () => encerrarSessao(navigate);

  // 1. MATRÍCULAS DO ALUNO (cadeia de promises para não haver setState síncrono no efeito)
  const carregarMinhasMatriculas = useCallback(() => {
    return acoesMatriculas
      .minhasMatriculasDoAluno()
      .then((lista) => {
        const userSalvo = localStorage.getItem('user');
        if (userSalvo) setUsuario(JSON.parse(userSalvo));

        setMatriculas(lista);

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
          avisarErro('Sua sessão expirou. Entre novamente para continuar.');
          encerrarSessao(navigate);
          return;
        }
        setErro(err.message);
      })
      .finally(() => setLoading(false));
  }, [navigate, avisarErro]);

  useEffect(() => {
    carregarMinhasMatriculas();
  }, [carregarMinhasMatriculas]);

  // 2. ANEXOS DA MATRÍCULA SELECIONADA
  const carregarDocumentosDaMatricula = useCallback((matriculaId) => {
    if (!matriculaId) return Promise.resolve();
    return acoesDocumentos
      .listarDocumentosDaMatricula(matriculaId)
      .then((lista) => setDocumentosMatricula(lista))
      .catch((err) => {
        console.error('Erro ao buscar documentos da matrícula:', err);
        avisarErro(err.message || 'Erro ao carregar os anexos desta disciplina.');
      })
      .finally(() => setLoadingDocs(false));
  }, [avisarErro]);

  // Dependência no id + contador: repetir a mesma matrícula força nova carga e nunca
  // deixa o estado de carregamento preso (o objeto poderia ser a mesma referência).
  const matriculaSelecionadaId = matriculaSelecionada?.id;

  useEffect(() => {
    if (matriculaSelecionadaId) {
      carregarDocumentosDaMatricula(matriculaSelecionadaId);
    }
  }, [matriculaSelecionadaId, versaoDocs, carregarDocumentosDaMatricula]);

  // 3. UPLOAD PARA O PROFESSOR
  const handleUploadDocumento = async (e) => {
    e.preventDefault();
    if (!matriculaSelecionada) {
      avisarErro('Selecione uma disciplina antes de enviar o arquivo.');
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

      setUploadForm({ titulo: '', tipo: 'ATIVIDADE', arquivo: null });
      const fileInput = document.getElementById('inputFileAluno');
      if (fileInput) fileInput.value = '';

      sucesso('Documento enviado para revisão do professor.');
      setLoadingDocs(true);
      carregarDocumentosDaMatricula(matriculaSelecionada.id);
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
      mensagem: 'O arquivo sai da sua lista e também do painel do professor. Essa ação não pode ser desfeita.',
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

  // 5. PREFERÊNCIAS DE APRENDIZAGEM
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

      setMatriculas((prev) => prev.map((m) => (m.id === matriculaId ? matricula : m)));
      setPreferencias((prev) => ({
        ...prev,
        [matriculaId]: matricula.preferencias_do_aluno || '',
      }));
      setPrefSalva(matriculaId);
    } catch (err) {
      console.error('Erro ao salvar preferências:', err);
      avisarErro(err.message || 'Erro ao salvar suas preferências.');
    } finally {
      setSalvandoPref(null);
    }
  };

  // 6. NAVEGAÇÃO ENTRE DISCIPLINAS
  const abrirDocumentosDaMatricula = (matricula) => {
    if (!matricula) return;
    setLoadingDocs(true);
    if (matriculaSelecionada?.id === matricula.id) {
      setVersaoDocs((versao) => versao + 1);
    } else {
      setMatriculaSelecionada(matricula);
    }
  };

  const selecionarMatriculaPorId = (matriculaId) => {
    abrirDocumentosDaMatricula(matriculas.find((m) => m.id === matriculaId));
  };

  const verDocumentosDaMatricula = (m) => {
    abrirDocumentosDaMatricula(m);
    setAbaAtiva('documentos');
  };

  const abas = [
    { id: 'overview', label: 'Visão geral', icone: <IconeGrafico className="h-4 w-4" /> },
    {
      id: 'documentos',
      label: 'Documentos',
      icone: <IconeDocumento className="h-4 w-4" />,
      contagem:
        documentosMatricula.enviados_pelo_aluno.length +
        documentosMatricula.enviados_pelo_professor.length,
    },
    { id: 'preferencias', label: 'Preferências', icone: <IconeBrilhos className="h-4 w-4" /> },
  ];

  const semVinculos = !loading && matriculas.length === 0 && !erro;

  return (
    <DashboardLayout
      papel="ALUNO"
      titulo={`Olá${usuario?.nome ? `, ${usuario.nome.split(' ')[0]}` : ''}`}
      descricao="Suas disciplinas, materiais e preferências de aprendizagem."
      usuario={usuario}
      isDarkMode={isDarkMode}
      setTheme={setTheme}
      onSair={handleLogout}
      abas={abas}
      abaAtiva={abaAtiva}
      onChangeAba={setAbaAtiva}
      carregando={loading}
      mensagemCarregando="Buscando suas disciplinas..."
      erro={erro}
    >
      {semVinculos ? (
        <EmptyState
          icone={<IconeLivro className="h-6 w-6" />}
          titulo="Você ainda não está vinculado a nenhuma disciplina"
          descricao="Assim que a coordenação registrar sua matrícula, suas disciplinas e documentos aparecem aqui."
        />
      ) : (
        <>
          {abaAtiva === 'overview' && (
            <TabVisaoGeral matriculas={matriculas} onVerDocumentos={verDocumentosDaMatricula} />
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

          {abaAtiva === 'preferencias' && (
            <TabPreferencias
              matriculas={matriculas}
              preferencias={preferencias}
              onEditar={editarPreferencia}
              onSalvar={salvarPreferencia}
              salvandoId={salvandoPref}
              salvoId={prefSalva}
            />
          )}
        </>
      )}
    </DashboardLayout>
  );
}
