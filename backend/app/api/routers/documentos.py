# Guichê de Gestão de Documentos e Anexos. 
# Permite o envio, a consulta dividida em listas (aluno/professor) e o download de laudos médicos, atividades adaptadas e planos de aula.

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse

from app.models import Usuario, TipoDocumento
from app.api.dependencies import get_current_user, get_documento_service
from app.services.documento_service import DocumentoService
from app.schemas.documento_schemas import DocumentoResponse, MatriculaDocumentosResponse, ResumoIAResponse

router = APIRouter(prefix="/documentos", tags=["Documentos e Anexos"])

# Realiza o upload de um arquivo físico vinculado a uma matrícula letiva.
# Se o usuário logado for ALUNO, o arquivo vai para a lista de enviados pelo aluno.
# Se for PROFESSOR, vai para a lista de enviados pelo docente.
# Apenas quem participa daquela matrícula pode fazer o envio.
@router.post(
    "/upload/{matricula_id}",
    response_model=DocumentoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload de documento para uma matrícula"
)
def upload_documento(
    matricula_id: int,
    titulo: str = Form(..., description="Título ou descrição do documento"),
    tipo: TipoDocumento = Form(..., description="Tipo: LAUDO_MEDICO, ATIVIDADE, PLANO_DE_AULA ou OUTROS"),
    arquivo: UploadFile = File(..., description="Arquivo binário (PDF, imagem, etc.)"),
    service: DocumentoService = Depends(get_documento_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.salvar_documento(
        matricula_id=matricula_id,
        titulo=titulo,
        tipo=tipo,
        arquivo=arquivo,
        usuario_logado=current_user
    )

# Consulta os documentos de uma matrícula divididos em duas listas:
# uma com os arquivos enviados pelo aluno e outra com os enviados pelo professor.
# Disponível para o Aluno e o Professor vinculados, além do Coordenador.
@router.get(
    "/matricula/{matricula_id}",
    response_model=MatriculaDocumentosResponse,
    status_code=status.HTTP_200_OK,
    summary="Lista os documentos de uma matrícula divididos em duas listas"
)
def listar_documentos_matricula(
    matricula_id: int,
    service: DocumentoService = Depends(get_documento_service),
    current_user: Usuario = Depends(get_current_user)
):
    return service.listar_documentos_matricula(
        matricula_id=matricula_id,
        usuario_logado=current_user
    )

# Realiza o download do arquivo físico original a partir do ID do documento.
# O sistema confere se o usuário logado pertence à matrícula ou se é Coordenador antes de liberar o ficheiro.
@router.get(
    "/download/{documento_id}",
    summary="Download do arquivo físico do documento"
)
def download_documento(
    documento_id: int,
    service: DocumentoService = Depends(get_documento_service),
    current_user: Usuario = Depends(get_current_user)
):
    caminho_fisico, nome_arquivo_download = service.obter_documento_para_download(
        documento_id=documento_id,
        usuario_logado=current_user
    )

    media_type = "application/pdf" if nome_arquivo_download.lower().endswith(".pdf") else "application/octet-stream"

    return FileResponse(
        path=caminho_fisico,
        filename=nome_arquivo_download,
        media_type=media_type
    )

# Remove um documento do banco e apaga o arquivo físico do disco.
# Apenas quem fez o envio do documento ou o Coordenador podem realizar a exclusão.
@router.delete(
    "/{documento_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Exclui um documento"
)
def deletar_documento(
    documento_id: int,
    service: DocumentoService = Depends(get_documento_service),
    current_user: Usuario = Depends(get_current_user)
):
    service.deletar_documento(documento_id, current_user)


# Analisa o documento em anexo e gera um resumo estruturado utilizando Inteligência Artificial.
@router.post(
    "/{documento_id}/resumo-ia", 
    response_model=ResumoIAResponse,
    summary="Gerar Resumo IA do documento"
)
def gerar_resumo_ia(
    documento_id: int,
    service: DocumentoService = Depends(get_documento_service),
    usuario_logado: Usuario = Depends(get_current_user)
):
    try:
        # Erros de permissão ou documento não encontrado serão interceptados
        # automaticamente pelo app.exception_handler global (403 e 404).
        return service.gerar_resumo(documento_id, usuario_logado)
        
    except RuntimeError as e:
        # Tratamos apenas falhas específicas do serviço externo (IA fora do ar, falha de processamento)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))