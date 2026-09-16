from fastapi import APIRouter, Depends, status
from app.models import Usuario
from app.api.dependencies import get_current_user, get_aluno_service
from app.schemas.aluno_schemas import TutorarAlunoIn
from app.services.aluno_service import AlunoService

router = APIRouter(prefix="/aluno")

# O coordenador logado passa a matrícula do aluno e vira o tutor oficial do estudante.
@router.post("/definir-coordenador-tutor", status_code=status.HTTP_200_OK)
def definir_tutor(
    dados: TutorarAlunoIn,
    service: AlunoService = Depends(get_aluno_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.vincular_tutor(dados, current_user)