import ListaDocumentos from '../ListaDocumentos';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import { SkeletonLista } from '../../ui/Spinner';
import { IconeDocumento } from '../../ui/icons';

// Histórico de anexos de uma matrícula (visão da coordenação).
export default function ModalDocumentosMatricula({
  matricula,
  documentos,
  loading,
  onFechar,
  onDownload,
  onDeletar,
}) {
  return (
    <Modal
      onFechar={onFechar}
      titulo="Documentos da matrícula"
      descricao={`${matricula.aluno.nome} · ${matricula.disciplina.codigo} — ${matricula.disciplina.nome}`}
      icone={<IconeDocumento className="h-5 w-5" />}
      largura="xl"
      rodape={<Button variante="secundario" onClick={onFechar}>Fechar</Button>}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tom="neutro" mono>
          {matricula.aluno.matricula}
        </Badge>
        <Badge tom="indigo" mono>
          {matricula.disciplina.codigo}
        </Badge>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {matricula.professor?.nome ? `Professor(a): ${matricula.professor.nome}` : null}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SkeletonLista linhas={3} />
          <SkeletonLista linhas={3} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ListaDocumentos
            cor="blue"
            titulo="Enviados pelo aluno"
            legenda="Laudos e entregas"
            vazioTexto="Nenhum documento anexado pelo aluno."
            documentos={documentos.enviados_pelo_aluno}
            onDownload={onDownload}
            onDelete={onDeletar}
            perfil="COORDENADOR"
          />
          <ListaDocumentos
            cor="emerald"
            titulo="Enviados pelo professor"
            legenda="Planos e materiais"
            vazioTexto="Nenhum documento anexado pelo professor."
            documentos={documentos.enviados_pelo_professor}
            onDownload={onDownload}
            onDelete={onDeletar}
            perfil="COORDENADOR"
          />
        </div>
      )}
    </Modal>
  );
}
