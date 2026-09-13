# app/api/routers/usuarios.py (ou o nome do seu arquivo de router)
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.models import Usuario, UserRole
from app.schemas import auth_schemas, usuario_schemas
from app.api.dependencies import get_current_user, get_usuario_service
from app.services.usuario_service import UsuarioService

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/register/aluno", response_model=usuario_schemas.UsuarioPrivado, status_code=status.HTTP_201_CREATED)
def register_aluno(
    user_in: usuario_schemas.AlunoCreate, 
    service: UsuarioService = Depends(get_usuario_service)
):
    """Registra um novo aluno no sistema."""
    return service.registrar_aluno(user_in)

@router.post("/register/professor", response_model=usuario_schemas.UsuarioPrivado, status_code=status.HTTP_201_CREATED)
def register_professor(
    user_in: usuario_schemas.FuncionarioCreate, 
    service: UsuarioService = Depends(get_usuario_service)
):
    """Registra um novo professor no sistema."""
    return service.registrar_professor(user_in)

@router.post("/register/coordenador", response_model=usuario_schemas.UsuarioPrivado, status_code=status.HTTP_201_CREATED)
def register_coordenador(
    user_in: usuario_schemas.FuncionarioCreate, 
    service: UsuarioService = Depends(get_usuario_service)
):
    """Registra um novo coordenador no sistema."""
    return service.registrar_coordenador(user_in)

@router.post("/login", response_model=auth_schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    service: UsuarioService = Depends(get_usuario_service)
):
    """Realiza a autenticação do usuário retornando o token JWT."""
    return service.autenticar_usuario(form_data.username, form_data.password)

@router.get("/me", response_model=usuario_schemas.UsuarioPrivado)
def read_users_me(current_user: Usuario = Depends(get_current_user)):
    """Retorna o usuário atualmente autenticado."""
    return current_user

@router.get("/{user_id}", response_model=usuario_schemas.UsuarioPublico)
def get_user(
    user_id: int, 
    service: UsuarioService = Depends(get_usuario_service)
):
    """Retorna dados públicos de um usuário específico."""
    return service.buscar_usuario(user_id)