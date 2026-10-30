// Responsabilidade única: baixar o arquivo físico de um documento e salvá-lo no disco
// do usuário. O HTTP fica na action; aqui só a manipulação de DOM do navegador.
// Falhas sobem como exceção para a tela decidir como avisar o usuário.
import { documentos } from '../actions';

export async function baixarDocumento(docId, titulo) {
  const { blob, nomeArquivo } = await documentos.obterArquivoDocumento(docId, titulo);

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nomeArquivo);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
