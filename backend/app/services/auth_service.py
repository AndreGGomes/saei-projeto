# Autenticação: valida as credenciais do usuário (e-mail ou matrícula) e emite o JWT de acesso.
# Separado do UsuarioService para que o cadastro/consulta de usuários não concentre também a mecânica de login.

from datetime import timedelta
from app.core import auth
from app.core.config import settings
from app.core.exceptions import CredenciaisInvalidasError, MultiplasContasError
from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.aluno_repository import AlunoRepository

class AuthService:
    def __init__(
            self,
            usuario_repo: UsuarioRepository,
            aluno_repo: AlunoRepository
        ):
        self.usuario_repo = usuario_repo
        self.aluno_repo = aluno_repo

    # Autenticação do usuário (email ou matrícula)
    def autenticar_usuario(self, identificador: str, password: str) -> dict:
    # O usuário digita um valor no campo de usuário (identificador)
        user = None

        # Se tiver @: O sistema entende que é um e-mail. Busca todos os usuários com aquele e-mail. Se encontrar apenas um, é ele. Se houver mais de um, o sistema impede a ambiguidade lançando MultiplasContasError e exigindo que a pessoa use a matrícula.
        if "@" in identificador:
            usuarios_encontrados = self.usuario_repo.buscar_todos_por_email(identificador.lower())
            if len(usuarios_encontrados) == 1:
                user = usuarios_encontrados[0]
            elif len(usuarios_encontrados) > 1:
                raise MultiplasContasError("Múltiplas contas encontradas. Faça login utilizando a Matrícula do aluno.")
        # Se NÃO tiver @: O sistema entende que é uma matrícula de aluno. Busca o aluno correspondente e puxa o objeto de usuário vinculado (aluno.usuario).
        else:
            aluno = self.aluno_repo.buscar_por_matricula(identificador)
            if aluno:
                user = aluno.usuario

        # Se o usuário não existir OU a senha digitada não bater com o hash salvo, estoura CredenciaisInvalidasError.
        if not user or not auth.verify_password(password, user.senha_hash):
            raise CredenciaisInvalidasError("Credenciais incorretas")

        # Com a senha validada, monta o token contendo o ID do usuário (sub), e-mail e papel (role), com o tempo de validade definido em settings. Retorna o token com o padrão bearer.
        token = auth.create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role.value}, 
            expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
        )
        return {"access_token": token, "token_type": "bearer"}
