# backend/app/models/__init__.py
from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum

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
    
    perfil_aluno = relationship(
        "Aluno", 
        back_populates="usuario", 
        uselist=False, 
        cascade="all, delete-orphan",
        foreign_keys="[Aluno.usuario_id]" 
    )
    
    perfil_professor = relationship("Professor", back_populates="usuario", uselist=False, cascade="all, delete-orphan")
    perfil_coordenador = relationship("Coordenador", back_populates="usuario", uselist=False, cascade="all, delete-orphan")

class Aluno(Base):
    __tablename__ = "alunos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)
    
    matricula = Column(String, unique=True, nullable=False)
    tutor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)

    usuario = relationship("Usuario", back_populates="perfil_aluno", foreign_keys=[usuario_id])
    tutor = relationship("Usuario", foreign_keys=[tutor_id]) 
    
    # Atualizado para conversar perfeitamente com a nova entidade Matricula
    matriculas = relationship(
        "Matricula", 
        back_populates="aluno", 
        cascade="all, delete-orphan",
        primaryjoin="Aluno.usuario_id == foreign(Matricula.aluno_id)"
    )

class Professor(Base):
    __tablename__ = "professores"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)

    usuario = relationship("Usuario", back_populates="perfil_professor")
    
    # Removida a relação de turmas, agora aponta direto para as matrículas vinculadas
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
        viewonly=True
    )

class Disciplina(Base):
    __tablename__ = "disciplinas"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    codigo = Column(String, unique=True, nullable=False)
    
    # Removida relação de turmas e adicionada relação com matrículas
    matriculas = relationship("Matricula", back_populates="disciplina", cascade="all, delete-orphan")

class Matricula(Base):
    __tablename__ = "matriculas"
    id = Column(Integer, primary_key=True, index=True)
    
    aluno_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    professor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"), nullable=False)

    # Transformados em relacionamentos bidirecionais (back_populates) em vez de viewonly
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