# Orquestra tudo relacionado aos usuários: registro de alunos, professores e coordenadores (cada um com suas regras próprias) e busca por ID.
# A autenticação/emissão de JWT vive no AuthService, para manter uma responsabilidade por classe.

from app.models import Usuario, Aluno, Professor, Coordenador, UserRole
from app.schemas.usuario_schemas import AlunoCreate, FuncionarioCreate
from app.core import auth
from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.aluno_repository import AlunoRepository
from app.repositories.professor_repository import ProfessorRepository
from app.core.exceptions import (
    MatriculaJaCadastradaError,
    EmailJaEmUsoError,
    UsuarioNaoEncontradoError
)
class UsuarioService:
    # Construtor do serviço recebendo os dois repositórios por injeção de dependência.
    def __init__(
            self, 
            usuario_repo: UsuarioRepository, 
            aluno_repo: AlunoRepository,
            professor_repo: ProfessorRepository
        ):
        self.usuario_repo = usuario_repo
        self.aluno_repo = aluno_repo
        self.professor_repo = professor_repo

    # --- MÉTODOS PÚBLICOS ESPECÍFICOS ---

    # Fluxo de registro de estudante
    def registrar_aluno(self, dados: AlunoCreate) -> Usuario:
        # Verifica no banco se a matrícula informada já existe. Se existir, lança MatriculaJaCadastradaError
        if self.aluno_repo.buscar_por_matricula(dados.matricula):
            raise MatriculaJaCadastradaError("Esta matrícula já está cadastrada.")

        # Cria o usuário com role ALUNO e instancia o perfil Aluno com a matrícula
        usuario_base = self._preparar_usuario_base(dados, UserRole.ALUNO)
        perfil = Aluno(matricula=dados.matricula)

        # Salva no banco o usuário com role Aluno e o Aluno de forma atômica
        user_salvo = self.usuario_repo.criar_usuario_com_perfil(usuario_base, perfil)
        user_salvo.matricula = dados.matricula # para que o Pydantic consiga preencher o campo na resposta final da API
        return user_salvo

    # Fluxo de registro de professor. Confere se o e-mail não pertence a outro funcionário, cria o usuário com role PROFESSOR e instancia o perfil Professor().
    def registrar_professor(self, dados: FuncionarioCreate) -> Usuario:
        self._verificar_email_funcionario(dados.email)
            
        usuario_base = self._preparar_usuario_base(dados, UserRole.PROFESSOR)
        perfil = Professor()
        
        return self.usuario_repo.criar_usuario_com_perfil(usuario_base, perfil)

    # Listagem de professores
    def listar_professores(self) -> list[dict]:
        professores = self.professor_repo.listar_todos()
        return [
            {
                "nome": prof.usuario.nome,
                "email": prof.usuario.email
            }
            for prof in professores
        ]


    # Idêntico ao do professor, porém com coordenador
    def registrar_coordenador(self, dados: FuncionarioCreate) -> Usuario:
        self._verificar_email_funcionario(dados.email)
            
        usuario_base = self._preparar_usuario_base(dados, UserRole.COORDENADOR)
        perfil = Coordenador()
        
        return self.usuario_repo.criar_usuario_com_perfil(usuario_base, perfil)

    # Busca uma conta pelo ID e, caso não exista, lança UsuarioNaoEncontradoError
    def buscar_usuario(self, user_id: int) -> Usuario:
        user = self.usuario_repo.buscar_por_id(user_id)
        if not user:
            raise UsuarioNaoEncontradoError("Usuário não encontrado")
        return user
    
    # --- MÉTODOS PRIVADOS REUTILIZÁVEIS ---

    def _preparar_usuario_base(self, dados, role: UserRole) -> Usuario:
        """Cria a entidade base compartilhada por todos os tipos de conta."""
        return Usuario(
            nome=dados.nome,
            email=dados.email.lower(),
            senha_hash=auth.hash_password(dados.senha),
            role=role
        )

    def _verificar_email_funcionario(self, email: str):
        """Regra de negócio compartilhada por staff."""
        if self.usuario_repo.buscar_funcionarios_por_email(email.lower()):
            raise EmailJaEmUsoError("Este e-mail já está em uso por outro funcionário.")
