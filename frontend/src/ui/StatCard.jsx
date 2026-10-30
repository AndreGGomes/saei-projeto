import { cx } from './utils';

const TONS = {
  indigo: {
    tile: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300',
    barra: 'bg-indigo-500',
  },
  esmeralda: {
    tile: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300',
    barra: 'bg-emerald-500',
  },
  violeta: {
    tile: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300',
    barra: 'bg-violet-500',
  },
  ambar: {
    tile: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300',
    barra: 'bg-amber-500',
  },
  ceu: {
    tile: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300',
    barra: 'bg-sky-500',
  },
};

export default function StatCard({ rotulo, valor, detalhe, icone, tom = 'indigo' }) {
  const t = TONS[tom] || TONS.indigo;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <span className={cx('absolute inset-x-0 top-0 h-0.5', t.barra)} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {rotulo}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {valor}
          </p>
          {detalhe && <p className="mt-1 text-xs text-slate-400">{detalhe}</p>}
        </div>
        {icone && (
          <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', t.tile)}>
            {icone}
          </span>
        )}
      </div>
    </div>
  );
}
