# app/services/ia/ia_client.py
import os
from groq import Groq
from app.schemas.documento_schemas import IAResumoInternal

class GroqClient:
    def __init__(self):
        # A chave é lida de forma lazy: só a geração de resumo depende da Groq.
        # Instanciar o cliente aqui quebraria as demais rotas de documentos em ambientes sem a chave.
        self._api_key = os.getenv("GROQ_API_KEY")

    def processar_resumo_estruturado(self, prompt: str) -> IAResumoInternal:
        """Envia o prompt para a Groq e converte a resposta JSON para o schema Pydantic."""
        if not self._api_key:
            raise RuntimeError("GROQ_API_KEY não configurada no ambiente.")

        try:
            self.client = Groq(api_key=self._api_key)
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                # O Llama 3.3 de 70B é o melhor modelo atual na Groq para seguir estruturas JSON
                model="qwen/qwen3.8-27b",
                response_format={"type": "json_object"}
            )
            
            conteudo = chat_completion.choices[0].message.content
            
            # Valida e converte a string JSON diretamente para o modelo Pydantic
            return IAResumoInternal.model_validate_json(conteudo)
            
        except Exception as e:
            raise RuntimeError(f"Falha ao processar dados com a IA: {str(e)}")