import { IconeLua, IconeSol } from '../ui/icons';

// Alternador de tema: um único botão com estado pressionado (aria-pressed), para
// leitores de tela entenderem a alternância sem depender do desenho do ícone.
export default function ThemeToggle({ isDarkMode, setTheme, className = '' }) {
  const rotulo = isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro';

  return (
    <button
      type="button"
      onClick={() => setTheme(!isDarkMode)}
      aria-pressed={isDarkMode}
      aria-label={rotulo}
      title={rotulo}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:ring-offset-slate-950 ${className}`}
    >
      {isDarkMode ? <IconeSol className="h-4 w-4" /> : <IconeLua className="h-4 w-4" />}
    </button>
  );
}
