# app/services/ia/ia_client.py
import os
from google import genai
from app.schemas.documento_schemas import ResumoIAResponse

class GeminiClient:
    def __init__(self):
        # A verificação é mantida para garantir um erro claro caso falte a variável
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY não configurada no ambiente.")
        
        # Inicializa o client seguindo o novo padrão da Interactions API
        # Ele puxa automaticamente a variável de ambiente GEMINI_API_KEY
        self.client = genai.Client()

    def processar_resumo_estruturado(self, prompt: str) -> ResumoIAResponse:
        """Envia o prompt para a IA e converte a resposta JSON para o schema Pydantic."""
        try:
            # Envia a requisição usando interations.create e passa o schema do Pydantic
            interaction = self.client.interactions.create(
                model="gemini-3.8-flash",
                input=prompt,
                response_format={
                    "type": "text",
                    "mime_type": "application/json",
                    "schema": ResumoIAResponse.model_json_schema()
                }
            )
            
            # Valida e converte o texto retornado diretamente para o Pydantic Schema
            return ResumoIAResponse.model_validate_json(interaction.output_text)
            
        except Exception as e:
            raise RuntimeError(f"Falha ao processar dados com a IA: {str(e)}")