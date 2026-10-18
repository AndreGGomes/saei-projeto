# Carregador utilitário das diretrizes institucionais de Educação Especial e DUA.
# Lê a base de conhecimento estática em JSON e armazena em memória (cache) para municiar os prompts da IA sem realizar leituras repetidas em disco.

import json
from functools import lru_cache
from pathlib import Path


# O decorador lru_cache(maxsize=1) garante que o arquivo seja lido e convertido do disco apenas na primeira vez em que a função for chamada.
# Nas chamadas seguintes, ele entrega o dicionário diretamente da memória RAM em microssegundos, poupando CPU e I/O do servidor.
@lru_cache(maxsize=1)
def obter_diretrizes_inclusao() -> dict:
    # Localiza o caminho absoluto da pasta raiz 'app' a partir deste próprio arquivo Python.
    # Isso evita falhas de FileNotFoundError, permitindo que a aplicação encontre o JSON independentemente de onde o Uvicorn ou os testes forem iniciados.
    pasta_app = Path(__file__).resolve().parent.parent.parent

    # Aponta para o arquivo de dados localizado em backend/app/data/diretrizes_inclusao.json
    caminho_arquivo = pasta_app / "data" / "diretrizes_inclusao.json"

    try:
        # Abre o arquivo em formato de leitura com codificação utf-8 para preservar acentuações da língua portuguesa
        with open(caminho_arquivo, "r", encoding="utf-8") as file:
            return json.load(file)

    # Tratamento defensivo: se o arquivo JSON for renomeado ou excluído acidentalmente, o erro é registrado no console e a função devolve um dicionário vazio.
    # Isso impede que exceções quebrem a inicialização ou gerem erro HTTP 500 em toda a API.
    except FileNotFoundError:
        print(f"Erro: O arquivo de diretrizes não foi encontrado no caminho: {caminho_arquivo}")
        return {}

    # Tratamento de integridade: caso alguém edite o JSON e esqueça uma vírgula ou chave, evita que a aplicação quebre durante o parse.
    except json.JSONDecodeError:
        print(f"Erro: O arquivo {caminho_arquivo} está corrompido ou não é um JSON válido.")
        return {}