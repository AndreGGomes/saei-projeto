import { cx } from './utils';
import { Spinner } from './Spinner';
import { BASE_BOTAO, TAMANHOS_BOTAO, VARIANTES_BOTAO } from './buttonStyles';

export default function Button({
  variante = 'primario',
  tamanho = 'md',
  carregando = false,
  iconeEsquerda = null,
  iconeDireita = null,
  className,
  children,
  type = 'button',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={cx(
        BASE_BOTAO,
        VARIANTES_BOTAO[variante] || VARIANTES_BOTAO.primario,
        TAMANHOS_BOTAO[tamanho] || TAMANHOS_BOTAO.md,
        className
      )}
      {...props}
    >
      {carregando ? <Spinner className="h-4 w-4" /> : iconeEsquerda}
      {children}
      {!carregando && iconeDireita}
    </button>
  );
}

// Botão só de ícone, com nome acessível obrigatório.
export function BotaoIcone({ rotulo, variante = 'fantasma', className, children, ...props }) {
  const perigo = variante === 'perigo';
  return (
    <button
      type="button"
      title={rotulo}
      aria-label={rotulo}
      className={cx(
        'inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950',
        perigo
          ? 'text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-300'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
