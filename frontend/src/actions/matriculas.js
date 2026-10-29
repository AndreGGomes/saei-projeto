// Actions de matrículas (vinculam aluno, professor e disciplina).
import { executar } from './client';

export function listarMatriculas() {
  return executar(
    { method: 'get', url: '/matriculas/' },
    'Não foi possível carregar as matrículas.'
  );
}

// Usada pelo aluno: o backend devolve a lista direta.
export async function minhasMatriculasDoAluno() {
  const dados = await executar(
    { method: 'get', url: '/matriculas/minhas-matriculas-aluno' },
    'Não foi possível carregar suas disciplinas.'
  );
  return dados || [];
}

// Usada pelo professor: devolve { matriculas: [...] } no backend.
export async function minhasMatriculasDoProfessor() {
  const dados = await executar(
    { method: 'get', url: '/matriculas/minhas-matriculas-professor' },
    'Não foi possível carregar suas matrículas.'
  );
  return dados?.matriculas || [];
}

export function criarMatricula({ alunoMatricula, professorEmail, disciplinaCodigo }) {
  return executar(
    {
      method: 'post',
      url: '/matriculas/criar',
      data: {
        aluno_matricula: alunoMatricula,
        professor_email: professorEmail,
        disciplina_codigo: disciplinaCodigo,
      },
    },
    'Não foi possível criar a matrícula.'
  );
}

export function mudarProfessorDaMatricula(matriculaId, novoProfessorEmail) {
  return executar(
    {
      method: 'patch',
      url: `/matriculas/${matriculaId}/mudar-professor`,
      data: { novo_professor_email: novoProfessorEmail },
    },
    'Não foi possível trocar o professor da matrícula.'
  );
}

export function cancelarMatricula(matriculaId) {
  return executar(
    { method: 'delete', url: `/matriculas/${matriculaId}` },
    'Não foi possível cancelar a matrícula.'
  );
}

// Atualiza as preferências de aprendizagem do aluno e devolve a matrícula completa,
// que o dashboard usa para manter lista e rascunho em sincronia.
export function atualizarPreferencias(matriculaId, preferencias) {
  return executar(
    {
      method: 'patch',
      url: `/matriculas/${matriculaId}/preferencias`,
      data: { preferencias_do_aluno: preferencias ?? '' },
    },
    'Não foi possível salvar as preferências.'
  );
}
