from pydantic import BaseModel, StrictStr
from typing import List, Optional
from app.models import TipoDocumento

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


# Payload de Entrada do endpoint de Adaptação Inteligente de Materiais
# (Visão do Professor e do Coordenador)
class AdaptarMaterialRequest(BaseModel):
    texto_material: str
    tipo_documento: TipoDocumento
    resumo_laudo: Optional[str] = "Nenhum laudo informado."


# O que a IA da Groq devolve para o FastAPI (Uso Interno) na adaptação de materiais.
# StrictStr garante que a IA não consiga entregar números ou bools convertidos para string
# (ex.: [1, 2] ou [true]) sem que o Pydantic derrube a resposta com ValidationError.
class IAAdaptacaoInternal(BaseModel):
    mudancas_sugeridas: List[StrictStr]
    justificativa_inclusiva: str
    dicas_de_abordagem: List[StrictStr]


# --- TERMÔMETRO DE ACESSIBILIDADE ---

# Payload de Entrada
class AvaliarAcessibilidadeRequest(BaseModel):
    texto_material: str


# Saída do Termômetro de Acessibilidade (IA Groq / FastAPI)
class IAAcessibilidadeInternal(BaseModel):
    score_acessibilidade: int
    pontos_positivos: List[StrictStr]
    pontos_de_melhoria: List[StrictStr]
    sugestao_imediata: str