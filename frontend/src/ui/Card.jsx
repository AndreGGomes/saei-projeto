import { cx } from './utils';

// Superfície base do sistema: borda fina + sombra suave, sem gradientes pesados.
export function Card({ className, children, ...props }) {
  return (
    <section
      className={cx(
        'rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({ titulo, descricao, acao, icone, className }) {
  return (
    <div
      className={cx(
        'flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-slate-800',
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icone && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {icone}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{titulo}</h3>
          {descricao && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{descricao}</p>
          )}
        </div>
      </div>
      {acao}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cx('px-5 py-4', className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return (
    <div
      className={cx(
        'flex flex-wrap items-center justify-end gap-2 border-t border-slate-200/70 px-5 py-4 dark:border-slate-800',
        className
      )}
    >
      {children}
    </div>
  );
}
