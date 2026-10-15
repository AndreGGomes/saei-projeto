// Responsabilidade única: seletor de tema Sol/Lua dos dois dashboards, Login e Cadastro.
// As variantes preservam exatamente as classes visuais que cada página já usava.

const VARIANTES = {
  dashboard: {
    container:
      'flex items-center bg-blue-800 dark:bg-slate-800 rounded-full p-1 border border-blue-700 dark:border-slate-700 space-x-1',
    botaoBase: 'flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200',
    claroAtivo: 'bg-white text-amber-500 shadow-md scale-105',
    claroInativo: 'text-blue-200 hover:text-white',
    escuroAtivo: 'bg-slate-900 text-yellow-400 shadow-md scale-105',
    escuroInativo: 'text-blue-200 hover:text-white',
    iconeClasse: 'w-3.5 h-3.5',
    strokeWidth: 2,
  },
  login: {
    container:
      'flex items-center bg-slate-200 dark:bg-slate-800 rounded-full p-1 shadow-md border border-slate-300 dark:border-slate-700 space-x-1 z-50',
    botaoBase: 'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200',
    claroAtivo: 'bg-white text-amber-500 shadow-md scale-105',
    claroInativo: 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
    escuroAtivo: 'bg-slate-900 text-yellow-400 shadow-md scale-105',
    escuroInativo: 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
    iconeClasse: 'w-4 h-4',
    strokeWidth: 1.5,
  },
  cadastro: {
    container:
      'flex items-center bg-white dark:bg-slate-800 rounded-full p-1 shadow-md border border-slate-200 dark:border-slate-700 space-x-1',
    botaoBase: 'flex items-center justify-center w-8 h-8 rounded-full transition',
    claroAtivo: 'bg-blue-600 text-white shadow',
    claroInativo: 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200',
    escuroAtivo: 'bg-slate-700 text-yellow-400 shadow',
    escuroInativo: 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200',
    iconeClasse: 'w-4 h-4',
    strokeWidth: 1.5,
  },
};

export default function ThemeToggle({ isDarkMode, setTheme, variant = 'dashboard' }) {
  const v = VARIANTES[variant] || VARIANTES.dashboard;

  return (
    <div className={v.container}>
      <button
        type="button"
        onClick={() => setTheme(false)}
        className={`${v.botaoBase} ${!isDarkMode ? v.claroAtivo : v.claroInativo}`}
        title="Modo Claro"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={v.strokeWidth}
          stroke="currentColor"
          className={v.iconeClasse}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => setTheme(true)}
        className={`${v.botaoBase} ${isDarkMode ? v.escuroAtivo : v.escuroInativo}`}
        title="Modo Escuro"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={v.strokeWidth}
          stroke="currentColor"
          className={v.iconeClasse}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      </button>
    </div>
  );
}
