// Ponto único de entrada da camada de actions.
//
// Uso nas páginas e componentes:
//   import { documentos, ia } from '../actions';
//   const resumo = await documentos.gerarResumoIA(documento.id);
//
// Regra do projeto: nenhum arquivo fora de src/actions fala HTTP diretamente.

export * as auth from './auth';
export * as documentos from './documentos';
export * as ia from './ia';
export * as disciplinas from './disciplinas';
export * as matriculas from './matriculas';
export * as coordenador from './coordenador';
export { ErroAcao } from './client';
