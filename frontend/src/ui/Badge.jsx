import { cx } from './utils';

const TONS = {
  neutro: 'bg-slate-100 text-slate-600 ring-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
  indigo:
    'bg-indigo-50 text-indigo-700 ring-indigo-200/70 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-900',
  violeta:
    'bg-violet-50 text-violet-700 ring-violet-200/70 dark:bg-violet-950/60 dark:text-violet-300 dark:ring-violet-900',
  esmeralda:
    'bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900',
  ambar:
    'bg-amber-50 text-amber-800 ring-amber-200/70 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900',
  rosa: 'bg-rose-50 text-rose-700 ring-rose-200/70 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900',
  ceu: 'bg-sky-50 text-sky-700 ring-sky-200/70 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-900',
};

export default function Badge({ tom = 'neutro', mono = false, className, children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        mono && 'font-mono tracking-tight',
        TONS[tom] || TONS.neutro,
        className
      )}
    >
      {children}
    </span>
  );
}
