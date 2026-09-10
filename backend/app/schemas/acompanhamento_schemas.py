from pydantic import BaseModel
from typing import List, Optional

class VincularMatriculaIn(BaseModel):
    aluno_usuario_id: int
    professor_usuario_id: int
    disciplina_id: int

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
    matricula: str
    class Config:
        from_attributes = True

class MatriculaResponse(BaseModel):
    id: int
    aluno: AlunoResponse
    class Config:
        from_attributes = True

class TurmaResponse(BaseModel):
    id: int
    disciplina: DisciplinaResponse
    alunos_matriculados: List[MatriculaResponse] = []
    class Config:
        from_attributes = True

class AcompanhamentoResponse(BaseModel):
    # Usado para padronizar a resposta do UC08
    tipo: str
    tutorados: Optional[List[AlunoResponse]] = None
    matriculas: Optional[List[MatriculaResponse]] = None