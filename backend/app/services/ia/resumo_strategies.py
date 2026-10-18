# Define a estratégia de sumarização por inteligência artificial para cada tipo de documento anexado.
# Garante que cada categoria (laudo médico, plano de aula ou atividade) receba instruções e restrições éticas adequadas, exigindo retorno estruturado em JSON para validação no Pydantic.

from abc import ABC, abstractmethod
from app.models import TipoDocumento

# Classe base abstrata: define o contrato que toda estratégia de prompt deve seguir e centraliza o formato JSON exigido
class BaseResumoStrategy(ABC):

    # Método abstrato: cada estratégia filha deve implementar sua própria montagem de instrução e documento
    @abstractmethod
    def gerar_prompt(self, texto_extraido: str) -> str:
        pass

    # Estrutura JSON obrigatória compartilhada por todos os prompts para garantir compatibilidade com o schema IAResumoInternal
    def _obter_instrucao_json(self) -> str:
        return """
        ATENÇÃO: Você deve responder EXCLUSIVAMENTE em formato JSON válido, seguindo esta estrutura exata:
        {
            "titulo_documento": "Um título curto para o documento",
            "resumo_geral": "O resumo principal do texto",
            "pontos_chave": ["Ponto 1", "Ponto 2", "Ponto 3"],
            "proximos_passos_ou_recomendacoes": "O que deve ser feito a partir daqui (se aplicável)",
            "termos_busca": ["Tópico Principal 1 Khan Academy", "Tópico Principal 2 Brasil Escola"],
            "aviso_ia": "Preencha SEMPRE com este texto exato: 'Aviso: Este resumo foi gerado por Inteligência Artificial e pode não ser 100% preciso. Consulte o documento original.'"
        }
        Não inclua markdown como ```json ou qualquer outro texto fora do JSON.
        Se o documento for um laudo médico ou não houver tópicos acadêmicos para estudo, retorne [] no campo 'termos_busca'.
        """


# Estratégia restritiva para laudos médicos: impede alucinações diagnósticas e veda busca web externa sobre saúde
class LaudoMedicoStrategy(BaseResumoStrategy):

    # Monta prompt focado em fatos clínicos literais descritos pelo profissional, sem deduções próprias da IA
    def gerar_prompt(self, texto_extraido: str) -> str:
        instrucao = (
            "Analise o laudo médico abaixo. O seu objetivo é APENAS RESUMIR os fatos médicos e o diagnóstico apresentados. "
            "É ESTRITAMENTE PROIBIDO criar, deduzir ou sugerir recomendações próprias. "
            "No campo 'proximos_passos_ou_recomendacoes', insira APENAS o que o médico recomendou expressamente no texto. "
            "Se o médico não escreveu nenhuma recomendação, preencha o campo com: 'Nenhuma recomendação médica explícita no laudo.' "
            "No campo 'termos_busca', retorne SEMPRE uma lista vazia []."
        )
        return f"{instrucao}\n{self._obter_instrucao_json()}\nDOCUMENTO:\n{texto_extraido}"


# Estratégia para planos de aula: resume metas didáticas e extrai conceitos pedagógicos para pesquisa
class PlanoAulaStrategy(BaseResumoStrategy):

    # Monta prompt orientado à metodologia e objetivos, gerando termos de busca para reforço de conteúdo
    def gerar_prompt(self, texto_extraido: str) -> str:
        instrucao = (
            "Analise o plano de aula abaixo. Foque em resumir os objetivos principais, "
            "a metodologia de ensino e como o aluno será avaliado. "
            "No campo 'termos_busca', extraia de 2 a 3 termos de pesquisa focados nos temas centrais da aula para recomendação de estudo."
        )
        return f"{instrucao}\n{self._obter_instrucao_json()}\nDOCUMENTO:\n{texto_extraido}"


# Estratégia para atividades escolares: sintetiza os exercícios e direciona termos para plataformas educativas
class AtividadeStrategy(BaseResumoStrategy):

    # Monta prompt com foco conceitual, obrigando a criação de termos de apoio escolar (Khan Academy, Brasil Escola)
    def gerar_prompt(self, texto_extraido: str) -> str:
        instrucao = (
            "Analise a atividade escolar abaixo. "
            "Faça um breve resumo dos conteúdos e conceitos principais abordados. "
            "No campo 'termos_busca', extraia OBRIGATORIAMENTE de 2 a 3 termos de busca curtos e diretos sobre os assuntos centrais "
            "(exemplo: ['Equação de 2 grau Khan Academy', 'Fotossintese Brasil Escola'])."
        )
        return f"{instrucao}\n{self._obter_instrucao_json()}\nDOCUMENTO:\n{texto_extraido}"


# Estratégia padrão de contingência: atende arquivos classificados como OUTROS ou sem categoria mapeada
class DefaultResumoStrategy(BaseResumoStrategy):

    # Monta prompt genérico com análise objetiva do texto
    def gerar_prompt(self, texto_extraido: str) -> str:
        instrucao = (
            "Faça um resumo analítico e objetivo do documento abaixo. "
            "No campo 'termos_busca', extraia de 1 a 3 termos principais caso seja um documento educativo."
        )
        return f"{instrucao}\n{self._obter_instrucao_json()}\nDOCUMENTO:\n{texto_extraido}"


# Fábrica de estratégias: seleciona em tempo de execução a regra adequada a partir do enum TipoDocumento
class ResumoStrategyFactory:

    # Mapeia o tipo do documento para a respectiva estratégia instanciada, usando DefaultResumoStrategy como fallback
    @staticmethod
    def get_strategy(tipo_documento: TipoDocumento) -> BaseResumoStrategy:
        estrategias = {
            TipoDocumento.LAUDO_MEDICO: LaudoMedicoStrategy(),
            TipoDocumento.PLANO_DE_AULA: PlanoAulaStrategy(),
            TipoDocumento.ATIVIDADE: AtividadeStrategy(),
        }
        return estrategias.get(tipo_documento, DefaultResumoStrategy())