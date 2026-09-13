# app/services/usuario_service.py
from datetime import timedelta
from app.core import auth
from app.models import Usuario, Aluno, Professor, Coordenador, UserRole
from app.schemas.usuario_schemas import AlunoCreate, FuncionarioCreate
from app.core.config import settings
from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.aluno_repository import AlunoRepository
from app.core.exceptions import (
    MatriculaObrigatoriaError, MatriculaJaCadastradaError, 
    EmailJaEmUsoError, MultiplasContasError, 
    CredenciaisInvalidasError, UsuarioNaoEncontradoError
)

class UsuarioService:
    def __init__(self, usuario_repo: UsuarioRepository, aluno_repo: AlunoRepository):
        self.usuario_repo = usuario_repo
        self.aluno_repo = aluno_repo

    # --- MÉTODOS PÚBLICOS ESPECÍFICOS ---

    def registrar_aluno(self, dados: AlunoCreate) -> Usuario:
        if self.aluno_repo.buscar_por_matricula(dados.matricula):
            raise MatriculaJaCadastradaError("Esta matrícula já está cadastrada.")
            
        usuario_base = self._preparar_usuario_base(dados, UserRole.ALUNO)
        perfil = Aluno(matricula=dados.matricula)
        
        user_salvo = self.usuario_repo.criar_usuario_com_perfil(usuario_base, perfil)
        user_salvo.matricula = dados.matricula 
        return user_salvo

    def registrar_professor(self, dados: FuncionarioCreate) -> Usuario:
        self._verificar_email_funcionario(dados.email)
            
        usuario_base = self._preparar_usuario_base(dados, UserRole.PROFESSOR)
        perfil = Professor()
        
        return self.usuario_repo.criar_usuario_com_perfil(usuario_base, perfil)

    def registrar_coordenador(self, dados: FuncionarioCreate) -> Usuario:
        self._verificar_email_funcionario(dados.email)
            
        usuario_base = self._preparar_usuario_base(dados, UserRole.COORDENADOR)
        perfil = Coordenador()
        
        return self.usuario_repo.criar_usuario_com_perfil(usuario_base, perfil)

    def autenticar_usuario(self, identificador: str, password: str) -> dict:
        user = None

        if "@" in identificador:
            usuarios_encontrados = self.usuario_repo.buscar_todos_por_email(identificador.lower())
            if len(usuarios_encontrados) == 1:
                user = usuarios_encontrados[0]
            elif len(usuarios_encontrados) > 1:
                raise MultiplasContasError("Múltiplas contas encontradas. Faça login utilizando a Matrícula do aluno.")
        else:
            aluno = self.aluno_repo.buscar_por_matricula(identificador)
            if aluno:
                user = aluno.usuario

        if not user or not auth.verify_password(password, user.senha_hash):
            raise CredenciaisInvalidasError("Credenciais incorretas")
        
        token = auth.create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role.value}, 
            expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
        )
        return {"access_token": token, "token_type": "bearer"}

    def buscar_usuario(self, user_id: int) -> Usuario:
        user = self.usuario_repo.buscar_por_id(user_id)
        if not user:
            raise UsuarioNaoEncontradoError("Usuário não encontrado")
        return user
    # --- MÉTODOS PRIVADOS REUTILIZÁVEIS ---

    def _preparar_usuario_base(self, dados, role: UserRole) -> Usuario:
        """Cria a entidade base compartilhada por todos os tipos de conta."""
        return Usuario(
            nome=dados.nome,
            email=dados.email.lower(),
            senha_hash=auth.hash_password(dados.senha),
            role=role
        )

    def _verificar_email_funcionario(self, email: str):
        """Regra de negócio compartilhada por staff."""
        if self.usuario_repo.buscar_funcionarios_por_email(email.lower()):
            raise EmailJaEmUsoError("Este e-mail já está em uso por outro funcionário.")