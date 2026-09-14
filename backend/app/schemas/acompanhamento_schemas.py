# Padroniza as respostas de tutoria acadêmica e dos painéis de acompanhamento pedagógico usados por Coordenadores e Professores.

from pydantic import BaseModel
from typing import List, Optional

# class VincularMatriculaIn(BaseModel):
#   aluno_usuario_id: int
#   professor_usuario_id: int
#   disciplina_id: int

# Requisição para assumir tutoria
class TutorarAlunoIn(BaseModel):
    aluno_usuario_id: int

class DisciplinaResponse(BaseModel):
    id: int
    nome: str
    codigo: str
    class Config:
        from_attributes = True

class AlunoResponse(BaseModel):
    usuario_id: int
    nome: str
    matricula: str
    class Config:
        from_attributes = True

class MatriculaResponse(BaseModel):
    id: int
    aluno: AlunoResponse
    class Config:
        from_attributes = True

# Resposta polimórfica para a rota de acompanhamento
class AcompanhamentoResponse(BaseModel):
    # Usado para padronizar a resposta do UC08
    tipo: str
    tutorados: Optional[List[AlunoResponse]] = None
    matriculas: Optional[List[MatriculaResponse]] = None