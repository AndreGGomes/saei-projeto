# Cuida do propósito central do projeto: a atribuição de um tutor acadêmico para o estudante e a exibição do painel de responsabilidades, formatando os dados conforme o papel de quem está logado.

from app.models import Usuario
from app.core.permissoes import exigir_coordenador
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
        
        exigir_coordenador(usuario_logado, "Alunos não possuem acesso à listagem de responsabilidade.")

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