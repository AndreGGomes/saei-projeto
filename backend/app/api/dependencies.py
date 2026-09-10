# app/api/dependencies.py
from typing import Annotated
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core import auth
from app.db.database import get_db

from app.repositories.usuario_repository import UsuarioRepository
from app.services.usuario_service import UsuarioService
from app.repositories.aluno_repository import AlunoRepository
from app.repositories.professor_repository import ProfessorRepository
from app.repositories.disciplina_repository import DisciplinaRepository
from app.repositories.matricula_repository import MatriculaRepository

from app.services.acompanhamento_service import AcompanhamentoService
from app.services.disciplina_service import DisciplinaService
from app.services.matricula_service import MatriculaService

# 1. Construtor do Service de Usuário
def get_usuario_service(db: Session = Depends(get_db)) -> UsuarioService:
    repository = UsuarioRepository(db)
    return UsuarioService(repository)

# 2. Proteção de Rotas
def get_current_user(
    token: Annotated[str, Depends(auth.oauth2_scheme)], 
    service: UsuarioService = Depends(get_usuario_service)
):
    user_id = auth.verify_access_token(token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    
    try:
        user = service.buscar_usuario(int(user_id))
        return user
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token malformado")

# 3. Construtor do Service de Acompanhamento (UC06/UC07/UC08)
def get_acompanhamento_service(db: Session = Depends(get_db)) -> AcompanhamentoService:
    return AcompanhamentoService(
        aluno_repo=AlunoRepository(db),
        professor_repo=ProfessorRepository(db),
        disciplina_repo=DisciplinaRepository(db),
        matricula_repo=MatriculaRepository(db)
    )

# 4. Construtor do Service de Disciplina
def get_disciplina_service(db: Session = Depends(get_db)) -> DisciplinaService:
    return DisciplinaService(DisciplinaRepository(db))

# 5. Construtor do Service de Matrícula (Substituto do TurmaService)
def get_matricula_service(db: Session = Depends(get_db)) -> MatriculaService:
    return MatriculaService(
        matricula_repo=MatriculaRepository(db),
        professor_repo=ProfessorRepository(db),
        disciplina_repo=DisciplinaRepository(db),
        aluno_repo=AlunoRepository(db)
    )