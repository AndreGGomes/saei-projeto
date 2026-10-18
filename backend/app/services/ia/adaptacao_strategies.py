from abc import ABC, abstractmethod
from app.models import TipoDocumento
from app.core.utils.diretrizes_loader import obter_diretrizes_inclusao

class BaseAdaptacaoStrategy(ABC):

    @abstractmethod
    def gerar_prompt(self, texto_material: str, resumo_laudo: str, diretrizes_inclusao: str) -> str:
        pass

    @abstractmethod
    def _obter_instrucao_focal(self) -> str:
        pass

    def _obter_instrucao_json(self) -> str:
        return """
        ATENÇÃO: Você deve responder EXCLUSIVAMENTE em formato JSON válido, seguindo esta estrutura exata:
        {
            "mudancas_sugeridas": [
                "Na seção [Nome da Seção do Texto original]: [Ação concreta e específica]",
                "Sobre o uso de [Recurso citado no texto]: [Ação de adaptação]"
            ],
            "justificativa_inclusiva": "Um parágrafo único e direto explicando o embasamento inclusivo das mudanças propostas.",
            "dicas_de_abordagem": [
                "Dica prática de mediação 1",
                "Dica prática de mediação 2"
            ]
        }
        Não inclua markdown como ```json ou qualquer outro texto fora do JSON.
        """

    def _obter_diretrizes_institucionais(self) -> str:
        diretrizes = obter_diretrizes_inclusao()
        if not diretrizes:
            return "Nenhuma diretriz institucional disponível."
        linhas = [f"- {chave}: {texto}" for chave, texto in diretrizes.items()]
        return "\n".join(linhas)

    def montar_prompt(self, texto_material: str, resumo_laudo: str, diretrizes_inclusao: str) -> str:
        return f"""Você é um especialista em pedagogia inclusiva e Desenho Universal de Aprendizagem (DUA).
Sua missão é adaptar o material pedagógico abaixo para um estudante com Necessidades Educacionais Específicas (NEE).

REGRAS DE OURO (REJEIÇÃO DE ALUCINAÇÃO):
1. ESTRITAMENTE BASEADO NO TEXTO: É PROIBIDO inventar aulas, temas, exercícios ou dinâmicas que não estejam expressamente escritos no documento original.
2. ANCORAGEM: Toda mudança sugerida deve citar a parte exata do texto que está sendo alterada (ex: "Na seção 'Metodologia'...", "No '3º Bimestre'...").
3. ADAPTAÇÃO DE ESCALA: Se o texto for um plano macro (ex: ementa anual, plano de curso), adapte as regras gerais de avaliação e metodologia apresentadas. Se for um plano micro (uma única aula), adapte o ritmo e a dinâmica de sala.

--- CONTEXTO CLÍNICO DO ESTUDANTE (RESUMO DO LAUDO) ---
{resumo_laudo}

--- DIRETRIZES DE INCLUSÃO INFORMADAS (PELO COORDENADOR/PROFESSOR) ---
{diretrizes_inclusao}

--- DIRETRIZES INSTITUCIONAIS DE EDUCAÇÃO ESPECIAL E DUA (SAEI) ---
{self._obter_diretrizes_institucionais()}

--- INSTRUÇÃO FOCAL PARA ESTE TIPO DE DOCUMENTO ---
{self._obter_instrucao_focal()}

--- CONTRATO DE RESPOSTA ---
Produza os campos do JSON conforme exigido.
Em 'mudancas_sugeridas', forneça de 3 a 5 ações acionáveis e inconfundivelmente ligadas aos tópicos do texto.

{self._obter_instrucao_json()}

--- MATERIAL A SER ADAPTADO ---
{texto_material}"""

class AdaptacaoPlanoAulaStrategy(BaseAdaptacaoStrategy):

    def _obter_instrucao_focal(self) -> str:
        return (
            "Foque em adaptar a METODOLOGIA, os RECURSOS e a AVALIAÇÃO presentes no texto. "
            "Traduza as estratégias de ensino originais para formatos inclusivos. "
            "Se o documento citar avaliações somativas ou contínuas, sugira fracionamento ou formatos alternativos de entrega. "
            "Se citar ferramentas práticas (laboratórios, softwares, projetos em grupo), indique como mediar a participação do estudante específico nelas. "
            "Não altere a ementa ou os objetos de conhecimento (a BNCC deve ser mantida); altere apenas o formato de entrega e cobrança."
        )

    def gerar_prompt(self, texto_material: str, resumo_laudo: str, diretrizes_inclusao: str) -> str:
        return self.montar_prompt(texto_material, resumo_laudo, diretrizes_inclusao)

class AdaptacaoAtividadeStrategy(BaseAdaptacaoStrategy):

    def _obter_instrucao_focal(self) -> str:
        return (
            "Foque na ESTRUTURA DO EXERCÍCIO. "
            "Sugira mudanças concretas na formatação do enunciado, quebra de comandos longos em etapas curtas, "
            "substituição de vocabulário abstrato por concreto, e adaptação dos critérios de avaliação da tarefa. "
            "Indique exatamente qual questão ou parágrafo do documento precisa de intervenção (ex: 'Na Questão 2, altere o formato para...')."
        )

    def gerar_prompt(self, texto_material: str, resumo_laudo: str, diretrizes_inclusao: str) -> str:
        return self.montar_prompt(texto_material, resumo_laudo, diretrizes_inclusao)
# Fábrica de estratégias: seleciona em tempo de execução a regra adequada a partir do enum TipoDocumento
class AdaptacaoStrategyFactory:

    # Mapeia o tipo do documento para a respectiva estratégia instanciada.
    # Materiais diversos (OUTROS e afins) caem no foco de plano de aula, cuja lógica de
    # dinâmica de sala se aplica ao material didático genérico.
    @staticmethod
    def get_strategy(tipo_documento: TipoDocumento) -> BaseAdaptacaoStrategy:
        estrategias = {
            TipoDocumento.PLANO_DE_AULA: AdaptacaoPlanoAulaStrategy(),
            TipoDocumento.ATIVIDADE: AdaptacaoAtividadeStrategy(),
        }
        return estrategias.get(tipo_documento, AdaptacaoPlanoAulaStrategy())
