from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

# 1. Enum de papéis (UC01 - Autenticação)

class UserRole(str, enum.Enum):
    ALUNO = "ALUNO"
    PROFESSOR = "PROFESSOR"
    COORDENADOR = "COORDENADOR"

# 2. Tabela de usuários (UC01, UC07)

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key = True, index = True, autoincrement = True)
    nome = Column(String, nullable = False)
    email = Column(String, unique = True, index = True, nullable = False)
    senha_hash = Column(String, nullable = False) # o dev back end vai usar bcrypt pra hashear a senha
    role = Column(SAEnum(UserRole), nullable = False)

    #UC07
    #apenas alunos terao um tutor_id preenchido
    tutor_id = Column(Integer, ForeignKey("usuarios.id"), nullable = True)

    #relacionamentos
    tutorados = relationship("Usuario", back_populates = "tutor", remote_side = [id])
    tutor = relationship("Usuario", back_populates = "tutorados", foreign_keys = [tutor_id])

    matriculas = relationship("Matricula", back_populates = "aluno")
    turmas_lecionadas = relationship("Turma", back_populates = "professor")

    # 3. Tabela de disciplinas

    class Disciplina(Base):
        __tablename__ = "disciplinas"

        id = Column(Integer, primary_key = True, index = True)
        nome = Column(String, nullable = False)
        codigo = Column(String, unique = True, nullable = False)

        turmas = relationship("Turma", back_populates = "disciplina")

    # 4. Tabela de turma (UC06)

    class Turma(Base):
        __tablename__ = "turmas"

        id = Column(Integer, primary_key = True, index = True)

        professor_id = Column(Integer, ForeignKey("usuarios.id"), nullable = False)
        disciplina_id = Column(Integer, ForeignKey("disciplinas.id"), nullable = False)

        professor = relationship("Usuario", back_populates = "turmas_lecionadas")
        disciplina = relationship("Disciplina", back_populates = "turmas")
        alunos_matriculados = relationship("Matricula", back_populates = "turma")

    # 5. Tabela de matricula (UC06, UC08)

    class Matricula(Base):
        __tablename__ = "matriculas"

        id = Column(Integer, primary_key = True, index = True)

        aluno_id = Column(Integer, ForeignKey("usuarios.id"), nullable = False)
        turma_id = Column(Integer, ForeignKey("turmas.id"), nullable = False)

        aluno = relationship("Usuario", back_populates = "matriculas")
        turma = relationship("Turma", back_populates = "alunos_matriculados")