import { useEffect, useRef } from 'react';

// Painel flutuante ancorado num elemento da tela — usado pelo menu de ações de IA
// e pelo perfil do remetente. Abre abaixo da âncora; se não houver espaço, abre acima.
// Fecha com clique fora (preservando o próprio botão âncora) ou com a tecla Escape.
export default function Popover({ rect, ancoraRef, onFechar, largura = 250, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleFora = (e) => {
      if (ref.current && ref.current.contains(e.target)) return;
      if (ancoraRef && ancoraRef.current && ancoraRef.current.contains(e.target)) return;
      onFechar();
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') onFechar();
    };
    document.addEventListener('mousedown', handleFora);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleFora);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onFechar, ancoraRef]);

  if (!rect) return null;

  const espacoAbaixo = window.innerHeight - rect.bottom;
  const abrirAcima = espacoAbaixo < 240 && rect.top > espacoAbaixo;
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - largura - 8));
  const estilo = abrirAcima
    ? { left, bottom: window.innerHeight - rect.top + 6, width: largura }
    : { left, top: rect.bottom + 6, width: largura };

  return (
    <div
      ref={ref}
      role="menu"
      style={estilo}
      className="fixed z-50 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-1.5 text-left shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
    >
      {children}
    </div>
  );
}
