from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum

# enumeração dos papeis de usuario
class UserRole(str, enum.Enum):
    ALUNO = "ALUNO"
    PROFESSOR = "PROFESSOR"
    COORDENADOR = "COORDENADOR"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String, nullable=False)
    email = Column(String, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), nullable=False)

    # cria ligações lógicas entre o usuário e as fichas de perfil
    perfil_aluno = relationship(
        "Aluno", 
        back_populates="usuario", # sincroniza com a propriedade usuario na classe Aluno
        uselist=False, # transforma a relação em 1 para 1. em vez de usuario.perfil_aluno retornar uma lista de perfis, retorna apenas um único objeto de aluno.
        cascade="all, delete-orphan", # se um usuário for deletado da tabela usuarios, o perfil correspondente dele na tabela é apagado automaticamente para não deixar registros órfãos e lixo no banco.
        foreign_keys="[Aluno.usuario_id]" # Ensina ao SQLAlchemy qual coluna usar para ligar as duas tabelas. Como a tabela Aluno tem duas chaves para Usuario (usuario_id e tutor_id), sem essa instrução o ORM ficaria em dúvida sobre qual campo usar.
    )
    
    perfil_professor = relationship(
        "Professor", 
        back_populates="usuario", 
        uselist=False, 
        cascade="all, delete-orphan"
    )
    
    perfil_coordenador = relationship(
        "Coordenador", 
        back_populates="usuario", 
        uselist=False, 
        cascade="all, delete-orphan"
    )

class Aluno(Base):
    __tablename__ = "alunos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)
    
    matricula = Column(String, unique=True, nullable=False)
    tutor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True) # chave estrangeira opcional

    usuario = relationship(
        "Usuario", 
        back_populates="perfil_aluno", 
        foreign_keys=[usuario_id]
    )
    
    tutor = relationship(
        "Usuario", 
        foreign_keys=[tutor_id]
    ) 
    
    matriculas = relationship(
        "Matricula", 
        back_populates="aluno", 
        cascade="all, delete-orphan",
        primaryjoin="Aluno.usuario_id == foreign(Matricula.aluno_id)" # define que a amarração entre as tabelas é feita comparando o usuario_id do aluno com a coluna aluno_id da tabela Matricula
    )

class Professor(Base):
    __tablename__ = "professores"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)

    usuario = relationship("Usuario", back_populates="perfil_professor")
    
    matriculas = relationship(
        "Matricula", 
        back_populates="professor", 
        cascade="all, delete-orphan",
        primaryjoin="Professor.usuario_id == foreign(Matricula.professor_id)"
    )

class Coordenador(Base):
    __tablename__ = "coordenadores"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)

    usuario = relationship("Usuario", back_populates="perfil_coordenador")
    
    tutorados = relationship(
        "Aluno", 
        primaryjoin="Coordenador.usuario_id == foreign(Aluno.tutor_id)",
        viewonly=True # esse relacionamento é apenas para leitura. Para alterar o tutor de um aluno, altera-se o campo tutor_id no aluno, impedindo gravações ambíguas a partir do objeto do coordenador.
    )

class Disciplina(Base):
    __tablename__ = "disciplinas"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    codigo = Column(String, unique=True, nullable=False)
    
    matriculas = relationship("Matricula", back_populates="disciplina", cascade="all, delete-orphan")

class Matricula(Base):
    __tablename__ = "matriculas"
    id = Column(Integer, primary_key=True, index=True)
    
    aluno_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    professor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"), nullable=False)

    aluno = relationship(
        "Aluno", 
        foreign_keys=[aluno_id], 
        primaryjoin="Matricula.aluno_id == Aluno.usuario_id", 
        back_populates="matriculas"
    )
    professor = relationship(
        "Professor", 
        foreign_keys=[professor_id], 
        primaryjoin="Matricula.professor_id == Professor.usuario_id", 
        back_populates="matriculas"
    )
    disciplina = relationship("Disciplina", back_populates="matriculas")