# app/repositories/professor_repository.py
from sqlalchemy.orm import Session
from app.models import Professor

class ProfessorRepository:
    def __init__(self, db: Session):
        self.db = db

    def buscar_por_usuario_id(self, usuario_id: int) -> Professor | None:
        return self.db.query(Professor).filter(Professor.usuario_id == usuario_id).first()