# Controla os dados para registrar, alterar e listar os vínculos escolares diretos (Aluno + Professor + Matéria).

from pydantic import BaseModel
from app.schemas.disciplina_schemas import DisciplinaResponse

# formulário de criação de vínculo. O coordenador envia os IDs do aluno, professor e disciplina.
class MatriculaCreate(BaseModel):
    aluno_id: int
    professor_id: int
    disciplina_id: int

# formulário de troca de professor. Se o coordenador precisar substituir o professor de uma matrícula existente, a rota recebe apenas o novo_professor_id, sem obrigar a enviar aluno ou disciplina novamente.
class MatriculaUpdateProfessor(BaseModel):
    novo_professor_id: int

# Resposta com os dados da matrícula
class MatriculaResponse(BaseModel):
    id: int
    aluno_id: int
    professor_id: int
    disciplina_id: int
    disciplina: DisciplinaResponse | None = None
    
    class Config:
        from_attributes = True