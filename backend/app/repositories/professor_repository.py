# Trata do acesso aos dados da tabela professores.

from sqlalchemy.orm import Session
from app.models import Professor

class ProfessorRepository:
    def __init__(self, db: Session):
        self.db = db

    # Localiza o registro de professor a partir do ID de usuário
    def buscar_por_usuario_id(self, usuario_id: int) -> Professor | None:
        return self.db.query(Professor).filter(Professor.usuario_id == usuario_id).first()