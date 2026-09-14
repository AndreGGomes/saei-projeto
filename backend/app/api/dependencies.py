# Centraliza a Injeção de Dependências do FastAPI. Ele fabrica os objetos de Service fornecendo os repositórios necessários e valida quem é o usuário portador do token JWT

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

# Fábrica do serviço de usuário. O FastAPI chama get_db() para pegar a conexão com o banco, instancia o UsuarioRepository e o AlunoRepository com ela, e injeta os dois no UsuarioService. Quem pedir service = Depends(get_usuario_service) na rota já recebe o serviço pronto.
def get_usuario_service(db: Session = Depends(get_db)) -> UsuarioService:
    return UsuarioService(
        usuario_repo=UsuarioRepository(db),
        aluno_repo=AlunoRepository(db)
    )

# Pega quem é o usuário atual
def get_current_user(
    token: Annotated[str, Depends(auth.oauth2_scheme)], 
    service: UsuarioService = Depends(get_usuario_service)
):
    # Decodifica o JWT. Se a assinatura estiver violada ou o token estiver expirado, retorna None
    user_id = auth.verify_access_token(token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    # Vai até o banco buscar os dados reais do usuário dono do crachá. Se o ID não for um número válido, lança erro de token malformado.
    try:
        user = service.buscar_usuario(int(user_id))
        return user
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token malformado")

#--- os outros serviços, monta cada um com seus respectivos repositórios compartilhando a mesma sessão db da requisição.
# Construtor do Service de Acompanhamento
def get_acompanhamento_service(db: Session = Depends(get_db)) -> AcompanhamentoService:
    return AcompanhamentoService(
        aluno_repo=AlunoRepository(db),
        professor_repo=ProfessorRepository(db),
        disciplina_repo=DisciplinaRepository(db),
        matricula_repo=MatriculaRepository(db)
    )

# Construtor do Service de Disciplina
def get_disciplina_service(db: Session = Depends(get_db)) -> DisciplinaService:
    return DisciplinaService(DisciplinaRepository(db))

# Construtor do Service de Matrícula
def get_matricula_service(db: Session = Depends(get_db)) -> MatriculaService:
    return MatriculaService(
        matricula_repo=MatriculaRepository(db),
        professor_repo=ProfessorRepository(db),
        disciplina_repo=DisciplinaRepository(db),
        aluno_repo=AlunoRepository(db)
    )