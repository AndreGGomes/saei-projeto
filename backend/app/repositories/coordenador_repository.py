from sqlalchemy.orm import Session
from app.models import Coordenador, Aluno

class CoordenadorRepository:
    def __init__(self, db: Session):
        self.db = db

    def buscar_por_usuario_id(self, usuario_id: int) -> Coordenador | None:
        return self.db.query(Coordenador).filter(Coordenador.usuario_id == usuario_id).first()

    # Função própria para retornar os tutorados do coordenador
    def listar_tutorados_por_coordenador(self, usuario_id: int) -> list[Aluno]:
        coordenador = self.buscar_por_usuario_id(usuario_id)
        return coordenador.tutorados