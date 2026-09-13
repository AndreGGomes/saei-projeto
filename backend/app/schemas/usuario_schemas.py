from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models import UserRole

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
    matricula: Optional[str] = None 

class AlunoCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    matricula: str

class FuncionarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str