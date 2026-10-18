import React from 'react';

export default function TermometroAcessibilidade({ avaliacao }) {
  if (!avaliacao) return null;

  const { score_acessibilidade, pontos_positivos, pontos_de_melhoria, sugestao_imediata } = avaliacao;

  // Lógica de cores e rótulos baseada no Score DUA
  const getStatus = (score) => {
    if (score >= 80) {
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-500',
        bar: 'bg-emerald-500',
        label: 'Alta Acessibilidade (DUA)',
        icon: '🟢'
      };
    }
    if (score >= 50) {
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-500',
        bar: 'bg-amber-500',
        label: 'Acessibilidade Média',
        icon: '🟡'
      };
    }
    return {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-500',
      bar: 'bg-rose-500',
      label: 'Baixa Acessibilidade',
      icon: '🔴'
    };
  };

  const status = getStatus(score_acessibilidade);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
      {/* Cabeçalho do Score e Indicador Visual */}
      <div className={`p-4 rounded-lg border-l-4 ${status.border} ${status.bg} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
            {status.icon} Termômetro DUA
          </span>
          <h3 className={`text-2xl font-bold ${status.text}`}>
            {score_acessibilidade} <span className="text-sm font-normal text-gray-600">/ 100</span> — {status.label}
          </h3>
        </div>

        {/* Barra de Progresso / Gauge */}
        <div className="w-full md:w-1/2 bg-gray-200 h-4 rounded-full overflow-hidden">
          <div
            className={`h-full ${status.bar} transition-all duration-700 ease-out`}
            style={{ width: `${score_acessibilidade}%` }}
          />
        </div>
      </div>

      {/* Dica Imediata de Ouro */}
      {sugestao_imediata && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
            💡 Dica Imediata para Aplicação
          </h4>
          <p className="text-blue-800 text-sm mt-1 leading-relaxed">{sugestao_imediata}</p>
        </div>
      )}

      {/* Listas de Feedback Positivo e Pontos de Melhoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pontos Positivos */}
        <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
          <h4 className="font-semibold text-emerald-900 text-sm mb-2 flex items-center gap-1">
            ✅ Pontos Positivos
          </h4>
          <ul className="list-disc list-inside space-y-1 text-xs text-emerald-800">
            {pontos_positivos?.map((ponto, i) => (
              <li key={i}>{ponto}</li>
            ))}
          </ul>
        </div>

        {/* Pontos de Melhoria */}
        <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
          <h4 className="font-semibold text-amber-900 text-sm mb-2 flex items-center gap-1">
            ⚠️ Oportunidades de Melhoria
          </h4>
          <ul className="list-disc list-inside space-y-1 text-xs text-amber-800">
            {pontos_de_melhoria?.map((ponto, i) => (
              <li key={i}>{ponto}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}