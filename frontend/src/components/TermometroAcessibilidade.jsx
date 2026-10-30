import { useEffect, useId, useState } from 'react';
import Badge from '../ui/Badge';
import { IconeBrilhos, IconeCheck } from '../ui/icons';
import { cx } from '../ui/utils';

const RAIO = 54;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

// Faixas espelham app/core/rubrica_dua.py no backend: 75+ alta, 50+ média, 25+ baixa.
const getStatus = (score) => {
  if (score >= 75) {
    return {
      icone: '🟢',
      cor: '#10b981',
      tom: 'esmeralda',
      rotulo: 'Alta acessibilidade',
      pill: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300',
    };
  }
  if (score >= 50) {
    return {
      icone: '🟡',
      cor: '#f59e0b',
      tom: 'ambar',
      rotulo: 'Acessibilidade média',
      pill: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
    };
  }
  return {
    icone: '🔴',
    cor: '#f43f5e',
    tom: 'rosa',
    rotulo: 'Baixa acessibilidade',
    pill: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300',
  };
};

const NOMES_CRITERIOS = {
  representacao: 'Representação',
  acao_e_expressao: 'Ação e expressão',
  engajamento: 'Engajamento',
  acessibilidade_do_formato: 'Formato e diretrizes',
};

export default function TermometroAcessibilidade({ avaliacao }) {
  const scoreRaw = Number(avaliacao?.score_acessibilidade);
  const score = Number.isFinite(scoreRaw) ? Math.min(100, Math.max(0, scoreRaw)) : 0;

  // Anima o anel de 0 até a pontuação real ao montar/atualizar
  const [animado, setAnimado] = useState(0);
  const idGradiente = `gauge-dua-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    const timer = setTimeout(() => setAnimado(score), 80);
    return () => clearTimeout(timer);
  }, [score]);

  if (!avaliacao) return null;

  const { pontos_positivos, pontos_de_melhoria, sugestao_imediata, dimensoes } = avaliacao;
  const status = getStatus(score);
  // O backend devolve o nível calculado; usar ele evita legenda divergindo do número.
  const rotulo = avaliacao.nivel_acessibilidade || status.rotulo;
  const deslocamento = CIRCUNFERENCIA * (1 - animado / 100);

  return (
    <div className="space-y-5">
      {/* Cabeçalho do resultado */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <Badge tom={status.tom} className="normal-case tracking-normal">
            <span aria-hidden="true">{status.icone}</span>
            {rotulo}
          </Badge>
        </span>
        <span className="text-[11px] text-slate-400">Rubrica DUA · 4 critérios · 100 pontos</span>
      </div>

      {/* Anel de pontuação */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
        <div className="relative h-40 w-40 shrink-0">
          <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" role="img" aria-label={`Pontuação de acessibilidade: ${score} de 100`}>
            <defs>
              <linearGradient id={idGradiente} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={status.cor} stopOpacity="0.55" />
                <stop offset="100%" stopColor={status.cor} />
              </linearGradient>
            </defs>
            <circle
              cx="64"
              cy="64"
              r={RAIO}
              fill="none"
              strokeWidth="10"
              className="stroke-slate-100 dark:stroke-slate-800"
            />
            <circle
              cx="64"
              cy="64"
              r={RAIO}
              fill="none"
              stroke={`url(#${idGradiente})`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUNFERENCIA}
              strokeDashoffset={deslocamento}
              style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)' }}
            />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black leading-none tracking-tight text-slate-900 dark:text-white">
              {score}
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              de 100
            </span>
          </div>
        </div>

        {/* Notas por critério */}
        {dimensoes?.length > 0 && (
          <ul className="w-full max-w-sm space-y-2.5">
            {dimensoes.map((dimensao) => {
              const nota = Math.max(0, Math.min(25, Number(dimensao.score) || 0));
              return (
                <li key={dimensao.chave}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {NOMES_CRITERIOS[dimensao.chave] || dimensao.chave}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{nota}/25</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{ width: `${(nota / 25) * 100}%`, backgroundColor: status.cor }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Dica imediata */}
      {sugestao_imediata && (
        <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-r from-sky-50 to-indigo-50 p-4 dark:border-sky-900/70 dark:from-sky-950/30 dark:to-indigo-950/30">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            <IconeBrilhos className="h-4 w-4" />
            Dica imediata para aplicar
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {sugestao_imediata}
          </p>
        </div>
      )}

      {/* Evidências */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <IconeCheck className="h-3.5 w-3.5" />
            Pontos positivos
          </h4>
          {pontos_positivos?.length ? (
            <ul className="space-y-1.5">
              {pontos_positivos.map((ponto, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm leading-relaxed text-emerald-900 dark:text-emerald-200/90"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span>{ponto}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-emerald-700/80 dark:text-emerald-300/70">
              Nenhuma evidência positiva foi encontrada no texto do material.
            </p>
          )}
        </div>

        <div className={cx('rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 dark:border-amber-900/60 dark:bg-amber-950/20')}>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            <span aria-hidden="true">⚠</span>
            Oportunidades de melhoria
          </h4>
          {pontos_de_melhoria?.length ? (
            <ul className="space-y-1.5">
              {pontos_de_melhoria.map((ponto, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm leading-relaxed text-amber-900 dark:text-amber-200/90"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
                  <span>{ponto}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-amber-700/80 dark:text-amber-300/70">
              Nenhum ajuste obrigatório identificado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
