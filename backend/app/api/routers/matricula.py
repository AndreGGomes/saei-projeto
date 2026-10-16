# Guichê de Vínculos Escolares (/matriculas). Permite à coordenação criar matrículas (ligando Aluno, Professor e Disciplina), trocar o professor responsável e cancelar matrículas.

from typing import List
from fastapi import APIRouter, Depends, status
from app.models import Usuario
from app.schemas.matricula_schemas import MatriculaCreate, MatriculaUpdateProfessor, MatriculaResponse, MatriculasProfessorResponse, PreferenciasDoAlunoUpdate
from app.api.dependencies import get_current_user, get_matricula_service
from app.services.matricula_service import MatriculaService

router = APIRouter(prefix="/matriculas", tags=["Matrículas e Vínculos"])

# Cria uma nova matrícula após checar se o usuário logado tem permissão de coordenador. Utiliza a matrícula do aluno, e-mail do professor e código da disciplina
@router.post("/criar", response_model=MatriculaResponse, status_code=status.HTTP_201_CREATED)
def criar_matricula(
    dados: MatriculaCreate,
    service: MatriculaService = Depends(get_matricula_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.criar_matricula(dados, current_user)

# Rota pra mudar professor. Atualiza o professor da matrícula informando o novo e-mail do professor.
# PATCH ao invés de POST pois é atualização parcial, pois só estamos alterando uma coluna da matrícula: o professor
@router.patch("/{matricula_id}/mudar-professor", response_model=MatriculaResponse)
def mudar_professor_da_matricula(
    matricula_id: int,
    dados: MatriculaUpdateProfessor,
    service: MatriculaService = Depends(get_matricula_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.mudar_professor(matricula_id, dados.novo_professor_email, current_user)

# Exclui matrícula
@router.delete("/{matricula_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_matricula(
    matricula_id: int,
    service: MatriculaService = Depends(get_matricula_service),
    current_user: Usuario = Depends(get_current_user)
):
    service.deletar_matricula(matricula_id, current_user)

# O aluno dono da matrícula atualiza as próprias preferências de aprendizado e inclusão.
# PATCH pois é atualização parcial de uma única coluna da matrícula.
@router.patch("/{matricula_id}/preferencias", response_model=MatriculaResponse)
def atualizar_preferencias_do_aluno(
    matricula_id: int,
    dados: PreferenciasDoAlunoUpdate,
    service: MatriculaService = Depends(get_matricula_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.atualizar_preferencias_do_aluno(matricula_id, dados.preferencias_do_aluno, current_user)

# Lista as matrículas
@router.get("/", response_model=List[MatriculaResponse])
def listar_matriculas(
    service: MatriculaService = Depends(get_matricula_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.listar_todas(current_user)

# Se o usuário for professor, lista as matriculas vinculadas e ele
@router.get("/minhas-matriculas-professor", response_model=MatriculasProfessorResponse)
def listar_vinculos(
    service: MatriculaService = Depends(get_matricula_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.listar_sob_responsabilidade_por_usuario_logado_professor(current_user)

# Se o usuário for aluno, lista as matrículas dele (disciplinas em que está inscrito)
@router.get("/minhas-matriculas-aluno", response_model=List[MatriculaResponse])
def listar_vinculos_do_aluno(
    service: MatriculaService = Depends(get_matricula_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.listar_sob_responsabilidade_por_usuario_logado_aluno(current_user)