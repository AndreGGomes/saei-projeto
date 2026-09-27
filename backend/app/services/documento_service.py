# app/services/documento_service.py
from app.repositories.documento_repository import DocumentoRepository
from app.core.utils.pdf_extractor import PDFExtractor
from app.services.ia.ia_client import GeminiClient
from app.services.ia.resumo_strategies import ResumoStrategyFactory
from app.schemas.documento_schemas import ResumoIAResponse
from app.services.documento_permissions import DocumentoPolicy # <-- Novo import
from app.models import Usuario

class PermissionError(Exception):
    pass

class DocumentoService:
    def __init__(
        self, 
        repo: DocumentoRepository, 
        policy: DocumentoPolicy,
        pdf_extractor: PDFExtractor,
        ia_client: GeminiClient
    ):
        self.repo = repo
        self.policy = policy
        self.pdf_extractor = pdf_extractor
        self.ia_client = ia_client

    def gerar_resumo(self, documento_id: int, usuario_logado: Usuario) -> ResumoIAResponse:
        documento = self.repo.buscar_por_id(documento_id)
        if not documento:
            raise ValueError("Documento não encontrado.")

        if not self.policy.pode_acessar_resumo(documento, usuario_logado):
            raise PermissionError("Você não tem permissão para acessar o resumo deste documento.")

        texto_cru = self.pdf_extractor.extrair_texto(documento.caminho_arquivo)
        if not texto_cru:
            raise ValueError("O documento está vazio ou é ilegível.")

        estrategia = ResumoStrategyFactory.get_strategy(documento.tipo)
        prompt = estrategia.gerar_prompt(texto_cru)
        
        return self.ia_client.processar_resumo_estruturado(prompt)