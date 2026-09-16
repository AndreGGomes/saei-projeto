# Guichê de Acompanhamento Inclusivo e Tutoria. Permite que coordenadores assumam a tutoria de alunos e alimenta a tela de painel pessoal (/meus-vinculos).

from fastapi import APIRouter, Depends, status
from app.models import Usuario
from app.api.dependencies import get_coordenador_service, get_current_user
from app.schemas.coordenador_schemas import TutoradosCoordenadorResponse
from app.services.coordenador_service import CoordenadorService

router = APIRouter(prefix="/coordenador")

# O sistema descobre pelo token quem é a pessoa: se for coordenador, entrega os tutorados; se for professor, entrega os alunos das suas disciplinas; se for aluno, nega com erro 403.
@router.get("/meus-vinculos", response_model=TutoradosCoordenadorResponse)
def listar_vinculos(
    service: CoordenadorService = Depends(get_coordenador_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.listar_tutorados(current_user)