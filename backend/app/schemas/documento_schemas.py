# app/schemas/documento_schemas.py
from pydantic import BaseModel
from typing import List

class ResumoIAResponse(BaseModel):
    titulo_documento: str
    resumo_geral: str
    pontos_chave: List[str]
    proximos_passos_ou_recomendacoes: str
    links_estudo: List[str] = []
    aviso_ia: str