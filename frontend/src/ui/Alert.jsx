import { cx } from './utils';
import { IconeAlerta, IconeCheck, IconeInfo } from './icons';

const TONS = {
  erro: {
    caixa: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200',
    icone: 'text-rose-500 dark:text-rose-400',
    Icone: IconeAlerta,
  },
  aviso: {
    caixa: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200',
    icone: 'text-amber-500 dark:text-amber-400',
    Icone: IconeAlerta,
  },
  sucesso: {
    caixa:
      'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200',
    icone: 'text-emerald-500 dark:text-emerald-400',
    Icone: IconeCheck,
  },
  info: {
    caixa: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-200',
    icone: 'text-sky-500 dark:text-sky-400',
    Icone: IconeInfo,
  },
};

export default function Alert({ tom = 'info', titulo, children, acao, className }) {
  const t = TONS[tom] || TONS.info;
  return (
    <div
      role={tom === 'erro' ? 'alert' : 'status'}
      className={cx('flex items-start gap-3 rounded-2xl border p-4 text-sm', t.caixa, className)}
    >
      <t.Icone className={cx('mt-0.5 h-5 w-5 shrink-0', t.icone)} />
      <div className="min-w-0 flex-1">
        {titulo && <p className="font-semibold">{titulo}</p>}
        <div className={cx('leading-relaxed', titulo && 'mt-0.5')}>{children}</div>
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </div>
  );
}
