# app/services/disciplina_service.py
from app.models import Usuario, UserRole
from app.schemas.disciplina_schemas import DisciplinaCreate
from app.repositories.disciplina_repository import DisciplinaRepository
from app.core.exceptions import PermissaoNegadaError, CodigoDisciplinaJaExisteError, DisciplinaNaoEncontradaError

class DisciplinaService:
    def __init__(self, repository: DisciplinaRepository):
        self.repository = repository

    def _verificar_permissao(self, usuario: Usuario):
        if usuario.role != UserRole.COORDENADOR:
            raise PermissaoNegadaError("Apenas coordenadores podem gerenciar disciplinas.")

    def criar_disciplina(self, dados: DisciplinaCreate, usuario_logado: Usuario):
        self._verificar_permissao(usuario_logado)
        
        if self.repository.buscar_por_codigo(dados.codigo):
            raise CodigoDisciplinaJaExisteError("Já existe uma disciplina com este código.")
            
        return self.repository.criar(dados.nome, dados.codigo)

    def deletar_disciplina(self, disciplina_id: int, usuario_logado: Usuario):
        self._verificar_permissao(usuario_logado)
        
        disciplina = self.repository.buscar_por_id(disciplina_id)
        if not disciplina:
            raise DisciplinaNaoEncontradaError("Disciplina não encontrada.")
            
        self.repository.deletar(disciplina)