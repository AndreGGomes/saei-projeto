from pydantic import BaseModel, StrictStr, Field, model_validator
from typing import List, Optional

from app.models import TipoDocumento
from app.core.rubrica_dua import (
    CHAVES_CRITERIOS,
    PONTOS_POR_CRITERIO,
    PONTUACAO_MAXIMA,
    nivel_por_pontuacao,
)

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


# Nota de um único critério da rubrica DUA, com a evidência textual que a sustenta.
class IADimensaoDUA(BaseModel):
    chave: str
    score: int
    evidencia: str = ""


# Saída do Termômetro de Acessibilidade (IA Groq / FastAPI).
#
# O score NÃO é aceito da IA: ele é somado a partir das quatro dimensões da rubrica
# (app/core/rubrica_dua.py). Assim a nota exibida no termômetro é sempre coerente com
# as evidências devolvidas e o mesmo material tende a receber a mesma nota, eliminando
# respostas que diziam "bem adaptado" e "mal adaptado" na mesma chamada.
class IAAcessibilidadeInternal(BaseModel):
    dimensoes: List[IADimensaoDUA]
    pontos_positivos: List[StrictStr] = Field(default_factory=list)
    pontos_de_melhoria: List[StrictStr] = Field(default_factory=list)
    sugestao_imediata: str

    # Campos calculados pelo próprio schema (o prompt proíbe a IA de enviá-los).
    score_acessibilidade: int = 0
    nivel_acessibilidade: str = ""

    @model_validator(mode="after")
    def _consolidar_score(self):
        notas = {}
        for dimensao in self.dimensoes:
            chave = (dimensao.chave or "").strip().lower()
            if chave not in CHAVES_CRITERIOS:
                raise ValueError(
                    f"Dimensão desconhecida retornada pela IA: '{dimensao.chave}'. "
                    f"Esperado uma de: {', '.join(CHAVES_CRITERIOS)}."
                )
            if chave in notas:
                raise ValueError(f"Dimensão duplicada retornada pela IA: '{chave}'.")
            if not 0 <= dimensao.score <= PONTOS_POR_CRITERIO:
                raise ValueError(
                    f"Nota inválida ({dimensao.score}) na dimensão '{chave}': "
                    f"deve estar entre 0 e {PONTOS_POR_CRITERIO}."
                )
            # Normaliza a chave para o formato canônico da rubrica
            dimensao.chave = chave
            notas[chave] = dimensao.score

        faltando = [chave for chave in CHAVES_CRITERIOS if chave not in notas]
        if faltando:
            raise ValueError(
                "A IA não avaliou todos os critérios da rubrica DUA. "
                f"Faltando: {', '.join(faltando)}."
            )

        self.score_acessibilidade = min(PONTUACAO_MAXIMA, max(0, sum(notas.values())))
        self.nivel_acessibilidade = nivel_por_pontuacao(self.score_acessibilidade)
        return self