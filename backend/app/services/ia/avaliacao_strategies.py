# Estratégia de prompt do Termômetro de Acessibilidade DUA.
#
# Substitui o antigo prompt "livre" de ia_client.avaliar_acessibilidade, que pedia apenas
# "uma pontuação global de 0 a 100 com base na clareza" — sem critérios, sem as diretrizes
# institucionais e sem âncora no texto. Isso produzia notas incongruentes: o mesmo material
# podia receber 90 e "excelente estrutura DUA" numa chamada e 40 e "mal adaptado" na
# seguinte, além de ignorar as diretrizes de inclusão da SAEI.
#
# Aqui a avaliação é determinística por construção:
#   1. quatro critérios fixos (três princípios do DUA + formato/diretrizes institucionais);
#   2. cinco indicadores verificáveis por critério, valendo 0, 3 ou 5 pontos;
#   3. toda nota precisa de evidência citada do texto (ou "Ausente no texto");
#   4. o score final NÃO é pedido à IA: é somado a partir das notas de critério
#      (ver IAAcessibilidadeInternal em app/schemas/ia_schemas.py).

from app.core.rubrica_dua import (
    CRITERIOS_DUA,
    PONTOS_POR_INDICADOR,
    PONTUACAO_MAXIMA,
    nivel_por_pontuacao,
)
from app.core.utils.diretrizes_loader import formatar_diretrizes_para_prompt


def _formatar_regua_de_pontuacao() -> str:
    """Monta o bloco de critérios/indicadores numerados que a IA deve pontuar."""
    blocos = []
    for indice, criterio in enumerate(CRITERIOS_DUA, start=1):
        indicadores = "\n".join(
            f"     {letra}) {texto}"
            for letra, texto in zip("abcde", criterio["indicadores"])
        )
        blocos.append(
            f"{indice}. chave: \"{criterio['chave']}\" — {criterio['titulo']}\n"
            f"   (máximo de {len(criterio['indicadores']) * PONTOS_POR_INDICADOR} pontos = "
            f"5 indicadores × {PONTOS_POR_INDICADOR})\n"
            f"{indicadores}"
        )
    return "\n\n".join(blocos)


def _formatar_escala_de_niveis() -> str:
    """Deixa explícita a correspondência entre nota e nível, para o texto não brigar com o número."""
    faixas = ((100, 75), (74, 50), (49, 25), (24, 0))
    return "\n".join(
        f"   - {minimo} a {maximo} pontos: {nivel_por_pontuacao(minimo)}"
        for maximo, minimo in faixas
    )


class AvaliacaoAcessibilidadeStrategy:
    def gerar_prompt(self, texto_material: str) -> str:
        return f"""Você é um avaliador especialista em Desenho Universal para a Aprendizagem (DUA) e em acessibilidade pedagógica.
Sua tarefa é AUDITAR o material didático abaixo e atribuir notas por critério, sempre com evidência textual.

--- MATERIAL DIDÁTICO (texto extraído) ---
\"\"\"
{texto_material}
\"\"\"

--- DIRETRIZES INSTITUCIONAIS DE EDUCAÇÃO ESPECIAL E DUA (SAEI) ---
{formatar_diretrizes_para_prompt()}

--- RÉGUA DE PONTUAÇÃO (OBRIGATÓRIA E IMUTÁVEL) ---
Cada critério tem 5 indicadores. Pontue CADA indicador apenas com um destes três valores:
   0 = ausente (o texto não traz nada que atenda ao indicador);
   3 = parcial/implícito (dá para inferir, mas o texto não explicita);
   5 = explícito e verificável no texto (há trecho que comprova).

{_formatar_regua_de_pontuacao()}

ESCALA DE NÍVEL (apenas para referência; o nível será calculado pela soma das notas):
{_formatar_escala_de_niveis()}

--- REGRAS ANTI-INCONSISTÊNCIA (VALEM MAIS QUE QUALQUER IMPRESSÃO GERAL) ---
R1. Julgue SOMENTE o que está escrito no material. Não presuma recursos, imagens, metodologias ou apoios que não aparecem no texto. Se não está escrito, o indicador vale 0.
R2. Prefira a nota 0 ou 5. Use 3 somente quando a evidência existir mas for incompleta ou indireta.
R3. Toda dimensão deve trazer o campo "evidencia": um trecho curto e literal do material OU a expressão exata "Ausente no texto".
R4. Aspectos puramente visuais (cor, fonte, tamanho, layout, imagens) NÃO são avaliáveis neste texto extraído. Não os penalize nem os elogie: avalie o que o texto permite.
R5. NÃO escreva veredito geral ("bem adaptado", "mal adaptado", "excelente", "precisa de revisão") dentro das listas. Cada item deve citar uma evidência específica e a seção correspondente (ex.: "Na seção 'Metodologia'...").
R6. Seja estável: o mesmo material deve receber a mesma nota. Não varie a avaliação por tipo de documento, tamanho do texto ou por impressão subjetiva.
R7. "pontos_positivos" deve listar de 0 a 4 evidências realmente presentes (só o que foi pontuado com 5). Se nada foi pontuado com 5, devolva a lista vazia.
R8. "pontos_de_melhoria" deve listar de 1 a 5 ações concretas, cada uma ligada a um indicador que recebeu 0 ou 3, dizendo o que reescrever e onde.
R9. "sugestao_imediata" deve ser UMA ação prática que o professor consegue aplicar antes da próxima aula, derivada do indicador de menor pontuação.

--- CONTRATO DE RESPOSTA ---
Responda EXCLUSIVAMENTE com um objeto JSON válido (sem markdown, sem comentários, sem texto fora do JSON), com esta estrutura exata:
{{
    "dimensoes": [
        {{
            "chave": "representacao",
            "score": 0,
            "evidencia": "trecho literal do material ou 'Ausente no texto'"
        }},
        {{
            "chave": "acao_e_expressao",
            "score": 0,
            "evidencia": "..."
        }},
        {{
            "chave": "engajamento",
            "score": 0,
            "evidencia": "..."
        }},
        {{
            "chave": "acessibilidade_do_formato",
            "score": 0,
            "evidencia": "..."
        }}
    ],
    "pontos_positivos": [
        "Na seção 'X': ..."
    ],
    "pontos_de_melhoria": [
        "Na seção 'X': ..."
    ],
    "sugestao_imediata": "..."
}}

Restrições numéricas:
- "dimensoes" deve conter exatamente as 4 chaves acima, cada uma uma única vez.
- "score" de cada dimensão é um INTEIRO de 0 a {PONTUACAO_MAXIMA // len(CRITERIOS_DUA)}, resultado da soma dos 5 indicadores.
- NÃO envie o campo "score_acessibilidade": a nota final ({PONTUACAO_MAXIMA} pontos) será calculada pela soma das quatro dimensões.
"""
