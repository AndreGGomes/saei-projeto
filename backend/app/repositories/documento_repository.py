# Gere o acesso e as operações na tabela de documentos (laudos médicos, atividades adaptadas e planos de aula).

from sqlalchemy.orm import Session, joinedload
from app.models import Documento

class DocumentoRepository:
    def __init__(self, db: Session):
        self.db = db

    # Salva um novo registro de documento no PostgreSQL, confirma a transação e recarrega os dados completos com relacionamentos
    def salvar(self, documento: Documento) -> Documento:
        self.db.add(documento)
        self.db.commit()
        self.db.refresh(documento)
        # Recarrega via buscar_por_id para já trazer as propriedades aninhadas (remetente e matricula) carregadas na memória
        return self.buscar_por_id(documento.id)

    # Localiza um documento único pelo seu id.
    def buscar_por_id(self, documento_id: int) -> Documento | None:
        return (
            self.db.query(Documento)
            .options(
                joinedload(Documento.remetente),
                joinedload(Documento.matricula)
            )
            .filter(Documento.id == documento_id)
            .first()
        )

    # Retorna todo o histórico de arquivos anexados a uma matrícula letiva específica, ordenados dos mais recentes para os mais antigos.
    # Faz o pré-carregamento dos dados de quem fez o upload (aluno ou docente) para agilizar a separação das listas de envio.
    def listar_por_matricula(self, matricula_id: int) -> list[Documento]:
        return (
            self.db.query(Documento)
            .options(joinedload(Documento.remetente))
            .filter(Documento.matricula_id == matricula_id)
            .order_by(Documento.data_upload.desc())
            .all()
        )

    # Remove o registro do documento do banco de dados e efetiva a remoção na transação corrente
    def deletar(self, documento: Documento):
        self.db.delete(documento)
        self.db.commit()