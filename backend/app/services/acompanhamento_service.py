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
            tutorados_formatados = []
            for aluno in tutorados:
                tutorados_formatados.append({
                    "usuario_id": aluno.usuario_id,
                    "nome": aluno.usuario.nome,   
                    "matricula": aluno.matricula
                })
            return AcompanhamentoResponse(tipo="COORDENADOR", tutorados=tutorados_formatados)
            
        elif usuario_logado.role == UserRole.PROFESSOR:
            # Lista as matrículas (vínculos aluno-disciplina) vinculadas ao professor
            matriculas = self.matricula_repo.listar_por_professor(usuario_logado.id)
            matriculas_formatadas = []
            for m in matriculas:
                matriculas_formatadas.append({
                    "id": m.id,
                    "aluno": {
                        "usuario_id": m.aluno.usuario_id,
                        "nome": m.aluno.usuario.nome, 
                        "matricula": m.aluno.matricula
                    }
                })
            return AcompanhamentoResponse(tipo="PROFESSOR", matriculas=matriculas_formatadas)
            
        else:
            raise PermissaoNegadaError("Alunos não possuem acesso à listagem de responsabilidade.")