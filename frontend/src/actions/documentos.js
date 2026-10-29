// Actions de documentos: listagem por matrícula, upload, exclusão, download e resumo por IA.
import { executar, requisitar } from './client';

// Devolve sempre o mesmo formato, mesmo quando o backend omite uma das listas.
export async function listarDocumentosDaMatricula(matriculaId) {
  const dados = await executar(
    { method: 'get', url: `/documentos/matricula/${matriculaId}` },
    'Não foi possível carregar os documentos desta matrícula.'
  );

  return {
    enviados_pelo_aluno: dados?.enviados_pelo_aluno || [],
    enviados_pelo_professor: dados?.enviados_pelo_professor || [],
  };
}

export function enviarDocumento(matriculaId, { titulo, tipo, arquivo }) {
  const corpo = new FormData();
  corpo.append('titulo', titulo);
  corpo.append('tipo', tipo);
  corpo.append('arquivo', arquivo);

  return executar(
    {
      method: 'post',
      url: `/documentos/upload/${matriculaId}`,
      data: corpo,
      headers: { 'Content-Type': 'multipart/form-data' },
    },
    'Não foi possível enviar o documento.'
  );
}

export function excluirDocumento(documentoId) {
  return executar(
    { method: 'delete', url: `/documentos/${documentoId}` },
    'Não foi possível excluir o documento.'
  );
}

export function gerarResumoIA(documentoId) {
  return executar(
    { method: 'post', url: `/documentos/${documentoId}/resumo-ia` },
    'Não foi possível gerar o resumo agora. Tente novamente em instantes.'
  );
}

// Baixa o binário e devolve o nome sugerido pelo Content-Disposition do backend.
// A manipulação do DOM (link de download) fica em utils/documentos.js.
export async function obterArquivoDocumento(documentoId, titulo) {
  const resposta = await requisitar(
    { method: 'get', url: `/documentos/download/${documentoId}`, responseType: 'blob' },
    'Não foi possível baixar o documento.'
  );

  let nomeArquivo = titulo || 'documento';
  const disposicao = resposta.headers['content-disposition'];
  if (disposicao && disposicao.includes('filename=')) {
    const encontrado = disposicao.match(/filename="?([^"]+)"?/);
    if (encontrado && encontrado[1]) {
      nomeArquivo = decodeURIComponent(encontrado[1]);
    }
  }

  if (!nomeArquivo.includes('.')) {
    nomeArquivo = `${nomeArquivo}.pdf`;
  }

  return {
    blob: new Blob([resposta.data], {
      type: resposta.headers['content-type'] || 'application/pdf',
    }),
    nomeArquivo,
  };
}
