# Guichê de Gestão de Matérias (/disciplinas), com rotas para cadastrar, listar e excluir disciplinas.

from typing import List
from fastapi import APIRouter, Depends, status
from app.models import Usuario
from app.schemas.disciplina_schemas import DisciplinaCreate, DisciplinaResponse, DisciplinaUpdateNome
from app.api.dependencies import get_current_user, get_disciplina_service
from app.services.disciplina_service import DisciplinaService

router = APIRouter(prefix="/disciplinas", tags=["Disciplinas"])

# Recebe nome e código da disciplina
@router.post("/criar", response_model=DisciplinaResponse, status_code=status.HTTP_201_CREATED)
def criar_disciplina(
    dados: DisciplinaCreate,
    service: DisciplinaService = Depends(get_disciplina_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.criar_disciplina(dados, current_user)

# Muda o nome da disciplina
@router.patch("/{codigo}/nome", response_model=DisciplinaResponse, status_code=status.HTTP_200_OK)
def atualizar_nome_disciplina(
    codigo: str,
    dados: DisciplinaUpdateNome,
    service: DisciplinaService = Depends(get_disciplina_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.atualizar_nome_disciplina(codigo, dados.novo_nome, current_user)

# Deleta uma disciplina pelo ID
@router.delete("/{disciplina_codigo}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_disciplina(
    disciplina_codigo: str,
    service: DisciplinaService = Depends(get_disciplina_service),
    current_user: Usuario = Depends(get_current_user)
):
    service.deletar_disciplina(disciplina_codigo, current_user)

# Busca disciplina pelo código
@router.get("/{codigo}", response_model=DisciplinaResponse, status_code=status.HTTP_200_OK)
def buscar_disciplina_por_codigo(
    codigo: str,
    service: DisciplinaService = Depends(get_disciplina_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.buscar_por_codigo(codigo, current_user)

# Lista todas as disciplinas cadastradas
@router.get("/", response_model=List[DisciplinaResponse], status_code=status.HTTP_200_OK)
def listar_disciplinas(
    service: DisciplinaService = Depends(get_disciplina_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.listar_disciplinas(current_user)