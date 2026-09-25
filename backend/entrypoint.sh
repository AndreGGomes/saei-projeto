#!/bin/bash

# Interrompe o script imediatamente se qualquer comando falhar
set -e

echo "🔄 [Backend] Banco saudável! Aplicando migrações do Alembic..."
alembic upgrade head

echo "🔥 [Backend] Iniciando o servidor FastAPI com Hot-Reload..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload