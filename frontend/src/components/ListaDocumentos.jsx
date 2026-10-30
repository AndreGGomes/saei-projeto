import Badge from '../ui/Badge';
import { BotaoIcone } from '../ui/Button';
import { Card, CardHeader } from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import { IconeDocumento, IconeDownload, IconeExcluir } from '../ui/icons';
import { cx } from '../ui/utils';
import BotaoAcoesIA from './BotaoAcoesIA';
import PerfilRemetente from './PerfilRemetente';

const CORES = {
  blue: {
    ponto: 'bg-sky-500',
    tomBadge: 'ceu',
  },
  emerald: {
    ponto: 'bg-emerald-500',
    tomBadge: 'esmeralda',
  },
};

// Lista de documentos de uma matrícula: título, tipo, remetente e ações (IA,
// download e exclusão opcional). Um único componente usado pelas três visões.
export default function ListaDocumentos({
  cor = 'blue',
  titulo,
  legenda,
  vazioTexto,
  documentos = [],
  onDownload,
  onDelete,
  perfil = 'ALUNO',
}) {
  const c = CORES[cor] || CORES.blue;

  return (
    <Card>
      <CardHeader
        titulo={`${titulo} (${documentos.length})`}
        descricao={legenda}
        icone={
          <span className="flex items-center gap-1.5">
            <span className={cx('h-2 w-2 rounded-full', c.ponto)} aria-hidden="true" />
          </span>
        }
      />

      {documentos.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icone={<IconeDocumento className="h-5 w-5" />}
            titulo="Nenhum documento"
            descricao={vazioTexto}
            className="border-0 bg-transparent py-8 dark:bg-transparent"
          />
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {documentos.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-start justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {doc.titulo}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge tom={c.tomBadge} mono>
                    {doc.tipo}
                  </Badge>
                  {doc.remetente && <PerfilRemetente remetente={doc.remetente} />}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <BotaoAcoesIA documento={doc} perfil={perfil} />
                <BotaoIcone rotulo={`Baixar ${doc.titulo}`} onClick={() => onDownload(doc.id, doc.titulo)}>
                  <IconeDownload className="h-4 w-4" />
                </BotaoIcone>
                {onDelete && (
                  <BotaoIcone
                    rotulo={`Excluir ${doc.titulo}`}
                    variante="perigo"
                    onClick={() => onDelete(doc.id)}
                  >
                    <IconeExcluir className="h-4 w-4" />
                  </BotaoIcone>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
