from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models import UserRole

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    role: UserRole
    matricula: Optional[str] = None  # Necessário se role == ALUNO

class UsuarioPublico(BaseModel):
    id: int
    nome: str
    imagem_arquivo: str | None = None
    imagem_caminho: str | None = None
    role: UserRole

    class Config:
        from_attributes = True

class UsuarioPrivado(UsuarioPublico):
    email: EmailStr
    matricula: Optional[str] = None  # Necessário se role == ALUNO