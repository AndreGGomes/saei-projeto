# app/services/documento_service.py
import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile

from app.core.utils.search_helper import buscar_links_por_termos
from app.models import Usuario, UserRole, Documento, TipoDocumento
from app.repositories.documento_repository import DocumentoRepository
from app.repositories.matricula_repository import MatriculaRepository
from app.schemas.documento_schemas import MatriculaDocumentosResponse, DocumentoResponse, ResumoIAResponse
from app.core.exceptions import (
    PermissaoNegadaError,
    RecursoNaoEncontradoError
)
from app.core.utils.pdf_extractor import PDFExtractor
from app.services.ia.ia_client import GroqClient
from app.services.ia.resumo_strategies import ResumoStrategyFactory
from app.services.documento_permissions import DocumentoPolicy

# Diretório base onde os arquivos reais serão armazenados
UPLOAD_DIR = Path("uploads")

class DocumentoService:
    def __init__(
        self, 
        documento_repo: DocumentoRepository, 
        matricula_repo: MatriculaRepository,
        policy: DocumentoPolicy,
        pdf_extractor: PDFExtractor,
        ia_client: GroqClient
    ):
        self.documento_repo = documento_repo
        self.matricula_repo = matricula_repo
        self.policy = policy
        self.pdf_extractor = pdf_extractor
        self.ia_client = ia_client
        
        # Garante que a pasta física de uploads exista no servidor
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

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

        # Apenas o Aluno da matrícula pode enviar pro Professor
        # Apenas o Professor da matrícula pode enviar pro Aluno
        if usuario_logado.role == UserRole.ALUNO:
            if usuario_logado.id != matricula.aluno_id:
                raise PermissaoNegadaError("Você só pode enviar documentos para disciplinas em que está matriculado.")
        elif usuario_logado.role == UserRole.PROFESSOR:
            if usuario_logado.id != matricula.professor_id:
                raise PermissaoNegadaError("Você só pode enviar documentos para matrículas sob sua docência.")
        else:
            # Coordenadores ou qualquer outro cargo não fazem upload direto na conversa aluno-professor
            raise PermissaoNegadaError("Apenas o aluno ou o professor vinculado à matrícula podem realizar upload de documentos.")

        # Gera um nome de arquivo único para não haver colisão em disco
        extensao = Path(arquivo.filename).suffix if arquivo.filename else ""
        nome_seguro = f"{uuid.uuid4().hex}{extensao}"
        caminho_destino = UPLOAD_DIR / nome_seguro

        # Salva o arquivo fisicamente no disco em blocos (chunks)
        try:
            with open(caminho_destino, "wb") as buffer:
                shutil.copyfileobj(arquivo.file, buffer)
        finally:
            arquivo.file.close()

        # Cria a entidade Documento e registra no banco
        novo_documento = Documento(
            titulo=titulo.strip(),
            tipo=tipo,
            caminho_arquivo=str(caminho_destino),
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

        # Regra de Acesso:
        # Aluno da matrícula, Professor da matrícula e Coordenadores têm acesso à visualização
        tem_acesso = (
            usuario_logado.role == UserRole.COORDENADOR or
            (usuario_logado.role == UserRole.ALUNO and usuario_logado.id == matricula.aluno_id) or
            (usuario_logado.role == UserRole.PROFESSOR and usuario_logado.id == matricula.professor_id)
        )

        if not tem_acesso:
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
        tem_acesso = (
            usuario_logado.role == UserRole.COORDENADOR or
            (usuario_logado.role == UserRole.ALUNO and usuario_logado.id == matricula.aluno_id) or
            (usuario_logado.role == UserRole.PROFESSOR and usuario_logado.id == matricula.professor_id)
        )

        if not tem_acesso:
            raise PermissaoNegadaError("Você não tem permissão para baixar este documento.")

        if not os.path.exists(documento.caminho_arquivo):
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
        if usuario_logado.role != UserRole.COORDENADOR and documento.remetente_id != usuario_logado.id:
            raise PermissaoNegadaError("Você não tem permissão para excluir este documento.")

        # Remove o arquivo físico se ele existir no disco
        if os.path.exists(documento.caminho_arquivo):
            try:
                os.remove(documento.caminho_arquivo)
            except OSError:
                pass

        # Remove do banco
        self.documento_repo.deletar(documento)

    # --- 5. RESUMO COM IA ---
    def gerar_resumo(self, documento_id: int, usuario_logado: Usuario) -> ResumoIAResponse:
        documento = self.documento_repo.buscar_por_id(documento_id)
        if not documento:
            raise RecursoNaoEncontradoError("Documento não encontrado.")

        if not self.policy.pode_acessar_resumo(documento, usuario_logado):
            raise PermissaoNegadaError("Você não tem permissão para acessar o resumo deste documento.")

        texto_cru = self.pdf_extractor.extrair_texto(documento.caminho_arquivo)
        if not texto_cru:
            raise ValueError("O documento está vazio ou é ilegível.")

        estrategia = ResumoStrategyFactory.get_strategy(documento.tipo)
        prompt = estrategia.gerar_prompt(texto_cru)
        
        dados_ia = self.ia_client.processar_resumo_estruturado(prompt)

        termos = dados_ia.termos_busca
        links_reais = buscar_links_por_termos(termos) if termos else []

        return ResumoIAResponse(
            titulo_documento=dados_ia.titulo_documento,
            resumo_geral=dados_ia.resumo_geral,
            pontos_chave=dados_ia.pontos_chave,
            proximos_passos_ou_recomendacoes=dados_ia.proximos_passos_ou_recomendacoes,
            links_estudo=links_reais,
            aviso_ia=dados_ia.aviso_ia
        )