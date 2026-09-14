# Define o molde do crachá de login. Determina como o token JWT é entregue ao usuário após o login e como seus dados básicos são lidos internamente.

from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None