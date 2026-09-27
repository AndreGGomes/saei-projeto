from sqlalchemy.orm import Session
from app.models import Coordenador, Aluno

class CoordenadorRepository:
    def __init__(self, db: Session):
        self.db = db

    def buscar_por_usuario_id(self, usuario_id: int) -> Coordenador | None:
        return self.db.query(Coordenador).filter(Coordenador.usuario_id == usuario_id).first()

    def buscar_aluno_por_id(self, aluno_id: int) -> Aluno | None:
        return self.db.query(Aluno).filter(Aluno.id == aluno_id).first()

    # Função própria para retornar os tutorados do coordenador
    def listar_tutorados_por_coordenador(self, usuario_id: int) -> list[Aluno]:
        coordenador = self.buscar_por_usuario_id(usuario_id)
        if not coordenador:
            return []
        return coordenador.tutorados

    # Adiciona um aluno à lista de tutorados do coordenador
    def adicionar_tutorado(self, usuario_id: int, aluno_id: int) -> Aluno | None:
        coordenador = self.buscar_por_usuario_id(usuario_id)
        aluno = self.buscar_aluno_por_id(aluno_id)

        if not coordenador or not aluno:
            return None

        if aluno not in coordenador.tutorados:
            coordenador.tutorados.append(aluno)
            self.db.commit()
            self.db.refresh(coordenador)

        return aluno

    # Remove um aluno da lista de tutorados do coordenador
    def remover_tutorado(self, usuario_id: int, aluno_id: int) -> bool:
        coordenador = self.buscar_por_usuario_id(usuario_id)
        aluno = self.buscar_aluno_por_id(aluno_id)

        if not coordenador or not aluno:
            return False

        if aluno in coordenador.tutorados:
            coordenador.tutorados.remove(aluno)
            self.db.commit()
            return True

        return False