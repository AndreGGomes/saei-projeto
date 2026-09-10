from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.disciplina_schemas import DisciplinaResponse


class AlunoDetalhesResponse(BaseModel):
    id: int  # ou usuario_id
    nome: str
    matricula: Optional[str] = None
    foto: Optional[str] = None  # mapeado para imagem_caminho ou imagem_arquivo

    class Config:
        from_attributes = True