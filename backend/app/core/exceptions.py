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

# Erro 400 (Bad Request): o pedido chegou em um formato que o domínio não consegue processar
# (ex.: PDF vazio ou ilegível, texto curto demais para análise).
class DadosInvalidosError(Exception):
    pass

# Erro 502 (Bad Gateway): a dependência externa (Groq) falhou ou está indisponível.
class ServicoIAIndisponivelError(Exception):
    pass

# Erro 502 (Bad Gateway): a IA respondeu, mas fora do contrato JSON combinado
# (JSON truncado, campo faltando, nota impossível).
class RespostaIAInvalidaError(Exception):
    pass