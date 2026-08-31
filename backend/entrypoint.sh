#!/bin/bash

echo "🚀 [Backend] Aguardando o banco de dados ficar pronto..."
sleep 5 # Pausa simples para garantir que o Postgres inicializou

echo "🔄 [Backend] Aplicando migrações do Alembic..."
alembic upgrade head

echo "🔥 [Backend] Iniciando o servidor FastAPI com Hot-Reload..."
# O --reload faz o servidor reiniciar automaticamente quando você salva um arquivo .py
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload