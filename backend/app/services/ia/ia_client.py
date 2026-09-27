# app/services/ia/ia_client.py
import os
from groq import Groq
from app.schemas.documento_schemas import IAResumoInternal

class GroqClient:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY não configurada no ambiente.")
        
        self.client = Groq(api_key=api_key)

    def processar_resumo_estruturado(self, prompt: str) -> IAResumoInternal:
        """Envia o prompt para a Groq e converte a resposta JSON para o schema Pydantic."""
        try:
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