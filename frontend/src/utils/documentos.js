// Responsabilidade única: baixar o arquivo físico de um documento e salvá-lo no disco
// do usuário. O HTTP fica na action; aqui só a manipulação de DOM do navegador.
import { documentos } from '../actions';

export async function baixarDocumento(docId, titulo) {
  try {
    const { blob, nomeArquivo } = await documentos.obterArquivoDocumento(docId, titulo);

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
    alert(err.message || 'Erro ao realizar download do documento.');
  }
}
