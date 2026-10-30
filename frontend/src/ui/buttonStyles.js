import { cx } from './utils';

// Estilos compartilhados do botão. Ficam fora de Button.jsx para o arquivo de
// componentes exportar apenas componentes (regra react-refresh do projeto).
export const BASE_BOTAO =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

export const VARIANTES_BOTAO = {
  primario: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800',
  ia: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm hover:from-violet-700 hover:to-indigo-700',
  secundario:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
  fantasma: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  perigo: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700',
  sucesso: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700',
  suave:
    'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-950',
};

export const TAMANHOS_BOTAO = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

// Para <Link> ou <a> que precisam parecer um botão.
export function classeBotao({ variante = 'primario', tamanho = 'md', className } = {}) {
  return cx(
    BASE_BOTAO,
    VARIANTES_BOTAO[variante] || VARIANTES_BOTAO.primario,
    TAMANHOS_BOTAO[tamanho] || TAMANHOS_BOTAO.md,
    className
  );
}
