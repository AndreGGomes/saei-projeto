import api from '../services/api';

// Responsabilidade única: baixar o arquivo físico de um documento a partir do backend,
// respeitando o filename enviado no header e salvando via blob do navegador.
// Antes este handler estava duplicado nos dois dashboards.
export async function baixarDocumento(docId, titulo) {
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
}
