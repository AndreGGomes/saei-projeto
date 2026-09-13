# app/api/routers/matricula.py
from typing import List

from fastapi import APIRouter, Depends, status
from app.models import Usuario
from app.schemas.matricula_schemas import MatriculaCreate, MatriculaUpdateProfessor, MatriculaResponse
from app.api.dependencies import get_current_user, get_matricula_service
from app.services.matricula_service import MatriculaService

router = APIRouter(prefix="/matriculas", tags=["Matrículas e Vínculos"])

@router.post("/criar", response_model=MatriculaResponse, status_code=status.HTTP_201_CREATED)
def criar_matricula(
    dados: MatriculaCreate,
    service: MatriculaService = Depends(get_matricula_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.criar_matricula(dados, current_user)

@router.patch("/{matricula_id}/mudar-professor", response_model=MatriculaResponse)
def mudar_professor_da_matricula(
    matricula_id: int,
    dados: MatriculaUpdateProfessor,
    service: MatriculaService = Depends(get_matricula_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.mudar_professor(matricula_id, dados.novo_professor_id, current_user)

@router.delete("/{matricula_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_matricula(
    matricula_id: int,
    service: MatriculaService = Depends(get_matricula_service),
    current_user: Usuario = Depends(get_current_user)
):
    service.deletar_matricula(matricula_id, current_user)

@router.get("/todas-matriculas", response_model=List[MatriculaResponse])
def listar_matriculas(
    service=Depends(get_matricula_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.listar_todas(current_user)