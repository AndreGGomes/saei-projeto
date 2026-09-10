from pydantic import BaseModel
from app.schemas.disciplina_schemas import DisciplinaResponse

class MatriculaCreate(BaseModel):
    aluno_id: int
    professor_id: int
    disciplina_id: int

class MatriculaUpdateProfessor(BaseModel):
    novo_professor_id: int

class MatriculaResponse(BaseModel):
    id: int
    aluno_id: int
    professor_id: int
    disciplina_id: int
    disciplina: DisciplinaResponse | None = None
    
    class Config:
        from_attributes = True