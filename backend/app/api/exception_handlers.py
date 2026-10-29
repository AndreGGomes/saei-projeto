# Escudo e tradutor de erros da API. Sem ele, qualquer erro lançado em um service viraria uma falha genérica interna 500 (Internal Server Error). Ele escuta cada exceção e a converte no código HTTP semântico correspondente.

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.core.exceptions import (
    MatriculaObrigatoriaError, MatriculaJaCadastradaError, 
    EmailJaEmUsoError, MultiplasContasError, 
    CredenciaisInvalidasError, UsuarioNaoEncontradoError,
    PermissaoNegadaError, VinculoJaExistenteError,
    RecursoNaoEncontradoError, CodigoDisciplinaJaExisteError,
    TurmaNaoEncontradaError, DisciplinaNaoEncontradaError,
    DadosInvalidosError, ServicoIAIndisponivelError, RespostaIAInvalidaError
)

# Função que acopla todos os interceptadores de erro dentro da aplicação FastAPI.
def registrar_handlers_de_excecao(app: FastAPI):
    
    # Agrupa exceções que resultam em erro 400 (Bad Request)
    @app.exception_handler(MatriculaObrigatoriaError)
    @app.exception_handler(MatriculaJaCadastradaError)
    @app.exception_handler(EmailJaEmUsoError)
    @app.exception_handler(MultiplasContasError)
    @app.exception_handler(VinculoJaExistenteError)
    @app.exception_handler(CodigoDisciplinaJaExisteError)
    @app.exception_handler(DadosInvalidosError)
    async def bad_request_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": str(exc)},
        )

    # Agrupa exceções que resultam em erro 401 (Unauthorized)
    # Obs: PermissaoNegadaError é registrada apenas no grupo 403 abaixo — antes ela estava
    # declarada nos dois grupos e o registro posterior silenciosamente sobrescrevia o primeiro.
    @app.exception_handler(CredenciaisInvalidasError)
    async def unauthorized_handler(request: Request, exc: CredenciaisInvalidasError):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": str(exc)},
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Erro 404 (Not Found)
    @app.exception_handler(UsuarioNaoEncontradoError)
    @app.exception_handler(RecursoNaoEncontradoError)
    @app.exception_handler(TurmaNaoEncontradaError)
    @app.exception_handler(DisciplinaNaoEncontradaError)
    async def not_found_handler(request: Request, exc: UsuarioNaoEncontradoError):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": str(exc)},
        )

    # Erro 403 (Forbidden)
    @app.exception_handler(PermissaoNegadaError)
    async def forbidden_handler(request: Request, exc: Exception):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": str(exc)},
                headers={"WWW-Authenticate": "Bearer"},
            )

    # Erro 502 (Bad Gateway): falhas do provedor de IA e respostas fora do contrato.
    # Ficam aqui para que nenhum router precise de try/except: o service lança a exceção
    # de domínio e a tradução para HTTP acontece só neste ponto.
    @app.exception_handler(ServicoIAIndisponivelError)
    @app.exception_handler(RespostaIAInvalidaError)
    async def bad_gateway_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={"detail": str(exc)},
        )