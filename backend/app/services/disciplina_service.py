# Controla a criação e exclusão de disciplinas escolares, garantindo que apenas a coordenação possa executar essas operações e impedindo siglas duplicadas.

from app.models import Usuario, UserRole
from app.schemas.disciplina_schemas import DisciplinaCreate
from app.repositories.disciplina_repository import DisciplinaRepository
from app.core.exceptions import PermissaoNegadaError, CodigoDisciplinaJaExisteError, DisciplinaNaoEncontradaError

class DisciplinaService:
    def __init__(self, repository: DisciplinaRepository):
        self.repository = repository

    # Gerencia permissão. Se o usuário logado for aluno ou professor, essa verificação aborta a operação disparando PermissaoNegadaError
    def _verificar_permissao(self, usuario: Usuario):
        if usuario.role != UserRole.COORDENADOR:
            raise PermissaoNegadaError("Apenas coordenadores podem gerenciar disciplinas.")


    # Permite buscar disciplina pelo código
    def buscar_por_codigo(self, codigo: str, usuario_logado: Usuario):
        disciplina = self.repository.buscar_por_codigo(codigo)
        if not disciplina:
            raise DisciplinaNaoEncontradaError(f"Disciplina com código '{codigo}' não encontrada.")
        return disciplina

    # Confere se quem chamou é Coordenador, checa se o código já está em uso e, se estiver livre, salva no banco.
    def criar_disciplina(self, dados: DisciplinaCreate, usuario_logado: Usuario):
        self._verificar_permissao(usuario_logado)
        
        if self.repository.buscar_por_codigo(dados.codigo):
            raise CodigoDisciplinaJaExisteError("Já existe uma disciplina com este código.")
            
        return self.repository.criar(dados.nome, dados.codigo)
    
    # Confere se quem chamou é Coordenador, valida se a disciplina existe antes de tentar deletar e, se existir, manda apagar.
    def deletar_disciplina(self, disciplina_id: int, usuario_logado: Usuario):
        self._verificar_permissao(usuario_logado)
        
        disciplina = self.repository.buscar_por_id(disciplina_id)
        if not disciplina:
            raise DisciplinaNaoEncontradaError("Disciplina não encontrada.")
            
        self.repository.deletar(disciplina)

    # Somente o coordenador pode listar as disciplinas.
    def listar_disciplinas(self, usuario_logado: Usuario) -> list:
        self._verificar_permissao(usuario_logado)
        return self.repository.listar_todas()