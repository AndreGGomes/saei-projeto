import { cx } from './utils';
import { IconeUpload } from './icons';

// Seletor de arquivo com a aparência do sistema. O <input type="file"> nativo é
// escondido (mas continua focável e acessível) porque o rótulo padrão do navegador
// aparece em inglês e não combina com o resto da interface.
export default function SeletorArquivo({
  id,
  arquivo,
  onChange,
  accept,
  required,
  controleProps = {},
}) {
  return (
    <div
      className={cx(
        'flex items-center gap-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-2.5 py-2 transition',
        'focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/25',
        'dark:border-slate-700 dark:bg-slate-950/60'
      )}
    >
      <input
        {...controleProps}
        id={id}
        type="file"
        accept={accept}
        required={required}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="sr-only"
      />
      <label
        htmlFor={id}
        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm ring-1 ring-slate-200/80 transition hover:bg-indigo-50 dark:bg-slate-900 dark:text-indigo-300 dark:ring-slate-700 dark:hover:bg-slate-800"
      >
        <IconeUpload className="h-3.5 w-3.5" />
        {arquivo ? 'Trocar' : 'Escolher arquivo'}
      </label>
      <span
        className={cx(
          'min-w-0 flex-1 truncate text-xs',
          arquivo ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
        )}
        title={arquivo?.name}
      >
        {arquivo?.name || 'Nenhum arquivo selecionado'}
      </span>
    </div>
  );
}
