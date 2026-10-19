import { useEffect, useId, useState } from 'react';

// Comprimento do arco semicircular do gauge (raio 95 -> meia circunferência)
const COMPRIMENTO_ARCO = Math.PI * 95;

// Lógica de cores e rótulos baseada no Score DUA (mantida da feature original)
const getStatus = (score) => {
  if (score >= 80) {
    return {
      label: 'Alta acessibilidade (DUA)',
      icon: '🟢',
      cor: '#10b981',
      pill: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300',
    };
  }
  if (score >= 50) {
    return {
      label: 'Acessibilidade média',
      icon: '🟡',
      cor: '#f59e0b',
      pill: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
    };
  }
  return {
    label: 'Baixa acessibilidade',
    icon: '🔴',
    cor: '#f43f5e',
    pill: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300',
  };
};

export default function TermometroAcessibilidade({ avaliacao }) {
  const scoreRaw = Number(avaliacao?.score_acessibilidade);
  const score = Number.isFinite(scoreRaw) ? Math.min(100, Math.max(0, scoreRaw)) : 0;

  // Anima o preenchimento do gauge de 0 até a pontuação real ao montar/atualizar
  const [animado, setAnimado] = useState(0);

  // ID único do gradiente: evita que múltiplos termômetros na mesma tela herdem a cor de um único <defs>
  const idGradiente = `gauge-dua-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    const timer = setTimeout(() => setAnimado(score), 80);
    return () => clearTimeout(timer);
  }, [score]);

  if (!avaliacao) return null;

  const { pontos_positivos, pontos_de_melhoria, sugestao_imediata } = avaliacao;
  const status = getStatus(score);
  const deslocamento = COMPRIMENTO_ARCO * (1 - animado / 100);

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Cabeçalho + selo de status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          🌡️ Termômetro DUA
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${status.pill}`}
        >
          <span aria-hidden="true">{status.icon}</span>
          {status.label}
        </span>
      </div>

      {/* Gauge semicircular animado */}
      <div className="relative mx-auto w-full max-w-[300px]">
        <svg viewBox="0 0 220 122" className="w-full" role="img" aria-label={`Pontuação de acessibilidade: ${score} de 100`}>
          <defs>
            <linearGradient id={idGradiente} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={status.cor} stopOpacity="0.45" />
              <stop offset="100%" stopColor={status.cor} />
            </linearGradient>
          </defs>

          {/* Trilha */}
          <path
            d="M 15 110 A 95 95 0 0 1 205 110"
            fill="none"
            strokeWidth="14"
            strokeLinecap="round"
            className="stroke-slate-200 dark:stroke-slate-700"
          />

          {/* Preenchimento (score) */}
          <path
            d="M 15 110 A 95 95 0 0 1 205 110"
            fill="none"
            stroke={`url(#${idGradiente})`}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={COMPRIMENTO_ARCO}
            strokeDashoffset={deslocamento}
            style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)' }}
          />

          {/* Marcas extremas */}
          <text x="15" y="121" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500" fontSize="9">
            0
          </text>
          <text x="205" y="121" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500" fontSize="9">
            100
          </text>
        </svg>

        {/* Pontuação central */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[14%] flex flex-col items-center">
          <span className="text-4xl font-black leading-none tracking-tight text-slate-800 dark:text-white">
            {score}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            de 100 pontos
          </span>
        </div>
      </div>

      {/* Dica imediata de ouro */}
      {sugestao_imediata && (
        <div className="rounded-xl border border-sky-200/80 bg-gradient-to-r from-sky-50 to-indigo-50 p-4 dark:border-sky-900/70 dark:from-sky-950/40 dark:to-indigo-950/40">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            <span aria-hidden="true">💡</span> Dica imediata para aplicação
          </h4>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{sugestao_imediata}</p>
        </div>
      )}

      {/* Pontos positivos e oportunidades de melhoria */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-4 dark:border-emerald-900/70 dark:bg-emerald-950/30">
          <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <span aria-hidden="true">✅</span> Pontos positivos
          </h4>
          <ul className="space-y-2">
            {pontos_positivos?.map((ponto, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-emerald-800 dark:text-emerald-200/90">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                  ✓
                </span>
                <span>{ponto}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 dark:border-amber-900/70 dark:bg-amber-950/30">
          <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            <span aria-hidden="true">⚠️</span> Oportunidades de melhoria
          </h4>
          <ul className="space-y-2">
            {pontos_de_melhoria?.map((ponto, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-amber-800 dark:text-amber-200/90">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                  !
                </span>
                <span>{ponto}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
