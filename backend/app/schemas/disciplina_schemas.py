# app/schemas/disciplina_schemas.py
from pydantic import BaseModel

class DisciplinaCreate(BaseModel):
    nome: str
    codigo: str

class DisciplinaResponse(BaseModel):
    id: int
    nome: str
    codigo: str
    class Config:
        from_attributes = True