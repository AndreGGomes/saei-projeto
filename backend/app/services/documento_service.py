# Orquestra o ciclo de vida dos documentos: valida a matrícula, delega as regras de permissão
# à DocumentoPolicy, delega o disco ao ArquivoStorage e cuida do resumo com IA.

from pathlib import Path

from fastapi import UploadFile

from app.core.utils.search_helper import buscar_links_por_termos
from app.models import Usuario, Documento, TipoDocumento
from app.repositories.documento_repository import DocumentoRepository
from app.repositories.matricula_repository import MatriculaRepository
from app.schemas.documento_schemas import MatriculaDocumentosResponse, DocumentoResponse, ResumoIAResponse
from app.core.exceptions import (
    PermissaoNegadaError,
    RecursoNaoEncontradoError
)
from app.core.utils.arquivo_storage import ArquivoStorage
from app.core.utils.pdf_extractor import PDFExtractor
from app.services.ia.ia_client import GroqClient
from app.services.ia.resumo_strategies import ResumoStrategyFactory
from app.services.documento_permissions import DocumentoPolicy

class DocumentoService:
    def __init__(
        self, 
        documento_repo: DocumentoRepository, 
        matricula_repo: MatriculaRepository,
        policy: DocumentoPolicy,
        pdf_extractor: PDFExtractor,
        ia_client: GroqClient,
        storage: ArquivoStorage
    ):
        self.documento_repo = documento_repo
        self.matricula_repo = matricula_repo
        self.policy = policy
        self.pdf_extractor = pdf_extractor
        self.ia_client = ia_client
        self.storage = storage

    # --- 1. UPLOAD DE DOCUMENTO ---
    def salvar_documento(
        self, 
        matricula_id: int, 
        titulo: str, 
        tipo: TipoDocumento, 
        arquivo: UploadFile, 
        usuario_logado: Usuario
    ) -> Documento:
        # Busca a matrícula no banco
        matricula = self.matricula_repo.buscar_por_id(matricula_id)
        if not matricula:
            raise RecursoNaoEncontradoError(f"Matrícula com ID '{matricula_id}' não encontrada.")

        # Regra de Apenas o Aluno da matrícula pode enviar pro Professor / apenas o Professor pro Aluno
        self.policy.exigir_envio_permitido(usuario_logado, matricula)

        # Grava o arquivo físico no disco com nome único
        caminho_destino = self.storage.salvar_upload(arquivo)

        # Cria a entidade Documento e registra no banco
        novo_documento = Documento(
            titulo=titulo.strip(),
            tipo=tipo,
            caminho_arquivo=caminho_destino,
            matricula_id=matricula.id,
            remetente_id=usuario_logado.id
        )

        return self.documento_repo.salvar(novo_documento)

    # --- 2. LISTAGEM EM DUAS LISTAS POR MATRÍCULA ---
    def listar_documentos_matricula(
        self, 
        matricula_id: int, 
        usuario_logado: Usuario
    ) -> MatriculaDocumentosResponse:
        matricula = self.matricula_repo.buscar_por_id(matricula_id)
        if not matricula:
            raise RecursoNaoEncontradoError(f"Matrícula com ID '{matricula_id}' não encontrada.")

        # Regra de Acesso: Aluno da matrícula, Professor da matrícula e Coordenadores
        if not self.policy.pode_visualizar_matricula(usuario_logado, matricula):
            raise PermissaoNegadaError("Você não tem permissão para visualizar os documentos desta matrícula.")

        documentos = self.documento_repo.listar_por_matricula(matricula_id)

        # Separa exatamente nas duas listas
        enviados_aluno = []
        enviados_professor = []

        for doc in documentos:
            doc_schema = DocumentoResponse.model_validate(doc)
            if doc.remetente_id == matricula.aluno_id:
                enviados_aluno.append(doc_schema)
            elif doc.remetente_id == matricula.professor_id:
                enviados_professor.append(doc_schema)

        return MatriculaDocumentosResponse(
            matricula_id=matricula.id,
            enviados_pelo_aluno=enviados_aluno,
            enviados_pelo_professor=enviados_professor
        )

    # --- 3. DOWNLOAD DE DOCUMENTO ---
    def obter_documento_para_download(
        self, 
        documento_id: int, 
        usuario_logado: Usuario
    ) -> tuple[str, str]:
        """
        Valida a segurança e retorna (caminho_fisico, nome_sugerido_para_download).
        """
        documento = self.documento_repo.buscar_por_id(documento_id)
        if not documento:
            raise RecursoNaoEncontradoError(f"Documento com ID '{documento_id}' não encontrado.")

        matricula = documento.matricula
        if not matricula:
            raise RecursoNaoEncontradoError("Matrícula associada a este documento não foi localizada.")

        # Confere se o usuário logado tem permissão para baixar este documento
        if not self.policy.pode_baixar(usuario_logado, matricula):
            raise PermissaoNegadaError("Você não tem permissão para baixar este documento.")

        if not Path(documento.caminho_arquivo).exists():
            raise RecursoNaoEncontradoError("Arquivo físico não foi encontrado no servidor.")

        # Monta um nome amigável para o arquivo baixado
        extensao = Path(documento.caminho_arquivo).suffix
        nome_download = f"{documento.titulo}{extensao}"

        return documento.caminho_arquivo, nome_download

    # --- 4. DELETAR DOCUMENTOS ---
    def deletar_documento(self, documento_id: int, usuario_logado: Usuario):
        documento = self.documento_repo.buscar_por_id(documento_id)
        if not documento:
            raise RecursoNaoEncontradoError(f"Documento com ID '{documento_id}' não encontrado.")

        # Só quem enviou o documento ou o Coordenador pode apagá-lo
        if not self.policy.pode_excluir(usuario_logado, documento):
            raise PermissaoNegadaError("Você não tem permissão para excluir este documento.")

        # Remove o arquivo físico (se existir) e o registro do banco
        self.storage.remover(documento.caminho_arquivo)
        self.documento_repo.deletar(documento)

    # --- 5. RESUMO COM IA ---
    def gerar_resumo(self, documento_id: int, usuario_logado: Usuario) -> ResumoIAResponse:
        documento = self.documento_repo.buscar_por_id(documento_id)
        if not documento:
            raise RecursoNaoEncontradoError("Documento não encontrado.")

        # Valida se quem está logado tem direito de ler o resumo
        if not self.policy.pode_acessar_resumo(documento, usuario_logado):
            raise PermissaoNegadaError("Você não tem permissão para acessar o resumo deste documento.")

        # Abre o arquivo PDF no disco e extrai todo o conteúdo de texto legível
        texto_cru = self.pdf_extractor.extrair_texto(documento.caminho_arquivo)
        if not texto_cru:
            raise ValueError("O documento está vazio ou é ilegível.")

        # Escolhe a estratégia correta e monta o prompt específico para o tipo de documento
        estrategia = ResumoStrategyFactory.get_strategy(documento.tipo)
        prompt = estrategia.gerar_prompt(texto_cru)

        # Envia o prompt para a API da Groq e recebe a resposta padronizada em formato JSON
        dados_ia = self.ia_client.processar_resumo_estruturado(prompt)

        # Se a IA sugeriu termos de estudo, faz buscas reais no DuckDuckGo para pegar links verdadeiros
        termos = dados_ia.termos_busca
        links_reais = buscar_links_por_termos(termos) if termos else []

        # Monta o contrato final devolvendo os pontos-chave, recomendações e links reais para o front-end
        return ResumoIAResponse(
            titulo_documento=dados_ia.titulo_documento,
            resumo_geral=dados_ia.resumo_geral,
            pontos_chave=dados_ia.pontos_chave,
            proximos_passos_ou_recomendacoes=dados_ia.proximos_passos_ou_recomendacoes,
            links_estudo=links_reais,
            aviso_ia=dados_ia.aviso_ia
        )
