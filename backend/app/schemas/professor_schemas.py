# app/schemas/professor_schemas.py
from pydantic import BaseModel

class ProfessorPublico(BaseModel):
    id: int
    nome: str
    imagem_arquivo: str | None = None
    imagem_caminho: str | None = None
    role: UserRole

    class Config:
        from_attributes = True

class ProfessorPrivado(ProfessorPublico):
    email: EmailStr
    matricula: Optional[str] = None  # Necessário se role == ALUNO