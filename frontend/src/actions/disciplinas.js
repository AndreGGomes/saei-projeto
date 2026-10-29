// Actions de disciplinas.
import { executar } from './client';

export function listarDisciplinas() {
  return executar(
    { method: 'get', url: '/disciplinas/' },
    'Não foi possível carregar as disciplinas.'
  );
}

export function buscarDisciplina(codigo) {
  return executar(
    { method: 'get', url: `/disciplinas/${codigo}` },
    'Não foi possível carregar os dados da disciplina.'
  );
}

export function criarDisciplina({ nome, codigo }) {
  return executar(
    { method: 'post', url: '/disciplinas/criar', data: { nome, codigo } },
    'Não foi possível criar a disciplina.'
  );
}

export function renomearDisciplina(codigo, novoNome) {
  return executar(
    { method: 'patch', url: `/disciplinas/${codigo}/nome`, data: { novo_nome: novoNome } },
    'Não foi possível renomear a disciplina.'
  );
}

export function excluirDisciplina(codigo) {
  return executar(
    { method: 'delete', url: `/disciplinas/${codigo}` },
    'Não foi possível excluir a disciplina.'
  );
}
