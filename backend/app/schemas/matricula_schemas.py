# Contrato de comunicação para a gestão de matrículas e vínculos acadêmicos baseado em dados humanos

from typing import List

from pydantic import BaseModel, EmailStr
from app.schemas.disciplina_schemas import DisciplinaResponse

# Resumo de saída do aluno
class AlunoResumoResponse(BaseModel):
    nome: str
    matricula: str

    class Config:
        from_attributes = True

# Resumo de saída do professor
class ProfessorResumoResponse(BaseModel):
    nome: str
    email: EmailStr

    class Config:
        from_attributes = True

# Formulário de criação de matrícula legível
class MatriculaCreate(BaseModel):
    aluno_matricula: str
    professor_email: EmailStr
    disciplina_codigo: str

# Formulário de substituição de professor
class MatriculaUpdateProfessor(BaseModel):
    novo_professor_email: EmailStr

# Formulário de atualização das preferências pessoais do aluno sobre aprendizado e inclusão
class PreferenciasDoAlunoUpdate(BaseModel):
    preferencias_do_aluno: str

# Contrato de retorno de uma matrícula
class MatriculaResponse(BaseModel):
    id: int
    aluno: AlunoResumoResponse
    professor: ProfessorResumoResponse
    disciplina: DisciplinaResponse
    preferencias_do_aluno: str = ""

    class Config:
        from_attributes = True

class MatriculasProfessorResponse(BaseModel):
    matriculas: List[MatriculaResponse]

    class Config:
            from_attributes = True