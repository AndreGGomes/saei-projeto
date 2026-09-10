from app.models import Usuario, UserRole
from app.schemas.matricula_schemas import MatriculaCreate
from app.repositories.matricula_repository import MatriculaRepository
from app.repositories.professor_repository import ProfessorRepository
from app.repositories.disciplina_repository import DisciplinaRepository
from app.repositories.aluno_repository import AlunoRepository
from app.core.exceptions import PermissaoNegadaError, RecursoNaoEncontradoError

class MatriculaService:
    def __init__(
        self, 
        matricula_repo: MatriculaRepository,
        professor_repo: ProfessorRepository,
        disciplina_repo: DisciplinaRepository,
        aluno_repo: AlunoRepository
    ):
        self.matricula_repo = matricula_repo
        self.professor_repo = professor_repo
        self.disciplina_repo = disciplina_repo
        self.aluno_repo = aluno_repo

    def _verificar_permissao(self, usuario: Usuario):
        if usuario.role != UserRole.COORDENADOR:
            raise PermissaoNegadaError("Apenas coordenadores podem gerenciar matrículas.")

    def criar_matricula(self, dados: MatriculaCreate, usuario_logado: Usuario):
        self._verificar_permissao(usuario_logado)
        
        if not self.aluno_repo.buscar_por_usuario_id(dados.aluno_id):
            raise RecursoNaoEncontradoError("Aluno não encontrado.")
            
        if not self.professor_repo.buscar_por_usuario_id(dados.professor_id):
            raise RecursoNaoEncontradoError("Professor não encontrado.")
            
        if not self.disciplina_repo.buscar_por_id(dados.disciplina_id):
            raise RecursoNaoEncontradoError("Disciplina não encontrada.")
            
        return self.matricula_repo.criar(dados.aluno_id, dados.professor_id, dados.disciplina_id)

    def mudar_professor(self, matricula_id: int, novo_professor_id: int, usuario_logado: Usuario):
        self._verificar_permissao(usuario_logado)
        
        matricula = self.matricula_repo.buscar_por_id(matricula_id)
        if not matricula:
            raise RecursoNaoEncontradoError("Matrícula não encontrada.")
            
        if not self.professor_repo.buscar_por_usuario_id(novo_professor_id):
            raise RecursoNaoEncontradoError("Novo professor não encontrado.")
            
        return self.matricula_repo.atualizar_professor(matricula, novo_professor_id)

    def deletar_matricula(self, matricula_id: int, usuario_logado: Usuario):
        self._verificar_permissao(usuario_logado)
        
        matricula = self.matricula_repo.buscar_por_id(matricula_id)
        if not matricula:
            raise RecursoNaoEncontradoError("Matrícula não encontrada.")
            
        self.matricula_repo.deletar(matricula)

    def listar_todas(self, usuario_logado: Usuario):
        self._verificar_permissao(usuario_logado)
        return self.matricula_repo.listar_todas()