// Actions dos recursos de IA (resumo fica em documentos.js porque o endpoint é /documentos).
import { executar } from './client';

// Termômetro de Acessibilidade DUA a partir do PDF cadastrado.
export function avaliarAcessibilidadeDocumento(documentoId) {
  return executar(
    { method: 'post', url: `/ia/avaliar-acessibilidade/documento/${documentoId}` },
    'Não foi possível analisar a acessibilidade agora. Tente novamente em instantes.'
  );
}

// Termômetro de Acessibilidade DUA a partir do texto colado pelo professor.
export function avaliarAcessibilidadeTexto(textoMaterial) {
  return executar(
    { method: 'post', url: '/ia/avaliar-acessibilidade', data: { texto_material: textoMaterial } },
    'Erro ao comunicar com o serviço de IA.'
  );
}

export function adaptarMaterialDocumento(documentoId) {
  return executar(
    { method: 'post', url: `/ia/adaptar-material/documento/${documentoId}` },
    'Não foi possível adaptar este material agora. Tente novamente em instantes.'
  );
}

export function tutorAlunoDocumento(documentoId) {
  return executar(
    { method: 'post', url: `/ia/tutor-aluno/documento/${documentoId}` },
    'Não foi possível conectar ao Tutor Virtual agora. Tente novamente em instantes.'
  );
}
