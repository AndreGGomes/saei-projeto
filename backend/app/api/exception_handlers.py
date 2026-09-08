# app/api/exception_handlers.py
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.core.exceptions import (
    MatriculaObrigatoriaError, MatriculaJaCadastradaError, 
    EmailJaEmUsoError, MultiplasContasError, 
    CredenciaisInvalidasError, UsuarioNaoEncontradoError
)

def registrar_handlers_de_excecao(app: FastAPI):
    
    # Agrupa exceções que resultam em erro 400 (Bad Request)
    @app.exception_handler(MatriculaObrigatoriaError)
    @app.exception_handler(MatriculaJaCadastradaError)
    @app.exception_handler(EmailJaEmUsoError)
    @app.exception_handler(MultiplasContasError)
    async def bad_request_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": str(exc)},
        )

    # Erro 401 (Unauthorized) com o header necessário para o OAuth2
    @app.exception_handler(CredenciaisInvalidasError)
    async def unauthorized_handler(request: Request, exc: CredenciaisInvalidasError):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": str(exc)},
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Erro 404 (Not Found)
    @app.exception_handler(UsuarioNaoEncontradoError)
    async def not_found_handler(request: Request, exc: UsuarioNaoEncontradoError):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": str(exc)},
        )