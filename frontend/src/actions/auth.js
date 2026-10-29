// Actions de autenticação e sessão.
import { executar } from './client';

// Autentica, guarda token + usuário na sessão local e devolve o usuário logado.
// O token precisa ser gravado antes do /auth/me porque o interceptor do axios
// lê o localStorage a cada requisição.
export async function entrar(identificador, senha) {
  const corpo = new URLSearchParams();
  corpo.append('username', identificador.trim());
  corpo.append('password', senha);

  const sessao = await executar(
    {
      method: 'post',
      url: '/auth/login',
      data: corpo,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    'Não foi possível entrar. Verifique e-mail/matrícula e senha.'
  );

  localStorage.setItem('token', sessao.access_token);

  const usuario = await buscarUsuarioLogado();
  localStorage.setItem('user', JSON.stringify(usuario));
  return usuario;
}

export function buscarUsuarioLogado() {
  return executar(
    { method: 'get', url: '/auth/me' },
    'Não foi possível carregar os dados do seu perfil.'
  );
}

export function buscarPerfil(usuarioId) {
  return executar(
    { method: 'get', url: `/auth/${usuarioId}` },
    'Não foi possível carregar o perfil deste usuário.'
  );
}

export function listarProfessores() {
  return executar(
    { method: 'get', url: '/auth/professores' },
    'Não foi possível carregar a lista de professores.'
  );
}

// O cadastro é um endpoint por papel; a assinatura é a mesma para os três.
const ENDPOINT_POR_PAPEL = {
  ALUNO: '/auth/register/aluno',
  PROFESSOR: '/auth/register/professor',
  COORDENADOR: '/auth/register/coordenador',
};

export function registrar({ papel, nome, email, senha, matricula }) {
  const url = ENDPOINT_POR_PAPEL[papel];
  if (!url) {
    return Promise.reject(new Error(`Papel de acesso desconhecido: ${papel}`));
  }

  return executar(
    {
      method: 'post',
      url,
      data: { nome, email, senha, ...(papel === 'ALUNO' ? { matricula } : {}) },
    },
    'Não foi possível concluir o cadastro. Tente novamente em instantes.'
  );
}

export function encerrarSessaoLocal() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Mantido para leitura de tela: devolve o usuário salvo no login, sem ir à rede.
export function usuarioDaSessao() {
  try {
    const bruto = localStorage.getItem('user');
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}
