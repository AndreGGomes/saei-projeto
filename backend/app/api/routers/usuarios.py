from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.models import Usuario, UserRole
from app.schemas import auth_schemas, usuario_schemas
from app.api.dependencies import get_current_user, get_usuario_service
from app.services.usuario_service import UsuarioService

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/register", response_model=usuario_schemas.UsuarioPrivado, status_code=status.HTTP_201_CREATED)
def register(
    user_in: usuario_schemas.UsuarioCreate, 
    service: UsuarioService = Depends(get_usuario_service)
):
    return service.registrar_usuario(user_in)

@router.post("/login", response_model=auth_schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    service: UsuarioService = Depends(get_usuario_service)
):
    return service.autenticar_usuario(form_data.username, form_data.password)

@router.get("/me", response_model=usuario_schemas.UsuarioPrivado)
def read_users_me(current_user: Usuario = Depends(get_current_user)):
    """Retorna o usuário atualmente autenticado."""
    if current_user.role == UserRole.ALUNO and current_user.perfil_aluno:
        current_user.matricula = current_user.perfil_aluno.matricula
    return current_user

@router.get("/{user_id}", response_model=usuario_schemas.UsuarioPublico)
def get_user(
    user_id: int, 
    service: UsuarioService = Depends(get_usuario_service)
):
    """Retorna dados públicos de um usuário específico."""
    return service.buscar_usuario(user_id)