import { cx } from './utils';

export function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={cx('animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Skeleton({ className }) {
  return (
    <div
      className={cx(
        'animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800',
        className
      )}
      aria-hidden="true"
    />
  );
}

// Estado de carregamento padrão das áreas de conteúdo: spinner + mensagem em
// aria-live para leitores de tela anunciarem a mudança.
export function LoadingBlock({ mensagem = 'Carregando...', className }) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{mensagem}</p>
    </div>
  );
}

export function SkeletonLista({ linhas = 3 }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: linhas }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 p-4 dark:border-slate-800"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
