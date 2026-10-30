import { cx } from './utils';

// Navegação por seções do painel. Botões com aria-current (troca de seção, não de
// rota) e rolagem horizontal no mobile, para 5 abas caberem em telas pequenas.
export default function Tabs({ abas, ativa, onChange, rotulo = 'Seções do painel', className }) {
  return (
    <nav
      aria-label={rotulo}
      className={cx(
        'flex gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className
      )}
    >
      {abas.map((aba) => {
        const selecionada = aba.id === ativa;
        return (
          <button
            key={aba.id}
            type="button"
            onClick={() => onChange(aba.id)}
            aria-current={selecionada ? 'page' : undefined}
            className={cx(
              'inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900',
              selecionada
                ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
            )}
          >
            {aba.icone && <span className="shrink-0">{aba.icone}</span>}
            <span className="whitespace-nowrap">{aba.label}</span>
            {typeof aba.contagem === 'number' && (
              <span
                className={cx(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                  selecionada
                    ? 'bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                )}
              >
                {aba.contagem}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
