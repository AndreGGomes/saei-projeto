import { cx } from './utils';

export default function EmptyState({ icone, titulo, descricao, acao, className }) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40',
        className
      )}
    >
      {icone && (
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:text-slate-500 dark:ring-slate-800">
          {icone}
        </span>
      )}
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{titulo}</p>
      {descricao && (
        <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {descricao}
        </p>
      )}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}
