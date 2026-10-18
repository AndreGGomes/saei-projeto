from fastapi import APIRouter, Depends, HTTPException, status
from app.models import Usuario, TipoDocumento
from app.schemas.ia_schemas import TutorAlunoRequest, TutorAlunoResponse
from app.api.dependencies import get_current_user, get_documento_service
from app.services.documento_service import DocumentoService
from app.services.ia.ia_client import GroqClient
from app.core.utils.search_helper import buscar_links_detalhados_por_termos

router = APIRouter(prefix="/ia", tags=["Inteligência Artificial - Tutor"])

# Endpoint que recebe o payload JSON direto
@router.post(
    "/tutor-aluno",
    response_model=TutorAlunoResponse,
    status_code=status.HTTP_200_OK,
    summary="Tutor de Estudos Personalizado (via Payload JSON)"
)
def tutor_estudos_personalizado(
    dados: TutorAlunoRequest,
    current_user: Usuario = Depends(get_current_user)
):
    try:
        ia_client = GroqClient()
        # chama a Groq
        resposta_ia = ia_client.gerar_tutoria_aluno(
            texto_atividade=dados.texto_atividade,
            resumo_laudo=dados.resumo_laudo or "Nenhum laudo informado.",
            preferencias_aluno=dados.preferencias_aluno or "Nenhuma preferência informada."
        )

        # extrai os termos_busca_duckduckgo e busca links reais no DuckDuckGo
        links_reais = buscar_links_detalhados_por_termos(resposta_ia.termos_busca_duckduckgo)

        # Monta o TutorAlunoResponse
        return TutorAlunoResponse(
            explicacao_pedagogica=resposta_ia.explicacao_pedagogica,
            passo_a_passo_resolucao=resposta_ia.passo_a_passo_resolucao,
            links_recomendados=links_reais
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))


# Endpoint integrado para o botão "Estudar com o Tutor" num PDF de Atividade do Aluno
@router.post(
    "/tutor-aluno/documento/{documento_id}",
    response_model=TutorAlunoResponse,
    status_code=status.HTTP_200_OK,
    summary="Tutor de Estudos Personalizado a partir de um documento PDF"
)
def tutor_estudos_por_documento(
    documento_id: int,
    service: DocumentoService = Depends(get_documento_service),
    current_user: Usuario = Depends(get_current_user)
):
    try:
        return service.gerar_tutoria_documento(documento_id, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))