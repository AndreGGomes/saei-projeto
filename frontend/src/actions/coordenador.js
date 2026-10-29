// Actions exclusivas do coordenador.
import { executar } from './client';

export async function listarMeusVinculos() {
  const dados = await executar(
    { method: 'get', url: '/coordenador/meus-vinculos' },
    'Não foi possível carregar seus vínculos de tutoria.'
  );
  return dados?.tutorados || [];
}

export function definirCoordenadorTutor(alunoMatricula) {
  return executar(
    {
      method: 'post',
      url: '/aluno/definir-coordenador-tutor',
      data: { aluno_matricula: alunoMatricula },
    },
    'Não foi possível definir você como tutor deste aluno.'
  );
}
