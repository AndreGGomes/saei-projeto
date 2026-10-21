# Contrato de comunicação para a gestão de matrículas e vínculos acadêmicos baseado em dados humanos

from typing import List

from pydantic import AliasPath, BaseModel, EmailStr, Field, field_validator
from app.schemas.disciplina_schemas import DisciplinaResponse

# Resumo de saída do aluno
class AlunoResumoResponse(BaseModel):
    # O nome mora no usuário dono do perfil; o alias faz o schema ler direto do objeto do banco
    nome: str = Field(validation_alias=AliasPath("usuario", "nome"))
    matricula: str

    class Config:
        from_attributes = True
        populate_by_name = True

# Resumo de saída do professor
class ProfessorResumoResponse(BaseModel):
    nome: str = Field(validation_alias=AliasPath("usuario", "nome"))
    email: EmailStr = Field(validation_alias=AliasPath("usuario", "email"))

    class Config:
        from_attributes = True
        populate_by_name = True

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

    # Preferências nascem vazias quando a matrícula é criada
    @field_validator("preferencias_do_aluno", mode="before")
    @classmethod
    def preferencia_vazia_vira_string(cls, valor):
        return valor or ""

# Contrato envelope para a listagem de turmas/alunos sob docência do professor logado
class MatriculasProfessorResponse(BaseModel):
    matriculas: List[MatriculaResponse]

    class Config:
            from_attributes = True