# app/services/ia/resumo_strategies.py
from abc import ABC, abstractmethod
from app.models import TipoDocumento

class BaseResumoStrategy(ABC):
    @abstractmethod
    def gerar_prompt(self, texto_extraido: str) -> str:
        pass
        
    def _obter_instrucao_json(self) -> str:
        return """
        ATENÇÃO: Você deve responder EXCLUSIVAMENTE em formato JSON válido, seguindo esta estrutura exata:
        {
            "titulo_documento": "Um título curto para o documento",
            "resumo_geral": "O resumo principal do texto",
            "pontos_chave": ["Ponto 1", "Ponto 2", "Ponto 3"],
            "proximos_passos_ou_recomendacoes": "O que deve be feito a partir daqui (se aplicável)",
            "termos_busca": ["Tópico Principal 1 Khan Academy", "Tópico Principal 2 Brasil Escola"],
            "aviso_ia": "Preencha SEMPRE com este texto exato: 'Aviso: Este resumo foi gerado por Inteligência Artificial e pode não ser 100% preciso. Consulte o documento original.'"
        }
        Não inclua markdown como ```json ou qualquer outro texto fora do JSON.
        Se o documento for um laudo médico ou não houver tópicos acadêmicos para estudo, retorne [] no campo 'termos_busca'.
        """

class LaudoMedicoStrategy(BaseResumoStrategy):
    def gerar_prompt(self, texto_extraido: str) -> str:
        instrucao = (
            "Analise o laudo médico abaixo. O seu objetivo é APENAS RESUMIR os fatos médicos e o diagnóstico apresentados. "
            "É ESTRITAMENTE PROIBIDO criar, deduzir ou sugerir recomendações próprias. "
            "No campo 'proximos_passos_ou_recomendacoes', insira APENAS o que o médico recomendou expressamente no texto. "
            "Se o médico não escreveu nenhuma recomendação, preencha o campo com: 'Nenhuma recomendação médica explícita no laudo.' "
            "No campo 'termos_busca', retorne SEMPRE uma lista vazia []."
        )
        return f"{instrucao}\n{self._obter_instrucao_json()}\nDOCUMENTO:\n{texto_extraido}"

class PlanoAulaStrategy(BaseResumoStrategy):
    def gerar_prompt(self, texto_extraido: str) -> str:
        instrucao = (
            "Analise o plano de aula abaixo. Foque em resumir os objetivos principais, "
            "a metodologia de ensino e como o aluno será avaliado. "
            "No campo 'termos_busca', extraia de 2 a 3 termos de pesquisa focados nos temas centrais da aula para recomendação de estudo."
        )
        return f"{instrucao}\n{self._obter_instrucao_json()}\nDOCUMENTO:\n{texto_extraido}"

class AtividadeStrategy(BaseResumoStrategy):
    def gerar_prompt(self, texto_extraido: str) -> str:
        instrucao = (
            "Analise a atividade escolar abaixo. "
            "Faça um breve resumo dos conteúdos e conceitos principais abordados. "
            "No campo 'termos_busca', extraia OBRIGATORIAMENTE de 2 a 3 termos de busca curtos e diretos sobre os assuntos centrais "
            "(exemplo: ['Equação de 2 grau Khan Academy', 'Fotossintese Brasil Escola'])."
        )
        return f"{instrucao}\n{self._obter_instrucao_json()}\nDOCUMENTO:\n{texto_extraido}"

class DefaultResumoStrategy(BaseResumoStrategy):
    def gerar_prompt(self, texto_extraido: str) -> str:
        instrucao = (
            "Faça um resumo analítico e objetivo do documento abaixo. "
            "No campo 'termos_busca', extraia de 1 a 3 termos principais caso seja um documento educativo."
        )
        return f"{instrucao}\n{self._obter_instrucao_json()}\nDOCUMENTO:\n{texto_extraido}"

class ResumoStrategyFactory:
    @staticmethod
    def get_strategy(tipo_documento: TipoDocumento) -> BaseResumoStrategy:
        estrategias = {
            TipoDocumento.LAUDO_MEDICO: LaudoMedicoStrategy(),
            TipoDocumento.PLANO_DE_AULA: PlanoAulaStrategy(),
            TipoDocumento.ATIVIDADE: AtividadeStrategy(),
        }
        return estrategias.get(tipo_documento, DefaultResumoStrategy())