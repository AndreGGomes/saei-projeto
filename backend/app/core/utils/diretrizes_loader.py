# saei-projeto/backend/app/core/utils/diretrizes_loader.py
import json
from functools import lru_cache
from pathlib import Path

@lru_cache(maxsize=1)
def obter_diretrizes_inclusao() -> dict:

    pasta_app = Path(__file__).resolve().parent.parent.parent

    caminho_arquivo = pasta_app / "data" / "diretrizes_inclusao.json"
    
    try:
        with open(caminho_arquivo, "r", encoding="utf-8") as file:
            return json.load(file)
            
    except FileNotFoundError:
        print(f"Erro: O arquivo de diretrizes não foi encontrado no caminho: {caminho_arquivo}")
        return {} # Retorna um dicionário vazio para evitar que a API inteira caia (HTTP 500)
        
    except json.JSONDecodeError:
        print(f"Erro: O arquivo {caminho_arquivo} está corrompido ou não é um JSON válido.")
        return {}