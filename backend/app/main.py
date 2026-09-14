from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import acompanhamento, disciplinas, matricula, usuarios
from app.api.exception_handlers import registrar_handlers_de_excecao

# 1. Cria a instância do aplicativo FastAPI 
# (É EXATAMENTE essa variável "app" que o Uvicorn está procurando!)
app = FastAPI(
    title="SAEI - Sistema de Apoio à Educação Inclusiva",
    description="API para gestão de educação inclusiva com IA",
    version="1.0.0"
)

# 2. Configuração de CORS (Essencial para o Front-end React do Dev 1 funcionar)
# Permite que o React (porta 5173) faça requisições para o FastAPI (porta 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, troque "*" por "http://localhost:5173"
    allow_credentials=True,
    allow_methods=["*"], # Permite GET, POST, PUT, DELETE
    allow_headers=["*"], # Permite enviar o Token JWT no Header
)

registrar_handlers_de_excecao(app)

app.include_router(usuarios.router)
app.include_router(acompanhamento.router)
app.include_router(matricula.router)
app.include_router(disciplinas.router)

# 3. Rota de teste (Health Check) para provar que o servidor está vivo
@app.get("/")
def read_root():
    return {"message": "SAEI Backend está rodando com sucesso no Docker! 🚀"}

# 4. Rota para testar se o banco está conectado (Opcional, mas legal)
@app.get("/health-db")
def health_db():
    # Aqui futuramente o Dev 2 vai testar a conexão real com o banco
    return {"status": "OK", "database": "PostgreSQL conectado via Docker"}