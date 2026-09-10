# app/services/acompanhamento_service.py
from app.models import Usuario, UserRole
from app.schemas.acompanhamento_schemas import VincularMatriculaIn, TutorarAlunoIn, AcompanhamentoResponse
from app.core.exceptions import PermissaoNegadaError, RecursoNaoEncontradoError, VinculoJaExistenteError
from app.repositories.aluno_repository import AlunoRepository
from app.repositories.professor_repository import ProfessorRepository
from app.repositories.disciplina_repository import DisciplinaRepository
from app.repositories.matricula_repository import MatriculaRepository

class AcompanhamentoService:
    def __init__(
        self, 
        aluno_repo: AlunoRepository,
        professor_repo: ProfessorRepository,
        disciplina_repo: DisciplinaRepository,
        matricula_repo: MatriculaRepository
    ):
        self.aluno_repo = aluno_repo
        self.professor_repo = professor_repo
        self.disciplina_repo = disciplina_repo
        self.matricula_repo = matricula_repo

    def _verificar_permissao_coordenador(self, usuario: Usuario):
        if usuario.role != UserRole.COORDENADOR:
            raise PermissaoNegadaError("Apenas coordenadores podem realizar esta ação.")

    def vincular_aluno(self, dados: VincularMatriculaIn, usuario_logado: Usuario):
        self._verificar_permissao_coordenador(usuario_logado)

        aluno = self.aluno_repo.buscar_por_usuario_id(dados.aluno_usuario_id)
        if not aluno:
            raise RecursoNaoEncontradoError("Aluno não encontrado.")
            
        professor = self.professor_repo.buscar_por_usuario_id(dados.professor_usuario_id)
        if not professor:
            raise RecursoNaoEncontradoError("Professor não encontrado.")
            
        disciplina = self.disciplina_repo.buscar_por_id(dados.disciplina_id)
        if not disciplina:
            raise RecursoNaoEncontradoError("Disciplina não encontrada.")

        # Verifica direto na tabela de matrículas se o vínculo já existe para essa disciplina
        matricula_existente = self.matricula_repo.buscar_por_aluno_e_disciplina(
            aluno_id=dados.aluno_usuario_id, 
            disciplina_id=dados.disciplina_id
        )
        
        if matricula_existente:
            raise VinculoJaExistenteError("O aluno já está matriculado nesta disciplina.")

        # Cria a matrícula ligando os 3 pontos de uma vez
        return self.matricula_repo.criar(
            aluno_id=dados.aluno_usuario_id, 
            professor_id=dados.professor_usuario_id, 
            disciplina_id=dados.disciplina_id
        )

    def vincular_tutor(self, dados: TutorarAlunoIn, usuario_logado: Usuario):
        self._verificar_permissao_coordenador(usuario_logado)

        aluno = self.aluno_repo.buscar_por_usuario_id(dados.aluno_usuario_id)
        if not aluno:
            raise RecursoNaoEncontradoError("Aluno não encontrado.")

        if aluno.tutor_id == usuario_logado.id:
            raise VinculoJaExistenteError("Você já é o tutor deste aluno.")

        self.aluno_repo.atualizar_tutor(aluno, usuario_logado.id)
        return {"mensagem": f"Você agora é o tutor responsável pela matrícula {aluno.matricula}."}

    def listar_sob_responsabilidade(self, usuario_logado: Usuario) -> AcompanhamentoResponse:
        if usuario_logado.role == UserRole.COORDENADOR:
            tutorados = self.aluno_repo.listar_por_tutor(usuario_logado.id)
            return AcompanhamentoResponse(tipo="COORDENADOR", tutorados=tutorados)
            
        elif usuario_logado.role == UserRole.PROFESSOR:
            # Lista as matrículas (vínculos aluno-disciplina) vinculadas ao professor
            matriculas = self.matricula_repo.listar_por_professor(usuario_logado.id)
            return AcompanhamentoResponse(tipo="PROFESSOR", matriculas=matriculas)
            
        else:
            raise PermissaoNegadaError("Alunos não possuem acesso à listagem de responsabilidade.")