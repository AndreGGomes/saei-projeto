import { cx } from './utils';

// Tabelas do sistema compartilham a mesma moldura (cartão + rolagem horizontal no
// mobile). As classes ficam aqui para as linhas não repetirem strings enormes.
export function TableShell({ children, className }) {
  return (
    <div
      className={cx(
        'overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="border-b border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40">
      {children}
    </thead>
  );
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>;
}

export function TR({ children, className }) {
  return (
    <tr className={cx('transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40', className)}>
      {children}
    </tr>
  );
}

export function TH({ children, className }) {
  return (
    <th
      scope="col"
      className={cx(
        'px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TD({ children, className }) {
  return <td className={cx('px-5 py-4 align-middle', className)}>{children}</td>;
}

export function TDCelulaVazia({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center text-xs text-slate-400">
        {children}
      </td>
    </tr>
  );
}
