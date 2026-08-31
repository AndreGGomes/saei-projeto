# backend/app/routers/usuarios.py
from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Usuario, Aluno, Professor, Coordenador, UserRole
from app import schemas, auth
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Autenticação"])

# ==========================================
# DEPENDÊNCIA REUTILIZÁVEL (Para proteger rotas)
# ==========================================
def get_current_user(token: Annotated[str, Depends(auth.oauth2_scheme)], db: Session = Depends(get_db)):
    user_id = auth.verify_access_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id_int = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Formato de token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(Usuario).filter(Usuario.id == user_id_int).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# ==========================================
# ENDPOINTS
# ==========================================
@router.post("/register", response_model=schemas.UsuarioPrivado, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    
    if user_in.role == UserRole.ALUNO:
        if not user_in.matricula:
            raise HTTPException(status_code=400, detail="Matrícula é obrigatória para alunos.")
        
        matricula_existe = db.query(Aluno).filter(Aluno.matricula == user_in.matricula).first()
        if matricula_existe:
            raise HTTPException(status_code=400, detail="Esta matrícula já está cadastrada.")
    else:
        email_existe = db.query(Usuario).filter(
            Usuario.email == user_in.email, 
            Usuario.role != UserRole.ALUNO
        ).first()
        if email_existe:
            raise HTTPException(status_code=400, detail="Este e-mail já está em uso por outro funcionário.")

    novo_usuario = Usuario(
        nome=user_in.nome,
        email=user_in.email.lower(),
        senha_hash=auth.hash_password(user_in.senha),
        role=user_in.role
    )
    db.add(novo_usuario)
    db.flush() 

    if user_in.role == UserRole.ALUNO:
        db.add(Aluno(usuario_id=novo_usuario.id, matricula=user_in.matricula))
        # Atribui dinamicamente para o Pydantic retornar na resposta
        novo_usuario.matricula = user_in.matricula 
    elif user_in.role == UserRole.PROFESSOR:
        db.add(Professor(usuario_id=novo_usuario.id))
    elif user_in.role == UserRole.COORDENADOR:
        db.add(Coordenador(usuario_id=novo_usuario.id))

    db.commit()
    db.refresh(novo_usuario)
    
    return novo_usuario


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    identificador = form_data.username 
    user = None

    if "@" in identificador:
        usuarios_encontrados = db.query(Usuario).filter(Usuario.email == identificador.lower()).all()
        
        if len(usuarios_encontrados) == 1:
            user = usuarios_encontrados[0]
        elif len(usuarios_encontrados) > 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Múltiplas contas encontradas. Faça login utilizando a Matrícula do aluno."
            )
    else:
        aluno = db.query(Aluno).filter(Aluno.matricula == identificador).first()
        if aluno:
            user = aluno.usuario

    if not user or not auth.verify_password(form_data.password, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais incorretas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Adicionamos o ID como string no campo 'sub' para bater com o token validation
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = auth.create_access_token(
        data={
            "sub": str(user.id), 
            "email": user.email, 
            "role": user.role.value
        }, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UsuarioPrivado)
def read_users_me(current_user: Usuario = Depends(get_current_user)):
    """Retorna o usuário atualmente autenticado."""
    
    # Injetamos a matrícula dinamicamente no objeto apenas para o Pydantic renderizar
    if current_user.role == UserRole.ALUNO and current_user.perfil_aluno:
        current_user.matricula = current_user.perfil_aluno.matricula
        
    return current_user


@router.get("/{user_id}", response_model=schemas.UsuarioPublico)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Retorna dados públicos de um usuário específico."""
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if user:
        return user
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")