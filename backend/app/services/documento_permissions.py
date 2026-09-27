# app/services/documento_permissions.py
from app.models import Documento, Usuario

class DocumentoPolicy:
    """Responsabilidade única: Avaliar se um usuário tem direito a acessar um documento."""
    
    @staticmethod
    def pode_acessar_resumo(documento: Documento, usuario: Usuario) -> bool:
        ids_permitidos = [
            documento.matricula.aluno_id,             # O aluno da disciplina
            documento.matricula.professor_id,         # O professor da disciplina
            documento.matricula.aluno.tutor_id        # O coordenador tutor do aluno
        ]
        
        return usuario.id in ids_permitidos