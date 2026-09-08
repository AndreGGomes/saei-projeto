# backend/app/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Lê do ambiente (Docker) ou usa o fallback (Local)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://saei_user:saei_password@localhost:5432/saei_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()