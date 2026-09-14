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

class PermissaoNegadaError(Exception):
    pass

class RecursoNaoEncontradoError(Exception):
    pass

class VinculoJaExistenteError(Exception):
    pass

class CodigoDisciplinaJaExisteError(Exception):
    pass

class TurmaNaoEncontradaError(Exception):
    pass

class DisciplinaNaoEncontradaError(Exception):
    pass