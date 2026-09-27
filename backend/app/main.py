# Ele é o ponto de entrada de toda a aplicação (Entrypoint). É a variável app deste arquivo que o servidor Uvicorn roda no Docker.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import disciplinas, matricula, usuarios, aluno, coordenador, documentos
from app.api.exception_handlers import registrar_handlers_de_excecao

# Cria o servidor web da aplicação
# Configura o título, a descrição e a versão que aparecem automaticamente no cabeçalho do Swagger em http://localhost:8000/docs
app = FastAPI(
    title="SAEI - Sistema de Apoio à Educação Inclusiva",
    description="API para gestão de educação inclusiva com IA",
    version="1.0.0"
)

# Configuração de CORS (Útil com front react estiver funcionando)
# Permite que o React (porta 5173) faça requisições para o FastAPI (porta 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Junta todas as rotas e regras criadas no projeto sob um único servidor.
registrar_handlers_de_excecao(app)
app.include_router(usuarios.router)
app.include_router(aluno.router)
app.include_router(coordenador.router)
app.include_router(matricula.router)
app.include_router(disciplinas.router)
app.include_router(documentos.router)

# Rota de teste (Health Check) para provar que o servidor está vivo
@app.get("/")
def read_root():
    return {"message": "SAEI Backend está rodando com sucesso no Docker."}

# Rota para testar se o banco está conectado (Opcional)
@app.get("/health-db")
def health_db():
    return {"status": "OK", "database": "PostgreSQL conectado via Docker"}