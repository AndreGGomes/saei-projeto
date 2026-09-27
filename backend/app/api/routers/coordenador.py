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

# ADICIONAR: Vincular um aluno ao coordenador logado
@router.post("/tutorados/{aluno_id}", status_code=status.HTTP_201_CREATED)
def adicionar_tutorado(
    aluno_id: int,
    service: CoordenadorService = Depends(get_coordenador_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.vincular_tutorado(current_user, aluno_id)

# ADICIONAR: Desvincular/remover um aluno da tutoria do coordenador logado
@router.delete("/tutorados/{aluno_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_tutorado(
    aluno_id: int,
    service: CoordenadorService = Depends(get_coordenador_service),
    current_user: Usuario = Depends(get_current_user)
):
    service.desvincular_tutorado(current_user, aluno_id)
    return