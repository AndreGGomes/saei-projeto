# Regras de autorização por papel compartilhadas entre os services.
# Evita que cada serviço reimplemente a mesma checagem de coordenador.

from app.models import Usuario, UserRole
from app.core.exceptions import PermissaoNegadaError


def exigir_coordenador(usuario: Usuario, mensagem: str = "Apenas coordenadores podem realizar esta ação.") -> None:
    """Aborta a operação com 403 quando o usuário logado não é coordenação."""
    if usuario.role != UserRole.COORDENADOR:
        raise PermissaoNegadaError(mensagem)
