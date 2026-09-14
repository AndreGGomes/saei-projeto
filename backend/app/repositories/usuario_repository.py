# Gerencia as operações de banco da tabela principal usuarios, além de orquestrar a criação atômica do usuário junto com seu perfil correspondente (aluno, professor ou coordenador).

from sqlalchemy.orm import Session
from app.models import Usuario, Aluno, Professor, Coordenador, UserRole


class UsuarioRepository:
    def __init__(self, db: Session):
        self.db = db # Ao instanciar este repositório, recebe a sessão ativa do banco e guarda em self.db

    def buscar_por_id(self, user_id: int) -> Usuario:
        return self.db.query(Usuario).filter(Usuario.id == user_id).first()
        # SELECT * FROM usuarios WHERE id = user_id LIMIT 1

    def buscar_funcionarios_por_email(self, email: str) -> Usuario:
        return self.db.query(Usuario).filter(
            Usuario.email == email, 
            Usuario.role != UserRole.ALUNO
        ).first()

    # Usado no fluxo de login para detectar se mais de uma conta usa aquele e-mail (caso em que o sistema exige o login via matrícula)
    def buscar_todos_por_email(self, email: str) -> list[Usuario]:
        return self.db.query(Usuario).filter(Usuario.email == email).all()

    # Grava o usuário e seu perfil associado em uma única transação
    def criar_usuario_com_perfil(self, usuario: Usuario, perfil_obj) -> Usuario:
        self.db.add(usuario) # coloca o novo usuário na fila de gravação
        self.db.flush() # gera o id do usuário sem commitar a transação final
        
        if perfil_obj:
            perfil_obj.usuario_id = usuario.id # Pega o ID recém-gerado do usuário e injeta como chave estrangeira no perfil (Aluno, Professor ou Coordenador)
            self.db.add(perfil_obj) # coloca o perfil na fila
            
        self.db.commit() # grava os dois juntos
        self.db.refresh(usuario) # recarrega os dados atualizados
        return usuario