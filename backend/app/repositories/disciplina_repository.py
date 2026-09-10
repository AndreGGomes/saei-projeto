# app/repositories/disciplina_repository.py
from sqlalchemy.orm import Session
from app.models import Disciplina

class DisciplinaRepository:
    def __init__(self, db: Session):
        self.db = db

    def buscar_por_id(self, disciplina_id: int) -> Disciplina | None:
        return self.db.query(Disciplina).filter(Disciplina.id == disciplina_id).first()
        
    def buscar_por_codigo(self, codigo: str) -> Disciplina | None:
        return self.db.query(Disciplina).filter(Disciplina.codigo == codigo).first()

    def criar(self, nome: str, codigo: str) -> Disciplina:
        disciplina = Disciplina(nome=nome, codigo=codigo)
        self.db.add(disciplina)
        self.db.commit()
        self.db.refresh(disciplina)
        return disciplina

    def deletar(self, disciplina: Disciplina):
        self.db.delete(disciplina)
        self.db.commit()