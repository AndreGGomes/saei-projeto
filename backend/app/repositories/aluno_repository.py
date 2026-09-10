# app/repositories/aluno_repository.py
from sqlalchemy.orm import Session
from app.models import Aluno

class AlunoRepository:
    def __init__(self, db: Session):
        self.db = db

    def buscar_por_usuario_id(self, usuario_id: int) -> Aluno | None:
        return self.db.query(Aluno).filter(Aluno.usuario_id == usuario_id).first()

    def atualizar_tutor(self, aluno: Aluno, tutor_id: int):
        aluno.tutor_id = tutor_id
        self.db.commit()
        self.db.refresh(aluno)

    def listar_por_tutor(self, coordenador_id: int) -> list[Aluno]:
        return self.db.query(Aluno).filter(Aluno.tutor_id == coordenador_id).all()