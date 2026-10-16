// Responsabilidade única: renderizar a lista de documentos de uma matrícula
// (título, badge de tipo, remetente, ações de IA, download e exclusão opcional).
// Centraliza as 4 cópias quase idênticas que existiam no modal da coordenação
// e na aba de documentos do professor. As variantes preservam os estilos de cada contexto.
import BotaoAcoesIA from './BotaoAcoesIA';
import PerfilRemetente from './PerfilRemetente';

const CORES = {
  blue: {
    ponto: 'bg-blue-500',
    badge: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    download: 'bg-blue-600 hover:bg-blue-700',
  },
  emerald: {
    ponto: 'bg-emerald-500',
    badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    download: 'bg-emerald-600 hover:bg-emerald-700',
  },
};

const VARIANTES = {
  // Modal da coordenação (DashboardCoordenador)
  modal: {
    container: 'bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3',
    cabecalho: 'flex items-center justify-between border-b pb-2 dark:border-slate-700',
    titulo: 'font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2',
    legenda: 'text-[11px] text-slate-400',
    vazio: 'text-xs text-slate-400 py-6 text-center',
    lista: 'space-y-2.5 max-h-72 overflow-y-auto pr-1',
    card: 'flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm',
    tituloDocumento: 'font-semibold text-slate-800 dark:text-white text-xs',
    badge: 'inline-block text-[10px] px-1.5 py-0.5 rounded font-mono mt-1',
    acoes: 'flex items-center space-x-1.5',
    ia: 'text-[11px] px-2.5 py-1.5',
    downloadBase: 'flex items-center gap-1 text-[11px] text-white px-2.5 py-1.5 rounded-md font-semibold transition shadow-sm',
    downloadIcone: 'w-3.5 h-3.5',
    downloadTitulo: 'Baixar em PDF',
    excluir:
      'flex items-center justify-center p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition',
    excluirIcone: 'w-3.5 h-3.5',
    excluirTitulo: 'Excluir Arquivo',
  },
  // Painel de aba do professor (DashboardProfessor)
  painel: {
    container: 'bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-100 dark:border-slate-800 p-5 space-y-4',
    cabecalho: 'flex items-center justify-between border-b pb-3 dark:border-slate-800',
    titulo: 'font-bold text-slate-800 dark:text-white flex items-center gap-2',
    legenda: 'text-xs text-slate-400',
    vazio: 'text-sm text-slate-400 py-4 text-center',
    lista: 'space-y-3',
    card: 'flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50',
    tituloDocumento: 'font-semibold text-slate-800 dark:text-white text-sm',
    badge: 'inline-block text-xs px-2 py-0.5 rounded font-mono mt-1',
    acoes: 'flex items-center space-x-2',
    ia: 'text-xs px-3 py-1.5',
    downloadBase: 'flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-md font-semibold transition shadow-sm',
    downloadIcone: 'w-4 h-4',
    downloadTitulo: 'Baixar Arquivo',
    excluir:
      'flex items-center justify-center p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition border border-transparent hover:border-red-200 dark:hover:border-red-900',
    excluirIcone: 'w-4 h-4',
    excluirTitulo: 'Excluir Documento',
  },
};

export default function ListaDocumentos({
  variante = 'painel',
  cor = 'blue',
  titulo,
  legenda,
  vazioTexto,
  documentos = [],
  onDownload,
  onDelete,
}) {
  const v = VARIANTES[variante] || VARIANTES.painel;
  const c = CORES[cor] || CORES.blue;

  return (
    <div className={v.container}>
      <div className={v.cabecalho}>
        <h4 className={v.titulo}>
          <span className={`w-2.5 h-2.5 ${c.ponto} rounded-full`}></span>
          {titulo} ({documentos.length})
        </h4>
        <span className={v.legenda}>{legenda}</span>
      </div>

      {documentos.length === 0 ? (
        <p className={v.vazio}>{vazioTexto}</p>
      ) : (
        <div className={v.lista}>
          {documentos.map((doc) => (
            <div key={doc.id} className={v.card}>
              <div className="pr-2">
                <p className={v.tituloDocumento}>{doc.titulo}</p>
                <span className={`${v.badge} ${c.badge}`}>{doc.tipo}</span>
                {doc.remetente && (
                  <div className="mt-1">
                    <PerfilRemetente remetente={doc.remetente} />
                  </div>
                )}
              </div>
              <div className={v.acoes}>
                {/* Ações de IA (resumo etc.) — presentes em qualquer variante */}
                <BotaoAcoesIA documento={doc} className={v.ia} />

                {onDelete && (
                  <>
                  <button
                    onClick={() => onDownload(doc.id, doc.titulo)}
                    className={`${v.downloadBase} ${c.download}`}
                    title={v.downloadTitulo}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={v.downloadIcone}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.5V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span>Baixar</span>
                  </button>
                  <button
                    onClick={() => onDelete(doc.id)}
                    className={v.excluir}
                    title={v.excluirTitulo}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={v.excluirIcone}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                  </>
                )}

                {!onDelete && (
                  <button
                    onClick={() => onDownload(doc.id, doc.titulo)}
                    className={`${v.downloadBase} ${c.download}`}
                    title={v.downloadTitulo}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={v.downloadIcone}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.5V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span>Baixar</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
