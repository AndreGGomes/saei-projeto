from app.models import Usuario
from app.core.exceptions import RecursoNaoEncontradoError, VinculoJaExistenteError
from app.core.permissoes import exigir_coordenador
from app.repositories.aluno_repository import AlunoRepository
from app.schemas.aluno_schemas import TutorarAlunoIn

class AlunoService:

    def __init__(
            self, 
            aluno_repo: AlunoRepository,
        ):
            self.aluno_repo = aluno_repo

    # Regra para o Coordenador assumir a tutoria de um aluno
    def vincular_tutor(self, dados: TutorarAlunoIn, usuario_logado: Usuario):
        # Só coordenador pode fazer essa ação
        exigir_coordenador(usuario_logado, "Apenas coordenadores podem realizar esta ação.")

        # Confere se o aluno existe, pela matrícula
        aluno = self.aluno_repo.buscar_por_matricula(dados.aluno_matricula)
        if not aluno:
            raise RecursoNaoEncontradoError(f"Aluno com matrícula '{dados.aluno_matricula}' não encontrado.")

        # Checa se o coordenador já não era o tutor desse aluno, evitando requisições duplicadas (VinculoJaExistenteError).
        if aluno.tutor_id == usuario_logado.id:
            raise VinculoJaExistenteError("Você já é o tutor deste aluno.")

        # Grava no banco e retorna uma mensagem de confirmação contendo o número da matrícula.
        self.aluno_repo.atualizar_tutor(aluno, usuario_logado.id)
        return {"mensagem": f"Você agora é o tutor responsável pela matrícula {aluno.matricula}."}