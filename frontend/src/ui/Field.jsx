import { useId } from 'react';
import { cx } from './utils';

const CONTROLE =
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition ' +
  'placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ' +
  'dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-900 ' +
  'border-slate-300 dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/25';

const INVALIDO = 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/25 dark:border-rose-500';

// Rótulo + controle + dica/erro. O id é gerado aqui e ligado ao controle por
// aria-describedby, para o leitor de tela anunciar a mensagem do campo.
export function Field({ label, dica, erro, obrigatorio, className, children }) {
  const id = useId();
  const idMensagem = `${id}-mensagem`;
  const mensagem = erro || dica;

  return (
    <div className={cx('space-y-1.5', className)}>
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
      >
        {label}
        {obrigatorio && (
          <span className="ml-0.5 text-rose-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children({
        id,
        className: cx(CONTROLE, erro && INVALIDO),
        'aria-invalid': erro ? true : undefined,
        'aria-describedby': mensagem ? idMensagem : undefined,
      })}
      {mensagem && (
        <p
          id={idMensagem}
          className={cx(
            'text-[11px]',
            erro ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
          )}
        >
          {mensagem}
        </p>
      )}
    </div>
  );
}

export function Input(props) {
  return <input {...props} />;
}

export function Select({ children, ...props }) {
  return <select {...props}>{children}</select>;
}

export function Textarea(props) {
  return <textarea {...props} />;
}

export { CONTROLE };
