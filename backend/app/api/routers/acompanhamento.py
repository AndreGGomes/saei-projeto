from fastapi import APIRouter, Depends, status, HTTPException
from app.models import Usuario
from app.schemas.acompanhamento_schemas import (
    VincularMatriculaIn, TutorarAlunoIn, MatriculaResponse, AcompanhamentoResponse
)
from app.api.dependencies import get_current_user, get_acompanhamento_service
from app.services.acompanhamento_service import AcompanhamentoService
from app.core.exceptions import PermissaoNegadaError, RecursoNaoEncontradoError, VinculoJaExistenteError

router = APIRouter(prefix="/acompanhamento")

@router.post("/turmas/matricular", response_model=MatriculaResponse, status_code=status.HTTP_201_CREATED)
def matricular_aluno(
    dados: VincularMatriculaIn,
    service: AcompanhamentoService = Depends(get_acompanhamento_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.vincular_aluno_turma(dados, current_user)

@router.post("/definir-coordenador-tutor", status_code=status.HTTP_200_OK)
def definir_tutor(
    dados: TutorarAlunoIn,
    service: AcompanhamentoService = Depends(get_acompanhamento_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.vincular_tutor(dados, current_user)

@router.get("/meus-vinculos", response_model=AcompanhamentoResponse)
def listar_vinculos(
    service: AcompanhamentoService = Depends(get_acompanhamento_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.listar_sob_responsabilidade(current_user)