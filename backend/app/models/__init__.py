# backend/app/models/__init__.py
from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SAEnum, Boolean
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
    
    # AQUI ESTÁ A CORREÇÃO: Adicionado foreign_keys="[Aluno.usuario_id]"
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
    # FK para a tabela de Auth. UNIQUE garante o relacionamento 1:1
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)
    
    # Campos específicos de negócio do aluno
    matricula = Column(String, unique=True, nullable=False)
    
    # UC07: Acompanhamento Direto (O tutor é um Usuário com role=COORDENADOR)
    tutor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)

    usuario = relationship("Usuario", back_populates="perfil_aluno", foreign_keys=[usuario_id])
    # O tutor aponta para a tabela de usuários (pois o login do coordenador está lá)
    tutor = relationship("Usuario", foreign_keys=[tutor_id]) 
    matriculas = relationship(
        "Matricula", 
        back_populates="aluno", 
        cascade="all, delete-orphan",
        primaryjoin="Aluno.usuario_id == foreign(Matricula.aluno_id)" # <- foreign() adicionado
    )

class Professor(Base):
    __tablename__ = "professores"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)

    usuario = relationship("Usuario", back_populates="perfil_professor")
    turmas_lecionadas = relationship(
        "Turma", 
        back_populates="professor", 
        cascade="all, delete-orphan",
        primaryjoin="Professor.usuario_id == foreign(Turma.professor_id)" # <- foreign() adicionado
    )

class Coordenador(Base):
    __tablename__ = "coordenadores"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)

    usuario = relationship("Usuario", back_populates="perfil_coordenador")
    
    # UC07: Lista de alunos que este coordenador tutora
    # Busca na tabela 'alunos' onde o 'tutor_id' seja igual ao 'usuario_id' deste coordenador
    tutorados = relationship(
        "Aluno", 
        primaryjoin="Coordenador.usuario_id == foreign(Aluno.tutor_id)", # <- Substituído remote por foreign
        viewonly=True
    )
class Disciplina(Base):
    __tablename__ = "disciplinas"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    codigo = Column(String, unique=True, nullable=False)
    turmas = relationship("Turma", back_populates="disciplina")

class Turma(Base):
    __tablename__ = "turmas"
    id = Column(Integer, primary_key=True, index=True)
    
    professor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"), nullable=False)

    professor = relationship("Professor", foreign_keys=[professor_id], primaryjoin="Turma.professor_id == Professor.usuario_id", viewonly=True)
    disciplina = relationship("Disciplina", back_populates="turmas")
    alunos_matriculados = relationship("Matricula", back_populates="turma")

class Matricula(Base):
    __tablename__ = "matriculas"
    id = Column(Integer, primary_key=True, index=True)
    
    aluno_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    turma_id = Column(Integer, ForeignKey("turmas.id"), nullable=False)

    aluno = relationship("Aluno", foreign_keys=[aluno_id], primaryjoin="Matricula.aluno_id == Aluno.usuario_id", viewonly=True)
    turma = relationship("Turma", back_populates="alunos_matriculados")