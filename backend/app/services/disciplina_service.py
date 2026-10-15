# Controla a criação e exclusão de disciplinas escolares, garantindo que apenas a coordenação possa executar essas operações e impedindo siglas duplicadas.

from app.models import Usuario
from app.schemas.disciplina_schemas import DisciplinaCreate
from app.repositories.disciplina_repository import DisciplinaRepository
from app.core.exceptions import CodigoDisciplinaJaExisteError, DisciplinaNaoEncontradaError
from app.core.permissoes import exigir_coordenador

class DisciplinaService:
    def __init__(self, repository: DisciplinaRepository):
        self.repository = repository

    # Permite buscar disciplina pelo código
    def buscar_por_codigo(self, codigo: str):
        disciplina = self.repository.buscar_por_codigo(codigo)
        if not disciplina:
            raise DisciplinaNaoEncontradaError(f"Disciplina com código '{codigo}' não encontrada.")
        return disciplina

    # Confere se quem chamou é Coordenador, checa se o código já está em uso e, se estiver livre, salva no banco.
    def criar_disciplina(self, dados: DisciplinaCreate, usuario_logado: Usuario):
        # Se o usuário logado for aluno ou professor, aborta com PermissaoNegadaError
        exigir_coordenador(usuario_logado, "Apenas coordenadores podem gerenciar disciplinas.")
        
        if self.repository.buscar_por_codigo(dados.codigo):
            raise CodigoDisciplinaJaExisteError("Já existe uma disciplina com este código.")
            
        return self.repository.criar(dados.nome, dados.codigo)

    # Se for o coordenador, atualiza o nome da disciplina
    def atualizar_nome_disciplina(self, codigo: str, novo_nome: str, usuario_logado: Usuario):
        exigir_coordenador(usuario_logado, "Apenas coordenadores podem gerenciar disciplinas.")
        disciplina = self.repository.buscar_por_codigo(codigo)
        if not disciplina:
            raise DisciplinaNaoEncontradaError(f"Disciplina com código '{codigo}' não encontrada.")
        
        return self.repository.atualizar_nome(disciplina, novo_nome.strip())
    
    # Confere se quem chamou é Coordenador, valida se a disciplina existe antes de tentar deletar e, se existir, manda apagar.
    def deletar_disciplina(self, disciplina_codigo: str, usuario_logado: Usuario):
        exigir_coordenador(usuario_logado, "Apenas coordenadores podem gerenciar disciplinas.")
        
        disciplina = self.repository.buscar_por_codigo(disciplina_codigo)
        if not disciplina:
            raise DisciplinaNaoEncontradaError(f"Disciplina com código {disciplina_codigo} não encontrada.")
            
        self.repository.deletar(disciplina)

    # Somente o coordenador pode listar as disciplinas.
    def listar_disciplinas(self, usuario_logado: Usuario) -> list:
        exigir_coordenador(usuario_logado, "Apenas coordenadores podem gerenciar disciplinas.")
        return self.repository.listar_todas()