# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# URL de conexão: postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO
# Como o Postgres está no Docker, mas mapeado para a porta 5432 do seu PC, usamos 'localhost'.
DATABASE_URL = "postgresql://saei_user:saei_password@localhost:5432/saei_db"

# 1. O Motor (Engine): É a conexão real com o banco de dados.
engine = create_engine(DATABASE_URL)

# 2. A Sessão: Cada requisição HTTP do FastAPI usará uma "sessão" para conversar com o banco.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. A Base: É a "mãe" de todos os modelos. O Alembic vai ler esta Base para saber o que criar.
Base = declarative_base()