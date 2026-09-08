# app/services/usuario_service.py
from datetime import timedelta
from app.core import auth
from app.models import Usuario, Aluno, Professor, Coordenador, UserRole
from app.schemas import schemas
from app.core.config import settings
from app.repositories.usuario_repository import UsuarioRepository
from app.core.exceptions import (
    MatriculaObrigatoriaError, MatriculaJaCadastradaError, 
    EmailJaEmUsoError, MultiplasContasError, 
    CredenciaisInvalidasError, UsuarioNaoEncontradoError
)

class UsuarioService:
    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def registrar_usuario(self, user_in: schemas.UsuarioCreate) -> Usuario:
        if user_in.role == UserRole.ALUNO:
            if not user_in.matricula:
                raise MatriculaObrigatoriaError("Matrícula é obrigatória para alunos.")
            if self.repository.buscar_por_matricula(user_in.matricula):
                raise MatriculaJaCadastradaError("Esta matrícula já está cadastrada.")
        else:
            if self.repository.buscar_funcionarios_por_email(user_in.email.lower()):
                raise EmailJaEmUsoError("Este e-mail já está em uso por outro funcionário.")

        novo_usuario = Usuario(
            nome=user_in.nome,
            email=user_in.email.lower(),
            senha_hash=auth.hash_password(user_in.senha),
            role=user_in.role
        )

        perfil_obj = None
        if user_in.role == UserRole.ALUNO:
            perfil_obj = Aluno(matricula=user_in.matricula)
        elif user_in.role == UserRole.PROFESSOR:
            perfil_obj = Professor()
        elif user_in.role == UserRole.COORDENADOR:
            perfil_obj = Coordenador()

        user_salvo = self.repository.criar_usuario_com_perfil(novo_usuario, perfil_obj)
        
        if user_in.role == UserRole.ALUNO:
            user_salvo.matricula = user_in.matricula 

        return user_salvo

    def autenticar_usuario(self, identificador: str, password: str) -> dict:
        user = None

        if "@" in identificador:
            usuarios_encontrados = self.repository.buscar_todos_por_email(identificador.lower())
            if len(usuarios_encontrados) == 1:
                user = usuarios_encontrados[0]
            elif len(usuarios_encontrados) > 1:
                raise MultiplasContasError("Múltiplas contas encontradas. Faça login utilizando a Matrícula do aluno.")
        else:
            aluno = self.repository.buscar_por_matricula(identificador)
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
        user = self.repository.buscar_por_id(user_id)
        if not user:
            raise UsuarioNaoEncontradoError("Usuário não encontrado")
        return user