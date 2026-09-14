from sqlalchemy.orm import Session
from app.models import Disciplina

class DisciplinaRepository:
    def __init__(self, db: Session):
        self.db = db

    # Busca a disciplina pelo seu ID
    def buscar_por_id(self, disciplina_id: int) -> Disciplina | None:
        return self.db.query(Disciplina).filter(Disciplina.id == disciplina_id).first()

    # Busca a disciplina pelo seu código
    def buscar_por_codigo(self, codigo: str) -> Disciplina | None:
        return self.db.query(Disciplina).filter(Disciplina.codigo == codigo).first()

    # Cria uma nova disciplina e insere no banco, confirma e recarrega
    def criar(self, nome: str, codigo: str) -> Disciplina:
        disciplina = Disciplina(nome=nome, codigo=codigo)
        self.db.add(disciplina)
        self.db.commit()
        self.db.refresh(disciplina)
        return disciplina

    # Remove a disciplina do banco. Se a matéria for deletada, todas as matrículas ligadas a ela são limpas do banco automaticamente.
    def deletar(self, disciplina: Disciplina):
        self.db.delete(disciplina)
        self.db.commit()