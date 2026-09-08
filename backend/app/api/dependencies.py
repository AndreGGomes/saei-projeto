from typing import Annotated
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core import auth
from app.db.database import get_db
from app.repositories.usuario_repository import UsuarioRepository
from app.services.usuario_service import UsuarioService

# 1. Construtor do Service
def get_usuario_service(db: Session = Depends(get_db)) -> UsuarioService:
    repository = UsuarioRepository(db)
    return UsuarioService(repository)

# 2. Proteção de Rotas Refatorada
def get_current_user(
    token: Annotated[str, Depends(auth.oauth2_scheme)], 
    service: UsuarioService = Depends(get_usuario_service)
):
    user_id = auth.verify_access_token(token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    
    try:
        user = service.buscar_usuario(int(user_id))
        return user
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token malformado")