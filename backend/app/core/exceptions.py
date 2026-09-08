# app/core/exceptions.py

class UsuarioException(Exception):
    """Exceção base para domínio de usuários"""
    pass

class MatriculaObrigatoriaError(UsuarioException):
    pass

class MatriculaJaCadastradaError(UsuarioException):
    pass

class EmailJaEmUsoError(UsuarioException):
    pass

class MultiplasContasError(UsuarioException):
    pass

class CredenciaisInvalidasError(UsuarioException):
    pass

class UsuarioNaoEncontradoError(UsuarioException):
    pass