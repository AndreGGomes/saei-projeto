# Contrato específico para telas de perfil ou listagens que detalham a ficha cadastral do estudante.

from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.disciplina_schemas import DisciplinaResponse

# Permite que rotas futuras ou do front-end mostrem cartões resumidos do estudante (foto, nome e matrícula), usando o from_attributes = True para ler do banco.
class AlunoDetalhesResponse(BaseModel):
    id: int  # ou usuario_id
    nome: str
    matricula: Optional[str] = None
    foto: Optional[str] = None  # mapeado para imagem_caminho ou imagem_arquivo

    class Config:
        from_attributes = True