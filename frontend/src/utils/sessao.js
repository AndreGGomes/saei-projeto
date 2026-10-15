// Responsabilidade única: encerrar a sessão local do usuário (limpar credenciais e voltar ao login).
// Antes este handler estava duplicado nos dois dashboards.
export function encerrarSessao(navigate) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  navigate('/login');
}
