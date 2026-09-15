# Trata do acesso aos dados da tabela professores.

from sqlalchemy.orm import Session
from app.models import Professor, Usuario, UserRole

class ProfessorRepository:
    def __init__(self, db: Session):
        self.db = db

    # Localiza o registro de professor a partir do ID de usuário
    def buscar_por_usuario_id(self, usuario_id: int) -> Professor | None:
        return self.db.query(Professor).filter(Professor.usuario_id == usuario_id).first()

    # Localiza pelo e-mail. Ele faz um INNER JOIN entre a tabela professores e usuarios, garantindo que o e-mail consultado realmente pertença a um usuário cujo cargo seja PROFESSOR.
    def buscar_por_email(self, email: str) -> Professor | None:
        return (
            self.db.query(Professor)
            .join(Usuario, Professor.usuario_id == Usuario.id) # Faz um INNER JOIN no SQL ligando o usuario_id do professor com o id da tabela de usuários.
            .filter(Usuario.email == email.lower(), Usuario.role == UserRole.PROFESSOR) # Aplica o filtro conferindo se o e-mail em minúsculo bate com o buscado e se a conta realmente possui cargo de PROFESSOR
            .first()
        )

    
