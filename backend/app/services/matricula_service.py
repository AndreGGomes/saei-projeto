# Gerencia os vínculos entre estudantes, professores e matérias. Garante que os três elementos existam antes de efetuar o vínculo e permite a troca de professor responsável.

from app.models import Usuario, UserRole
from app.schemas.matricula_schemas import MatriculaCreate, MatriculaResponse, MatriculasProfessorResponse
from app.repositories.matricula_repository import MatriculaRepository
from app.repositories.professor_repository import ProfessorRepository
from app.repositories.disciplina_repository import DisciplinaRepository
from app.repositories.aluno_repository import AlunoRepository
from app.core.exceptions import (
    PermissaoNegadaError, 
    RecursoNaoEncontradoError, 
    VinculoJaExistenteError
)

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

    # Apenas a coordenação pode mexer nas matrículas
    def _verificar_permissao(self, usuario: Usuario):
        if usuario.role != UserRole.COORDENADOR:
            raise PermissaoNegadaError("Apenas coordenadores podem gerenciar matrículas.")

    # Formatação das matrículas
    def _formatar_matricula_response(self, matricula) -> dict:
        return {
            "id": matricula.id,
            "aluno": {
                "nome": matricula.aluno.usuario.nome,
                "matricula": matricula.aluno.matricula
            },
            "professor": {
                "nome": matricula.professor.usuario.nome,
                "email": matricula.professor.usuario.email
            },
            "disciplina": {
                "id": matricula.disciplina.id,
                "nome": matricula.disciplina.nome,
                "codigo": matricula.disciplina.codigo
            }
        }

    # Validação de Integridade Referencial em Camada de Aplicação
    def criar_matricula(self, dados: MatriculaCreate, usuario_logado: Usuario) -> dict:
        self._verificar_permissao(usuario_logado)
        
        # Busca pelas chaves naturais
        aluno = self.aluno_repo.buscar_por_matricula(dados.aluno_matricula)
        if not aluno:
            raise RecursoNaoEncontradoError(f"Aluno com matrícula '{dados.aluno_matricula}' não encontrado.")
            
        professor = self.professor_repo.buscar_por_email(dados.professor_email)
        if not professor:
            raise RecursoNaoEncontradoError(f"Professor com e-mail '{dados.professor_email}' não encontrado.")
            
        disciplina = self.disciplina_repo.buscar_por_codigo(dados.disciplina_codigo)
        if not disciplina:
            raise RecursoNaoEncontradoError(f"Disciplina com código '{dados.disciplina_codigo}' não encontrada.")
            
        # Previne duplicidade
        if self.matricula_repo.buscar_por_aluno_e_disciplina(aluno.usuario_id, disciplina.id):
            raise VinculoJaExistenteError("Este aluno já está matriculado nesta disciplina.")

        # Cria a matrícula no banco
        matricula_salva = self.matricula_repo.criar(
            aluno_id=aluno.usuario_id, 
            professor_id=professor.usuario_id, 
            disciplina_id=disciplina.id
        )
        return self._formatar_matricula_response(matricula_salva)

    # Confere se a matrícula existe, valida se o novo_professor_id é realmente um professor cadastrado e executa a troca.
    def mudar_professor(self, matricula_id: int, novo_professor_email: str, usuario_logado: Usuario) -> dict:
        self._verificar_permissao(usuario_logado)
        
        matricula = self.matricula_repo.buscar_por_id(matricula_id)
        if not matricula:
            raise RecursoNaoEncontradoError("Matrícula não encontrada.")
            
        novo_professor = self.professor_repo.buscar_por_email(novo_professor_email)
        if not novo_professor:
            raise RecursoNaoEncontradoError(f"Novo professor com e-mail '{novo_professor_email}' não encontrado.")
            
        matricula_atualizada = self.matricula_repo.atualizar_professor(matricula, novo_professor.usuario_id)
        return self._formatar_matricula_response(matricula_atualizada)

    #--- Métodos restritos à coordenação para cancelar vínculos ou emitir a lista completa de todas as matrículas cadastradas.
    def deletar_matricula(self, matricula_id: int, usuario_logado: Usuario):
        self._verificar_permissao(usuario_logado)
        
        matricula = self.matricula_repo.buscar_por_id(matricula_id)
        if not matricula:
            raise RecursoNaoEncontradoError("Matrícula não encontrada.")
            
        self.matricula_repo.deletar(matricula)

    def listar_todas(self, usuario_logado: Usuario) -> list[dict]:
        self._verificar_permissao(usuario_logado)
        matriculas = self.matricula_repo.listar_todas()
        return [self._formatar_matricula_response(m) for m in matriculas]
    #---

    # Listagem de matrículas do Professor
    def listar_sob_responsabilidade_por_usuario_logado_professor(
        self, usuario_logado: Usuario
    ) -> MatriculasProfessorResponse:
        
        if usuario_logado.role == UserRole.PROFESSOR:
            matriculas = self.matricula_repo.listar_por_professor(usuario_logado.id)
            matriculas_formatadas = [
                {
                    "id": m.id,
                    "aluno": {
                        "nome": m.aluno.usuario.nome,
                        "matricula": m.aluno.matricula
                    },
                    "professor": {
                        "nome": m.professor.usuario.nome,
                        "email": m.professor.usuario.email
                    },
                    "disciplina": {
                        "id": m.disciplina.id,
                        "nome": m.disciplina.nome,
                        "codigo": m.disciplina.codigo
                    }
                }
                for m in matriculas
            ]
            # Retorna o schema específico do Professor
            return MatriculasProfessorResponse(
                matriculas=matriculas_formatadas
            )
        else:
            raise PermissaoNegadaError("Apenas professores podem visualizar a lista com suas próprias matrículas.")