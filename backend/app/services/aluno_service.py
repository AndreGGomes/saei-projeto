from app.models import Usuario, UserRole
from app.core.exceptions import PermissaoNegadaError, RecursoNaoEncontradoError, VinculoJaExistenteError
from app.repositories.aluno_repository import AlunoRepository
from app.repositories.professor_repository import ProfessorRepository
from app.repositories.disciplina_repository import DisciplinaRepository
from app.repositories.matricula_repository import MatriculaRepository
from app.schemas.aluno_schemas import TutorarAlunoIn

class AlunoService:

    def __init__(
            self, 
            aluno_repo: AlunoRepository,
        ):
            self.aluno_repo = aluno_repo

    # Só coordenador pode fazer essas coisas
    def _verificar_permissao_coordenador(self, usuario: Usuario):
        if usuario.role != UserRole.COORDENADOR:
            raise PermissaoNegadaError("Apenas coordenadores podem realizar esta ação.")

    # Regra para o Coordenador assumir a tutoria de um aluno
    def vincular_tutor(self, dados: TutorarAlunoIn, usuario_logado: Usuario):
        self._verificar_permissao_coordenador(usuario_logado)

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