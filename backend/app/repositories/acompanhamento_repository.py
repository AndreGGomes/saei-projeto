from sqlalchemy.orm import Session
from app.models import Usuario, Aluno, Professor, Turma, Matricula, Disciplina

class AcompanhamentoRepository:
    def __init__(self, db: Session):
        self.db = db

    def buscar_aluno_por_usuario_id(self, usuario_id: int) -> Aluno:
        return self.db.query(Aluno).filter(Aluno.usuario_id == usuario_id).first()

    def buscar_professor_por_usuario_id(self, usuario_id: int) -> Professor:
        return self.db.query(Professor).filter(Professor.usuario_id == usuario_id).first()

    def buscar_disciplina(self, disciplina_id: int) -> Disciplina:
        return self.db.query(Disciplina).filter(Disciplina.id == disciplina_id).first()

    def buscar_ou_criar_turma(self, professor_id: int, disciplina_id: int) -> Turma:
        turma = self.db.query(Turma).filter(
            Turma.professor_id == professor_id,
            Turma.disciplina_id == disciplina_id
        ).first()
        
        if not turma:
            turma = Turma(professor_id=professor_id, disciplina_id=disciplina_id)
            self.db.add(turma)
            self.db.flush()
        return turma

    def buscar_matricula(self, aluno_id: int, turma_id: int) -> Matricula:
        return self.db.query(Matricula).filter(
            Matricula.aluno_id == aluno_id,
            Matricula.turma_id == turma_id
        ).first()

    def criar_matricula(self, aluno_id: int, turma_id: int) -> Matricula:
        nova_matricula = Matricula(aluno_id=aluno_id, turma_id=turma_id)
        self.db.add(nova_matricula)
        self.db.commit()
        self.db.refresh(nova_matricula)
        return nova_matricula

    def atualizar_tutor(self, aluno: Aluno, tutor_id: int):
        aluno.tutor_id = tutor_id
        self.db.commit()
        self.db.refresh(aluno)

    def listar_tutorados(self, coordenador_id: int) -> list[Aluno]:
        return self.db.query(Aluno).filter(Aluno.tutor_id == coordenador_id).all()

    def listar_turmas_professor(self, professor_id: int) -> list[Turma]:
        return self.db.query(Turma).filter(Turma.professor_id == professor_id).all()