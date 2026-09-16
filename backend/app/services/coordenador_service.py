# Cuida do propósito central do projeto: a atribuição de um tutor acadêmico para o estudante e a exibição do painel de responsabilidades, formatando os dados conforme o papel de quem está logado.

from app.models import Usuario, UserRole
from app.core.exceptions import PermissaoNegadaError, RecursoNaoEncontradoError, VinculoJaExistenteError
from app.repositories.aluno_repository import AlunoRepository
from app.repositories.professor_repository import ProfessorRepository
from app.repositories.disciplina_repository import DisciplinaRepository
from app.repositories.matricula_repository import MatriculaRepository
from app.repositories.coordenador_repository import CoordenadorRepository
from app.schemas.coordenador_schemas import TutoradosCoordenadorResponse

class CoordenadorService:
    def __init__(
        self, 
        coordenador_repo: CoordenadorRepository,
    ):
        self.coordenador_repo = coordenador_repo

    # Listagem de tutorados do Coordenador
    def listar_tutorados(
        self, usuario_logado: Usuario
    ) -> TutoradosCoordenadorResponse:
        
        if usuario_logado.role == UserRole.COORDENADOR:
            tutorados = self.coordenador_repo.listar_tutorados_por_coordenador(usuario_logado.id)
            
            tutorados_formatados = [
                {
                    "nome": aluno.usuario.nome,   
                    "matricula": aluno.matricula
                }
                for aluno in tutorados
            ]
            # Retorna o schema específico do Coordenador
            return TutoradosCoordenadorResponse(
                tutorados=tutorados_formatados
            )
            
        else:
            raise PermissaoNegadaError("Alunos não possuem acesso à listagem de responsabilidade.")