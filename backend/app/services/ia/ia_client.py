# app/services/ia/ia_client.py
import os
from groq import Groq
from app.schemas.documento_schemas import IAResumoInternal
from app.models import TipoDocumento
from app.services.ia.resumo_strategies import ResumoStrategyFactory

class GroqClient:
    def __init__(self):
        self._api_key = os.getenv("GROQ_API_KEY")
        self._client = None

    def _get_client(self) -> Groq:
        """Inicializa o cliente da Groq de forma lazy (Apenas quando for realmente usado)."""
        if not self._api_key:
            raise RuntimeError("GROQ_API_KEY não configurada no ambiente.")
        
        if not self._client:
            self._client = Groq(api_key=self._api_key)
            
        return self._client

    def _enviar_prompt(self, prompt: str, response_format: str = "json_object") -> str:
        """Método central para conversar com a IA. Pode ser reutilizado por qualquer outro método."""
        try:
            client = self._get_client()
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="qwen/qwen3.8-27b",
                response_format={"type": response_format}
            )
            
            return chat_completion.choices[0].message.content
            
        except Exception as e:
            # Aqui você pode logar o erro num Sentry ou logger da aplicação no futuro
            raise RuntimeError(f"Falha na comunicação com a API da IA: {str(e)}")

    # --- Métodos Públicos (Casos de Uso) ---

    def processar_resumo_estruturado(self, texto: str, tipo_documento: TipoDocumento) -> IAResumoInternal:
        """Gera o prompt de resumo e converte a resposta JSON para o schema Pydantic."""
        estrategia = ResumoStrategyFactory.get_strategy(tipo_documento)
        prompt = estrategia.gerar_prompt(texto)

        # Chama o método privado genérico
        conteudo_json_str = self._enviar_prompt(prompt, response_format="json_object")
        
        # Valida e converte a string JSON diretamente para o modelo
        return IAResumoInternal.model_validate_json(conteudo_json_str)

    # Exemplo de como seria fácil adicionar novas funcionalidades no futuro:
    # def gerar_quiz(self, texto: str) -> IAQuizInternal:
    #     prompt = f"Gere 5 perguntas sobre: {texto}"
    #     resultado = self._enviar_prompt(prompt)
    #     return IAQuizInternal.model_validate_json(resultado)