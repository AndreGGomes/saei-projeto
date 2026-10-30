import { cx } from './utils';

const PALETA = [
  'from-indigo-500 to-violet-500',
  'from-emerald-500 to-teal-500',
  'from-sky-500 to-blue-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
];

function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

// Avatar textual (sem foto no sistema): iniciais sobre um gradiente estável,
// derivado do nome para a mesma pessoa ter sempre a mesma cor.
export default function Avatar({ nome = '', tamanho = 'md', className }) {
  const indice = [...nome].reduce((soma, c) => soma + c.charCodeAt(0), 0) % PALETA.length;
  const tamanhos = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm',
  };

  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white',
        PALETA[indice],
        tamanhos[tamanho] || tamanhos.md,
        className
      )}
    >
      {iniciais(nome)}
    </span>
  );
}
