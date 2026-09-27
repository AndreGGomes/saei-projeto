# app/core/utils/search_helper.py
import logging
from ddgs import DDGS

logger = logging.getLogger(__name__)

def buscar_links_por_termos(termos: list[str]) -> list[str]:
    """
    Recebe termos de busca gerados pela IA e retorna o primeiro link real
    encontrado na internet para cada um.
    """
    links_reais = []
    if not termos:
        logger.info("Nenhum termo de busca foi fornecido pela IA.")
        return links_reais

    logger.info(f"Iniciando busca web para os termos: {termos}")

    try:
        with DDGS() as ddgs:
            for termo in termos:
                if not termo or not isinstance(termo, str):
                    continue
                
                # Busca simplificada
                resultados = list(ddgs.text(termo.strip(), max_results=1))
                if resultados and "href" in resultados[0]:
                    url_encontrada = resultados[0]["href"]
                    links_reais.append(url_encontrada)
                    logger.info(f"Link encontrado para '{termo}': {url_encontrada}")
                else:
                    logger.warning(f"Nenhum resultado encontrado no DuckDuckGo para o termo: '{termo}'")

    except Exception as e:
        logger.error(f"Erro ao realizar busca no DuckDuckGo: {e}", exc_info=True)

    return links_reais