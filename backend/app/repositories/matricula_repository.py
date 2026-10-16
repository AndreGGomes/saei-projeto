# Controla a tabela de vínculos escolares (matriculas), conectando Aluno, Professor e Disciplina.

from sqlalchemy.orm import Session, joinedload
from app.models import Matricula

class MatriculaRepository:
    def __init__(self, db: Session):
        self.db = db

    # Busca uma matrícula específica pelo seu ID
    def buscar_por_id(self, matricula_id: int) -> Matricula | None:
        return (
            self.db.query(Matricula)
            .options(
                joinedload(Matricula.aluno),
                joinedload(Matricula.professor),
                joinedload(Matricula.disciplina)
            )
            .filter(Matricula.id == matricula_id)
            .first()
        )

    # Verifica se este aluno já possui matrícula nesta matéria, para evitar duplicidade de matrícula na mesma disciplina
    def buscar_por_aluno_e_disciplina(self, aluno_id: int, disciplina_id: int) -> Matricula | None:
        return self.db.query(Matricula).filter(
            Matricula.aluno_id == aluno_id,
            Matricula.disciplina_id == disciplina_id
        ).first()

    # Lista todas as matrículas atribuídas a este professor
    def listar_por_professor(self, professor_id: int) -> list[Matricula]:
        return (
            self.db.query(Matricula)
            .options(joinedload(Matricula.aluno))
            .filter(Matricula.professor_id == professor_id)
            .all()
        )

    # Lista todas as matrículas deste aluno (logado)
    def listar_por_aluno(self, aluno_id: int) -> list[Matricula]:
        return (
            self.db.query(Matricula)
            .options(
                joinedload(Matricula.aluno),
                joinedload(Matricula.professor),
                joinedload(Matricula.disciplina)
            )
            .filter(Matricula.aluno_id == aluno_id)
            .all()
        )

    # Cria uma nova matrícula, insere no banco, confirma e recarrega
    def criar(self, aluno_id: int, professor_id: int, disciplina_id: int) -> Matricula:
        matricula = Matricula(
            aluno_id=aluno_id, 
            professor_id=professor_id, 
            disciplina_id=disciplina_id
        )
        self.db.add(matricula)
        self.db.commit()
        self.db.refresh(matricula)
        return self.buscar_por_id(matricula.id)

    # Atualiza quem é o professor responsável por essa matrícula
    def atualizar_professor(self, matricula: Matricula, novo_professor_id: int) -> Matricula:
        matricula.professor_id = novo_professor_id
        self.db.commit()
        self.db.refresh(matricula)
        return self.buscar_por_id(matricula.id)

    # Atualiza as preferências pessoais do aluno registradas nesta matrícula
    def atualizar_preferencias(self, matricula: Matricula, preferencias: str) -> Matricula:
        matricula.preferencias_do_aluno = preferencias
        self.db.commit()
        self.db.refresh(matricula)
        return self.buscar_por_id(matricula.id)

    # Deleta a matrícula
    def deletar(self, matricula: Matricula):
        self.db.delete(matricula)
        self.db.commit()

    # Lista todas as matrículas
    def listar_todas(self) -> list[Matricula]:
        return (
            self.db.query(Matricula)
            .options(
                joinedload(Matricula.aluno),
                joinedload(Matricula.professor),
                joinedload(Matricula.disciplina)
            )
            .all()
        )