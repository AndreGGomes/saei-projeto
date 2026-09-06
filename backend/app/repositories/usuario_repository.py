from sqlalchemy.orm import Session
from app.models import Usuario, Aluno, Professor, Coordenador, UserRole

class UsuarioRepository:
    def __init__(self, db: Session):
        self.db = db

    def buscar_por_id(self, user_id: int) -> Usuario:
        return self.db.query(Usuario).filter(Usuario.id == user_id).first()

    def buscar_por_matricula(self, matricula: str) -> Aluno:
        return self.db.query(Aluno).filter(Aluno.matricula == matricula).first()

    def buscar_funcionarios_por_email(self, email: str) -> Usuario:
        return self.db.query(Usuario).filter(
            Usuario.email == email, 
            Usuario.role != UserRole.ALUNO
        ).first()

    def buscar_todos_por_email(self, email: str) -> list[Usuario]:
        return self.db.query(Usuario).filter(Usuario.email == email).all()

    def criar_usuario_com_perfil(self, usuario: Usuario, perfil_obj) -> Usuario:
        self.db.add(usuario)
        self.db.flush() # Gera o ID do usuário sem commitar a transação final
        
        if perfil_obj:
            perfil_obj.usuario_id = usuario.id
            self.db.add(perfil_obj)
            
        self.db.commit()
        self.db.refresh(usuario)
        return usuario