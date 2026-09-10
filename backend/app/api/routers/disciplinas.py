# app/api/routers/disciplinas.py
from fastapi import APIRouter, Depends, status
from app.models import Usuario
from app.schemas.disciplina_schemas import DisciplinaCreate, DisciplinaResponse
from app.api.dependencies import get_current_user, get_disciplina_service
from app.services.disciplina_service import DisciplinaService

router = APIRouter(prefix="/disciplinas", tags=["Disciplinas"])

@router.post("/", response_model=DisciplinaResponse, status_code=status.HTTP_201_CREATED)
def criar_disciplina(
    dados: DisciplinaCreate,
    service: DisciplinaService = Depends(get_disciplina_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.criar_disciplina(dados, current_user)

@router.delete("/{disciplina_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_disciplina(
    disciplina_id: int,
    service: DisciplinaService = Depends(get_disciplina_service),
    current_user: Usuario = Depends(get_current_user)
):
    service.deletar_disciplina(disciplina_id, current_user)