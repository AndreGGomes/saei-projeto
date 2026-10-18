import { useEffect, useState } from 'react';
import api from '../services/api';

// Modal da Adaptação Inteligente de Materiais (Visão do Professor e Coordenador).
// Chama POST /ia/adaptar-material/documento/{id} e renderiza o guia metodológico:
// 1. Mudanças Sugeridas | 2. Justificativa Inclusiva | 3. Dicas de Abordagem
export default function ModalAdaptarMaterial({ documento, onFechar }) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [adaptacao, setAdaptacao] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  // 1. GERAÇÃO DA ADAPTAÇÃO (mount e cada nova tentativa)
  useEffect(() => {
    let ativo = true;

    api
      .post(`/ia/adaptar-material/documento/${documento.id}`)
      .then((res) => {
        if (ativo) setAdaptacao(res.data);
      })
      .catch((err) => {
        if (!ativo) return;
        setAdaptacao(null);
        setErro(
          err.response?.data?.detail ||
            'Não foi possível adaptar este material agora. Tente novamente em instantes.'
        );
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [documento.id, tentativa]);

  // 2. REINICIA O ESTADO ANTES DE REFAZER A REQUISIÇÃO
  const tentarNovamente = () => {
    setCarregando(true);
    setErro('');
    setAdaptacao(null);
    setTentativa((t) => t + 1);
  };

  // 3. FECHAR COM ESCAPE
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onFechar();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onFechar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-colors"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-label="Adaptação Inteligente de Material"
    >
      <div
        className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 p-5 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/5 to-transparent">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm text-white shadow">
                🧩
              </span>
              Adaptação Inteligente de Material
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Documento:{' '}
              <strong className="text-slate-700 dark:text-slate-200">{documento.titulo}</strong>{' '}
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 ml-1">
                {documento.tipo}
              </span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Guia metodológico inclusivo para aplicar em sala e acompanhar o nível de inclusão.
            </p>
          </div>
          <button
            onClick={onFechar}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* CARREGANDO */}
          {carregando && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-3 h-11 w-11 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Analisando o material e o laudo do estudante...
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  A IA está cruzando as diretrizes de inclusão com a estrutura do documento.
                </p>
              </div>

              {/* Skeletons simulando as 3 seções */}
              <div className="space-y-4 animate-pulse pt-2">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 space-y-2.5 bg-slate-50/60 dark:bg-slate-800/30">
                  <div className="h-4 w-44 rounded bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 space-y-2.5 bg-slate-50/60 dark:bg-slate-800/30">
                  <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
              </div>
            </div>
          )}

          {/* ERRO */}
          {!carregando && erro && (
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-4">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                Ops! Não foi possível gerar a adaptação
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{erro}</p>
              <button
                onClick={tentarNovamente}
                className="mt-3 rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-semibold transition"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* CONTEÚDO GERADO PELA IA */}
          {!carregando && adaptacao && (
            <div className="space-y-6">
              {/* SEÇÃO 1: MUDANÇAS SUGERIDAS */}
              {adaptacao.mudancas_sugeridas && adaptacao.mudancas_sugeridas.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-3 flex items-center gap-1.5">
                    <span>🛠️</span> Mudanças Sugeridas
                  </h4>
                  <ol className="space-y-2.5">
                    {adaptacao.mudancas_sugeridas.map((mudanca, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 text-sm text-slate-700 dark:text-slate-200"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="mt-0.5 leading-relaxed">{mudanca}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* SEÇÃO 2: JUSTIFICATIVA INCLUSIVA */}
              {adaptacao.justificativa_inclusiva && (
                <section className="rounded-xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/70 dark:border-violet-900/60 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400 mb-2 flex items-center gap-1.5">
                    <span>💡</span> Justificativa Inclusiva
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    {adaptacao.justificativa_inclusiva}
                  </p>
                </section>
              )}

              {/* SEÇÃO 3: DICAS DE ABORDAGEM */}
              {adaptacao.dicas_de_abordagem && adaptacao.dicas_de_abordagem.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400 mb-3 flex items-center gap-1.5">
                    <span>🗣️</span> Dicas de Abordagem em Sala
                  </h4>
                  <ul className="space-y-2">
                    {adaptacao.dicas_de_abordagem.map((dica, idx) => (
                      <li
                        key={idx}
                        className="flex gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3 text-sm text-slate-700 dark:text-slate-200"
                      >
                        <span className="text-fuchsia-500 mt-0.5">•</span>
                        <span className="leading-relaxed">{dica}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Rodapé de Ações */}
              <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800">
                <button
                  onClick={tentarNovamente}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Gerar outra sugestão
                </button>
                <button
                  onClick={onFechar}
                  className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 text-xs font-semibold transition shadow"
                >
                  Concluir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
