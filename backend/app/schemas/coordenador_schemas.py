from typing import List

from pydantic import BaseModel

from app.schemas.aluno_schemas import AlunoResponse

class TutoradosCoordenadorResponse(BaseModel):
    tutorados: List[AlunoResponse]
    class Config:
            from_attributes = True