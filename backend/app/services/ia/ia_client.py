# Cliente de integração com a API da Groq para processamento de IA.
# Encapsula as chamadas aos modelos de linguagem (LLM), utilizando carregamento preguiçoso (lazy loading)
# para evitar que a aplicação quebre no boot se a chave de API não estiver configurada no ambiente.

import os
from groq import Groq
from app.schemas.documento_schemas import IAResumoInternal
from app.schemas.ia_schemas import IATutorAlunoInternal
from app.models import TipoDocumento
from app.services.ia.resumo_strategies import ResumoStrategyFactory

class GroqClient:
    def __init__(self):
        # Apenas lê a chave das variáveis de ambiente na inicialização sem instanciar o cliente de imediato.
        # Isso impede que o servidor caia ao subir caso a chave não esteja presente em testes ou migrações.
        self._api_key = os.getenv("GROQ_API_KEY")
        self._client = None

    def _get_client(self) -> Groq:
        """Inicializa e devolve a instância do cliente Groq sob demanda (Lazy Loading)."""
        # Se a chave não existir no ambiente no momento em que a rota de IA for acionada, estoura o erro.
        if not self._api_key:
            raise RuntimeError("GROQ_API_KEY não configurada no ambiente.")
        
        # Cria a conexão com a SDK da Groq apenas na primeira utilização e reutiliza nas chamadas seguintes.
        if not self._client:
            self._client = Groq(api_key=self._api_key)
            
        return self._client

    def _enviar_prompt(self, prompt: str, response_format: str = "json_object") -> str:
        """Centraliza o envio de mensagens para o modelo de linguagem e devolve a resposta em texto bruto."""
        try:
            # Obtém a conexão ativa com a Groq
            client = self._get_client()
            
            # Dispara a requisição de inferência configurando a saída estrita no formato especificado (JSON)
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                # Modelo de alto desempenho para seguir contratos e estruturas de dados rígidas
                model="qwen/qwen3.8-27b",
                response_format={"type": response_format}
            )
            
            # Retorna apenas o corpo textual gerado pelo modelo
            return chat_completion.choices[0].message.content
            
        except Exception as e:
            # Captura falhas de conexão, limites de cota ou indisponibilidade da API externa e encapsula em RuntimeError
            raise RuntimeError(f"Falha na comunicação com a API da IA: {str(e)}")

    # --- Métodos Públicos (Casos de Uso) ---

    def processar_resumo_estruturado(self, texto: str, tipo_documento: TipoDocumento) -> IAResumoInternal:
        """Monta o prompt conforme as regras do tipo do documento, dispara para a IA e valida o retorno no schema Pydantic."""
        # 1. Seleciona a estratégia adequada (laudo médico, atividade ou plano de aula) para construir as instruções
        estrategia = ResumoStrategyFactory.get_strategy(tipo_documento)
        prompt = estrategia.gerar_prompt(texto)

        # 2. Envia as instruções e o texto extraído para a Groq exigindo um objeto JSON válido
        conteudo_json_str = self._enviar_prompt(prompt, response_format="json_object")
        
        # 3. Converte a string JSON recebida diretamente para o schema Pydantic garantindo tipagem e validação dos campos
        return IAResumoInternal.model_validate_json(conteudo_json_str)

    def gerar_tutoria_aluno(
        self, 
        texto_atividade: str, 
        resumo_laudo: str, 
        preferencias_aluno: str
    ) -> IATutorAlunoInternal:
        """Gera a explicação personalizada da atividade para o aluno e valida no schema interno."""
        prompt = f"""
        Você é um professor particular especialista em educação inclusiva.
        Explique o assunto da atividade abaixo para um aluno com o seguinte contexto:
        - Laudo / Condição: {resumo_laudo}
        - Preferências de Aprendizagem: {preferencias_aluno}

        Adapte sua linguagem, didática e formato de explicação para respeitar o laudo e atender às preferências do estudante.
        Não invente links ou URLs. No campo 'termos_busca_duckduckgo', forneça de 2 a 3 termos de pesquisa precisos para encontrar vídeos ou artigos reais sobre o tema.

        ATENÇÃO: Responda EXCLUSIVAMENTE em formato JSON válido, seguindo exatamente esta estrutura:
        {{
            "explicacao_pedagogica": "Explicação clara, acolhedora e adaptada sobre o tema da atividade...",
            "passo_a_passo_resolucao": [
                "Passo 1: ...",
                "Passo 2: ...",
                "Passo 3: ..."
            ],
            "termos_busca_duckduckgo": [
                "Termo de busca 1",
                "Termo de busca 2"
            ]
        }}

        ATIVIDADE:
        {texto_atividade}
        """

        try:
            self.client = Groq(api_key=self._api_key)
            chat_completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="qwen/qwen3.8-27b",
                response_format={"type": "json_object"}
            )
            conteudo = chat_completion.choices[0].message.content
            return IATutorAlunoInternal.model_validate_json(conteudo)
        except Exception as e:
            raise RuntimeError(f"Falha ao gerar tutoria com a IA: {str(e)}")