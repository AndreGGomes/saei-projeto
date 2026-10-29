// Responsabilidade única: encerrar a sessão local do usuário (limpar credenciais e voltar ao login).
// Antes este handler estava duplicado nos dois dashboards.
import { auth } from '../actions';

export function encerrarSessao(navigate) {
  auth.encerrarSessaoLocal();
  navigate('/login');
}
