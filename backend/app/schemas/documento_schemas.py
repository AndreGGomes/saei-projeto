
# app/schemas/documento_schemas.py
from pydantic import BaseModel
from typing import List
from app.models import TipoDocumento
from datetime import datetime

class ResumoIAResponse(BaseModel):
    titulo_documento: str
    resumo_geral: str
    pontos_chave: List[str]
    proximos_passos_ou_recomendacoes: str
    links_estudo: List[str] = []
    aviso_ia: str

# Resumo público de quem enviou o documento
class RemetenteResumo(BaseModel):
    id: int
    nome: str
    role: str

    class Config:
        from_attributes = True

# Representação de um documento individual
class DocumentoResponse(BaseModel):
    id: int
    titulo: str
    tipo: TipoDocumento
    data_upload: datetime | None = None
    matricula_id: int
    remetente: RemetenteResumo

    class Config:
        from_attributes = True

# Lista de documentos enviados pelo aluno e pelo professor
class MatriculaDocumentosResponse(BaseModel):
    matricula_id: int
    enviados_pelo_aluno: list[DocumentoResponse]
    enviados_pelo_professor: list[DocumentoResponse]

    class Config:
        from_attributes = True

