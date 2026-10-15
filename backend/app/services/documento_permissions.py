from app.models import Documento, Usuario, UserRole
from app.core.exceptions import PermissaoNegadaError

class DocumentoPolicy:
    """Responsabilidade única: centralizar quem pode enviar, visualizar, baixar, excluir e resumir documentos."""

    @staticmethod
    def pode_acessar_resumo(documento: Documento, usuario: Usuario) -> bool:
        ids_permitidos = [
            documento.matricula.aluno_id,             # O aluno da disciplina
            documento.matricula.professor_id,         # O professor da disciplina
            documento.matricula.aluno.tutor_id        # O coordenador tutor do aluno
        ]

        return usuario.id in ids_permitidos

    @staticmethod
    def pode_visualizar_matricula(usuario: Usuario, matricula) -> bool:
        # Regra de Acesso:
        # Aluno da matrícula, Professor da matrícula e Coordenadores têm acesso à visualização
        return (
            usuario.role == UserRole.COORDENADOR or
            (usuario.role == UserRole.ALUNO and usuario.id == matricula.aluno_id) or
            (usuario.role == UserRole.PROFESSOR and usuario.id == matricula.professor_id)
        )

    @staticmethod
    def pode_baixar(usuario: Usuario, matricula) -> bool:
        # Mesma regra de visualização: quem enxerga a matrícula baixa seus documentos
        return DocumentoPolicy.pode_visualizar_matricula(usuario, matricula)

    @staticmethod
    def pode_excluir(usuario: Usuario, documento: Documento) -> bool:
        # Só quem enviou o documento ou o Coordenador pode apagá-lo
        return usuario.role == UserRole.COORDENADOR or documento.remetente_id == usuario.id

    @staticmethod
    def exigir_envio_permitido(usuario: Usuario, matricula) -> None:
        # Apenas o Aluno da matrícula pode enviar pro Professor
        # Apenas o Professor da matrícula pode enviar pro Aluno
        if usuario.role == UserRole.ALUNO:
            if usuario.id != matricula.aluno_id:
                raise PermissaoNegadaError("Você só pode enviar documentos para disciplinas em que está matriculado.")
        elif usuario.role == UserRole.PROFESSOR:
            if usuario.id != matricula.professor_id:
                raise PermissaoNegadaError("Você só pode enviar documentos para matrículas sob sua docência.")
        else:
            # Coordenadores ou qualquer outro cargo não fazem upload direto na conversa aluno-professor
            raise PermissaoNegadaError("Apenas o aluno ou o professor vinculado à matrícula podem realizar upload de documentos.")
