# Responsabilidade única: consultar a web (DuckDuckGo) para transformar os tópicos de estudo sugeridos pela IA em links reais e navegáveis.
# Evita alucinações de URLs por parte da LLM, garantindo que o front-end receba apenas endereços verdadeiros da internet.

import logging
from ddgs import DDGS

logger = logging.getLogger(__name__)

def buscar_links_por_termos(termos: list[str]) -> list[str]:
    """
    Recebe os termos de busca sugeridos pela IA e pesquisa na web,
    retornando o primeiro link real encontrado para cada assunto.
    """
    links_reais = []

    # Se a IA não sugeriu termos de pesquisa, encerra na hora
    if not termos:
        logger.info("Nenhum termo de busca foi fornecido pela IA.")
        return links_reais

    logger.info(f"Iniciando busca web para os termos: {termos}")

    try:
        # Abre a sessão do DuckDuckGo para realizar as consultas
        with DDGS() as ddgs:
            for termo in termos:
                # Ignora termos vazios, nulos ou que não sejam texto válido
                if not termo or not isinstance(termo, str):
                    continue
                
                # Dispara a pesquisa limitando ao primeiro resultado mais relevante (max_results=1)
                resultados = list(ddgs.text(termo.strip(), max_results=1))

                # Se a busca retornou resultado e contém uma URL válida no campo 'href', armazena na lista final
                if resultados and "href" in resultados[0]:
                    url_encontrada = resultados[0]["href"]
                    links_reais.append(url_encontrada)
                    logger.info(f"Link encontrado para '{termo}': {url_encontrada}")
                else:
                    logger.warning(f"Nenhum resultado encontrado no DuckDuckGo para o termo: '{termo}'")

    except Exception as e:
        # Registra a falha no log sem interromper a execução da API nem quebrar a resposta do resumo
        logger.error(f"Erro ao realizar busca no DuckDuckGo: {e}", exc_info=True)

    # Devolve a lista de links reais para ser injetada no schema de resposta da IA
    return links_reais

def buscar_links_detalhados_por_termos(termos: list[str]) -> list[dict]:
    """
    Recebe termos de busca gerados pela IA e retorna uma lista de dicionários
    com 'titulo' e 'url' reais encontrados no DuckDuckGo.
    """
    links_recomendados = []
    if not termos:
        return links_recomendados

    logger.info(f"Iniciando busca detalhada no DuckDuckGo para: {termos}")

    try:
        with DDGS() as ddgs:
            for termo in termos:
                if not termo or not isinstance(termo, str):
                    continue
                
                resultados = list(ddgs.text(termo.strip(), max_results=1))
                if resultados and "href" in resultados[0]:
                    item = resultados[0]
                    links_recomendados.append({
                        "titulo": item.get("title", termo.strip()),
                        "url": item.get("href")
                    })
    except Exception as e:
        logger.error(f"Erro ao buscar links detalhados no DuckDuckGo: {e}", exc_info=True)

    return links_recomendados