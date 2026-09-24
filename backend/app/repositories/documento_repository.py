# app/repositories/documento_repository.py
from sqlalchemy.orm import Session
from app.models import Documento

class DocumentoRepository:
    def __init__(self, db: Session):
        self.db = db

    def salvar(self, documento: Documento) -> Documento:
        self.db.add(documento)
        self.db.commit()
        self.db.refresh(documento)
        return documento

    def buscar_por_id(self, documento_id: int) -> Documento:
        return self.db.query(Documento).filter(Documento.id == documento_id).first()

    def listar_por_matricula(self, matricula_id: int) -> list[Documento]:
        return self.db.query(Documento).filter(Documento.matricula_id == matricula_id).all()