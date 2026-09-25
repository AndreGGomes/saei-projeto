from datetime import datetime
from pydantic import BaseModel
from app.models import TipoDocumento

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