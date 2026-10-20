from fastapi import APIRouter, Depends, HTTPException, status
from app.models import Usuario, UserRole
from app.core.exceptions import PermissaoNegadaError
from app.api.dependencies import get_current_user, get_documento_service
from app.services.documento_service import DocumentoService
from app.services.ia.ia_client import GroqClient
from app.core.utils.search_helper import buscar_links_detalhados_por_termos
from app.schemas.ia_schemas import (
    TutorAlunoRequest,
    TutorAlunoResponse,
    AdaptarMaterialRequest,
    IAAdaptacaoInternal,
    AvaliarAcessibilidadeRequest,
    IAAcessibilidadeInternal,
)

router = APIRouter(prefix="/ia", tags=["Inteligência Artificial"])

# Endpoint que recebe o payload JSON direto
@router.post(
    "/tutor-aluno",
    response_model=TutorAlunoResponse,
    status_code=status.HTTP_200_OK,
    summary="Tutor de Estudos Personalizado (Exclusivo para Alunos)"
)
def tutor_estudos_personalizado(
    dados: TutorAlunoRequest,
    current_user: Usuario = Depends(get_current_user)
):
    # apenas ALUNO
    if current_user.role != UserRole.ALUNO:
        raise PermissaoNegadaError("O Tutor de Estudos Personalizado é um recurso exclusivo para estudantes.")
    try:
        ia_client = GroqClient()
        # chama a Groq
        resposta_ia = ia_client.gerar_tutoria_aluno(
            texto_atividade=dados.texto_atividade,
            resumo_laudo=dados.resumo_laudo or "Nenhum laudo informado.",
            preferencias_aluno=dados.preferencias_aluno or "Nenhuma preferência informada."
        )

        # extrai os termos_busca_duckduckgo e busca links reais no DuckDuckGo
        links_reais = buscar_links_detalhados_por_termos(
            termos=resposta_ia.termos_busca_duckduckgo,
            resumo_laudo=dados.resumo_laudo or "",
            preferencias_aluno=dados.preferencias_aluno or ""
        )

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


# Adaptação Inteligente de Materiais a partir do texto enviado pelo cliente
# (Visão do Professor e do Coordenador — guia metodológico de inclusão em sala)
@router.post(
    "/adaptar-material",
    response_model=IAAdaptacaoInternal,
    status_code=status.HTTP_200_OK,
    summary="Adaptação Inteligente de Planos de Aula e Atividades"
)
def adaptar_material(
    dados: AdaptarMaterialRequest,
    current_user: Usuario = Depends(get_current_user)
):
    # Apenas PROFESSOR e COORDENADOR: o resultado é um guia de mediação, não um material para o aluno
    if current_user.role not in (UserRole.PROFESSOR, UserRole.COORDENADOR):
        raise PermissaoNegadaError("A adaptação de materiais é exclusiva para professores e coordenadores.")
    try:
        ia_client = GroqClient()
        return ia_client.adaptar_material(
            texto_material=dados.texto_material,
            tipo_documento=dados.tipo_documento,
            resumo_laudo=dados.resumo_laudo or "Nenhum laudo informado."
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))


# Endpoint integrado para o botão "Adaptar Material" num PDF de Plano de Aula/Atividade
# (extrai o texto do arquivo, puxa os laudos da matrícula e delega à mesma lógica acima)
@router.post(
    "/adaptar-material/documento/{documento_id}",
    response_model=IAAdaptacaoInternal,
    status_code=status.HTTP_200_OK,
    summary="Adaptação Inteligente de Material a partir de um documento PDF"
)
def adaptar_material_documento(
    documento_id: int,
    service: DocumentoService = Depends(get_documento_service),
    current_user: Usuario = Depends(get_current_user)
):
    try:
        return service.gerar_adaptacao_documento(documento_id, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))


# Termômetro de Acessibilidade DUA (Foco no Professor e Coordenador)
@router.post(
    "/avaliar-acessibilidade",
    response_model=IAAcessibilidadeInternal,
    status_code=status.HTTP_200_OK,
    summary="Termômetro de Acessibilidade (DUA) de Materiais Didáticos"
)
def avaliar_acessibilidade(
    dados: AvaliarAcessibilidadeRequest,
    current_user: Usuario = Depends(get_current_user)
):
    # Permissão restrita a PROFESSOR e COORDENADOR
    if current_user.role not in (UserRole.PROFESSOR, UserRole.COORDENADOR):
        raise PermissaoNegadaError("A avaliação de acessibilidade é exclusiva para professores e coordenadores.")
    
    try:
        ia_client = GroqClient()
        return ia_client.avaliar_acessibilidade(texto_material=dados.texto_material)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

# Endpoint integrado para o botão "Termômetro DUA" num PDF de Atividade/Plano de Aula
@router.post(
    "/avaliar-acessibilidade/documento/{documento_id}",
    response_model=IAAcessibilidadeInternal,
    status_code=status.HTTP_200_OK,
    summary="Termômetro de Acessibilidade (DUA) a partir de um documento PDF"
)
def avaliar_acessibilidade_documento(
    documento_id: int,
    service: DocumentoService = Depends(get_documento_service),
    current_user: Usuario = Depends(get_current_user)
):
    try:
        return service.gerar_avaliacao_acessibilidade_documento(documento_id, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))