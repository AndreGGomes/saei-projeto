from pydantic import BaseModel
from typing import List, Optional

# Payload de Entrada
class TutorAlunoRequest(BaseModel):
    texto_atividade: str
    resumo_laudo: Optional[str] = "Nenhum laudo informado."
    preferencias_aluno: Optional[str] = "Nenhuma preferência específica informada."

# O que a IA da Groq devolve para o FastAPI (Uso Interno)
class IATutorAlunoInternal(BaseModel):
    explicacao_pedagogica: str
    passo_a_passo_resolucao: List[str]
    termos_busca_duckduckgo: List[str]

# O que o FastAPI devolve para o React (após consultar o DuckDuckGo)
class TutorAlunoResponse(BaseModel):
    explicacao_pedagogica: str
    passo_a_passo_resolucao: List[str]
    links_recomendados: List[dict]