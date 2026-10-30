import { useEffect, useState } from 'react';
import { ia } from '../actions';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Skeleton } from '../ui/Spinner';
import { IconeSeta, IconeTutoria } from '../ui/icons';

// Tutor de estudos personalizado (POST /ia/tutor-aluno/documento/{id}).
// Exibe explicação, passo a passo e links reais de apoio.
export default function ModalTutorIA({ documento, onFechar }) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tutoria, setTutoria] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;

    ia
      .tutorAlunoDocumento(documento.id)
      .then((dados) => {
        if (ativo) setTutoria(dados);
      })
      .catch((err) => {
        if (!ativo) return;
        setTutoria(null);
        setErro(err.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [documento.id, tentativa]);

  const tentarNovamente = () => {
    setCarregando(true);
    setErro('');
    setTutoria(null);
    setTentativa((t) => t + 1);
  };

  return (
    <Modal
      onFechar={onFechar}
      titulo="Tutor de estudos"
      descricao={documento.titulo}
      icone={<IconeTutoria className="h-5 w-5" />}
      tom="esmeralda"
      largura="lg"
      rodape={
        !carregando &&
        tutoria && (
          <>
            <Button variante="secundario" onClick={tentarNovamente}>
              Explicar de outra forma
            </Button>
            <Button variante="sucesso" onClick={onFechar}>
              Entendi
            </Button>
          </>
        )
      }
    >
      {carregando && (
        <div className="space-y-4" role="status" aria-live="polite">
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
            Preparando sua explicação personalizada...
          </div>
          {[0, 1].map((i) => (
            <div key={i} className="space-y-2 rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      )}

      {!carregando && erro && (
        <Alert
          tom="erro"
          titulo="Ocorreu um problema ao consultar o tutor"
          acao={
            <Button tamanho="sm" variante="perigo" onClick={tentarNovamente}>
              Tentar novamente
            </Button>
          }
        >
          {erro}
        </Alert>
      )}

      {!carregando && tutoria && (
        <div className="space-y-6">
          <section className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Entenda o assunto
            </h3>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {tutoria.explicacao_pedagogica}
            </p>
          </section>

          {tutoria.passo_a_passo_resolucao?.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Como fazer, passo a passo
              </h3>
              <ol className="mt-2 space-y-2">
                {tutoria.passo_a_passo_resolucao.map((passo, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed text-slate-700 dark:text-slate-300">{passo}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Material de apoio
            </h3>
            {!tutoria.links_recomendados || tutoria.links_recomendados.length === 0 ? (
              <p className="mt-2 text-xs italic text-slate-400">
                Nenhum link complementar encontrado para este tema.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-1 gap-2">
                {tutoria.links_recomendados.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 transition-colors hover:border-violet-300 hover:bg-violet-50/40 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-violet-800 dark:hover:bg-violet-950/20"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-violet-700 dark:text-slate-100 dark:group-hover:text-violet-300">
                        {item.titulo}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">{item.url}</p>
                    </div>
                    <IconeSeta className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-500" />
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
