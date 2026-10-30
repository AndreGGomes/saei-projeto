import { useEffect, useId, useRef } from 'react';
import { cx } from './utils';
import { BotaoIcone } from './Button';
import { IconeFechar } from './icons';

const LARGURAS = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-4xl',
};

// Modal base: fecha com Escape e clique no fundo, trava a rolagem do body, foca o
// painel ao abrir e devolve o foco para o elemento anterior ao fechar.
export default function Modal({
  onFechar,
  titulo,
  descricao,
  icone,
  tom = 'indigo',
  largura = 'lg',
  rodape,
  children,
}) {
  const painelRef = useRef(null);
  const idTitulo = useId();

  useEffect(() => {
    const anterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    painelRef.current?.focus();

    const aoTeclar = (e) => {
      if (e.key === 'Escape') onFechar();
    };
    document.addEventListener('keydown', aoTeclar);

    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflowAnterior;
      if (anterior instanceof HTMLElement) anterior.focus();
    };
  }, [onFechar]);

  const tons = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300',
    violeta: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300',
    esmeralda: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300',
    ceu: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      {/* Fundo */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Painel */}
      <div
        ref={painelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className={cx(
          'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-slate-200/80 bg-white shadow-2xl outline-none',
          'dark:border-slate-800 dark:bg-slate-900 sm:rounded-2xl',
          LARGURAS[largura] || LARGURAS.lg
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200/70 px-5 py-4 dark:border-slate-800">
          <div className="flex min-w-0 items-start gap-3">
            {icone && (
              <span
                className={cx(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  tons[tom] || tons.indigo
                )}
              >
                {icone}
              </span>
            )}
            <div className="min-w-0">
              <h2 id={idTitulo} className="text-base font-bold text-slate-900 dark:text-white">
                {titulo}
              </h2>
              {descricao && (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {descricao}
                </p>
              )}
            </div>
          </div>
          <BotaoIcone rotulo="Fechar" onClick={onFechar} className="-mr-1 -mt-1">
            <IconeFechar className="h-4 w-4" />
          </BotaoIcone>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {rodape && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200/70 bg-slate-50/60 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-950/40">
            {rodape}
          </footer>
        )}
      </div>
    </div>
  );
}
