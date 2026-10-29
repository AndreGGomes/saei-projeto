// Base da camada de actions: o ÚNICO lugar do front que faz HTTP.
//
// Nenhum componente ou página importa o axios/`services/api` diretamente. Cada ação
// de domínio (auth, documentos, ia, ...) usa estes helpers, então a URL, o formato do
// corpo e a mensagem de erro de cada endpoint ficam definidos em um só lugar — e o JSX
// fica só com estado de tela.
//
// Toda falha sai daqui como ErroAcao, já com a mensagem de `detail` do FastAPI ou com
// um texto padrão em português adequado ao contexto da ação.

import api from '../services/api';

export class ErroAcao extends Error {
  constructor(mensagem, { status = null, causa = null } = {}) {
    super(mensagem);
    this.name = 'ErroAcao';
    this.status = status;
    this.causa = causa;
  }
}

// Extrai a mensagem que o backend mandou em {"detail": "..."} e cai no texto padrão
// quando a falha é de rede, CORS ou timeout.
function extrairMensagem(erro, mensagemPadrao) {
  const detalhe = erro?.response?.data?.detail;
  if (typeof detalhe === 'string' && detalhe.trim()) return detalhe;
  return mensagemPadrao;
}

// Executa a requisição e devolve a resposta completa (útil para blob/headers).
export async function requisitar(config, mensagemPadrao) {
  try {
    return await api.request(config);
  } catch (erro) {
    throw new ErroAcao(extrairMensagem(erro, mensagemPadrao), {
      status: erro?.response?.status ?? null,
      causa: erro,
    });
  }
}

// Executa a requisição e devolve apenas o corpo JSON (caso de uso mais comum).
export async function executar(config, mensagemPadrao) {
  const resposta = await requisitar(config, mensagemPadrao);
  return resposta.data;
}
