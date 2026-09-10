# app/repositories/matricula_repository.py
from sqlalchemy.orm import Session
from app.models import Matricula

class MatriculaRepository:
    def __init__(self, db: Session):
        self.db = db

    def buscar_por_id(self, matricula_id: int) -> Matricula | None:
        return self.db.query(Matricula).filter(Matricula.id == matricula_id).first()

    # NOVO: Para evitar duplicidade de matrícula na mesma disciplina
    def buscar_por_aluno_e_disciplina(self, aluno_id: int, disciplina_id: int) -> Matricula | None:
        return self.db.query(Matricula).filter(
            Matricula.aluno_id == aluno_id,
            Matricula.disciplina_id == disciplina_id
        ).first()

    # NOVO: Para a listagem de responsabilidade do professor
    def listar_por_professor(self, professor_id: int) -> list[Matricula]:
        return self.db.query(Matricula).filter(Matricula.professor_id == professor_id).all()

    def criar(self, aluno_id: int, professor_id: int, disciplina_id: int) -> Matricula:
        matricula = Matricula(
            aluno_id=aluno_id, 
            professor_id=professor_id, 
            disciplina_id=disciplina_id
        )
        self.db.add(matricula)
        self.db.commit()
        self.db.refresh(matricula)
        return matricula

    def atualizar_professor(self, matricula: Matricula, novo_professor_id: int) -> Matricula:
        matricula.professor_id = novo_professor_id
        self.db.commit()
        self.db.refresh(matricula)
        return matricula

    def deletar(self, matricula: Matricula):
        self.db.delete(matricula)
        self.db.commit()