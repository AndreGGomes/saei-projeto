# app/api/routers/documentos.py
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user, get_documento_service
from app.models import Usuario
from app.schemas.documento_schemas import ResumoIAResponse
from app.services.documento_service import DocumentoService, PermissionError

router = APIRouter(prefix="/documentos", tags=["Documentos"])

@router.post("/{documento_id}/resumo-ia", response_model=ResumoIAResponse)
def gerar_resumo_ia(
    documento_id: int,
    service: DocumentoService = Depends(get_documento_service),
    usuario_logado: Usuario = Depends(get_current_user)
):
    try:
        return service.gerar_resumo(documento_id, usuario_logado)
        
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))