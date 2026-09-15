# Contrato de comunicação para as ações de tutoria inclusiva e exibição do painel pedagógico.

from pydantic import BaseModel
from typing import List, Optional
from app.schemas.matricula_schemas import MatriculaResponse

# Entrada para assumir tutoria via matrícula
class TutorarAlunoIn(BaseModel):
    aluno_matricula: str

# Resposta pública do aluno tutorado
class AlunoResponse(BaseModel):
    nome: str
    matricula: str

    class Config:
        from_attributes = True

# Resposta polimórfica para o painel de acompanhamento
class AcompanhamentoResponse(BaseModel):
    tipo: str
    tutorados: Optional[List[AlunoResponse]] = None
    matriculas: Optional[List[MatriculaResponse]] = None