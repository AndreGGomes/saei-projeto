# Ele é o ponto de entrada de toda a aplicação (Entrypoint). É a variável app deste arquivo que o servidor Uvicorn roda no Docker.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import disciplinas, matricula, usuarios, aluno, coordenador, documentos, ia
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
# Obs.: o navegador envia o cabeçalho "Origin" com o endereço de onde a página do
# front foi aberta. Se esse endereço não estiver na lista abaixo, o Starlette
# responde o preflight (OPTIONS) com "400 Disallowed CORS origin" e o cadastro
# falha antes de qualquer requisição POST ser enviada.
# Como em desenvolvimento esse endereço varia (porta diferente do Vite, IP do
# container/rede Docker, localhost vs 127.0.0.1, acesso pela rede local ou pelo
# preview), aceitamos qualquer porta em hosts locais e IPs privados via regex,
# mantendo o bloqueio de domínios externos.
DEV_ORIGIN_REGEX = (
    r"https?://(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0"
    r"|10\.\d{1,3}\.\d{1,3}\.\d{1,3}"
    r"|192\.168\.\d{1,3}\.\d{1,3}"
    r"|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})"
    r"(?::\d+)?"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=DEV_ORIGIN_REGEX,
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
app.include_router(ia.router)

# Rota de teste (Health Check) para provar que o servidor está vivo
@app.get("/")
def read_root():
    return {"message": "SAEI Backend está rodando com sucesso no Docker."}

# Rota para testar se o banco está conectado (Opcional)
@app.get("/health-db")
def health_db():
    return {"status": "OK", "database": "PostgreSQL conectado via Docker"}