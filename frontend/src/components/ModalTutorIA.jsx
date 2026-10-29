import { useEffect, useState } from 'react';
import { ia } from '../actions';

// Modal do Tutor de Estudos Personalizado (Visão do Aluno).
// Exibe Skeleton/Spinner durante a cadeia Groq -> DuckDuckGo e renderiza:
// 1. Entenda o Assunto | 2. Como Fazer | 3. Material de Apoio
export default function ModalTutorIA({ documento, onFechar }) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tutoria, setTutoria] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;

    ia
      .tutorAlunoDocumento(documento.id)
      .then((dados) => {
        if (ativo) setTutoria(dados);
      })
      .catch((err) => {
        if (!ativo) return;
        setTutoria(null);
        setErro(err.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [documento.id, tentativa]);

  const tentarNovamente = () => {
    setCarregando(true);
    setErro('');
    setTutoria(null);
    setTentativa((t) => t + 1);
  };

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
      aria-label="Tutor de Estudos Personalizado"
    >
      <div
        className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-sm text-white shadow">
                🎓
              </span>
              Tutor de Estudos Personalizado
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Atividade: <strong className="text-slate-700 dark:text-slate-200">{documento.titulo}</strong>
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
          {/* ESTADO DE LOADING (SPINNER + SKELETON) */}
          {carregando && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-3 h-11 w-11 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Preparando sua explicação personalizada...
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  O Tutor está adaptando o conteúdo às suas preferências e buscando materiais reais de apoio.
                </p>
              </div>

              {/* Skeletons simulando as 3 seções */}
              <div className="space-y-4 animate-pulse pt-2">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 space-y-2.5 bg-slate-50/60 dark:bg-slate-800/30">
                  <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 space-y-2.5 bg-slate-50/60 dark:bg-slate-800/30">
                  <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
              </div>
            </div>
          )}

          {/* ERRO */}
          {!carregando && erro && (
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-4">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                Ops! Ocorreu um problema ao consultar o Tutor
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

          {/* CONTEÚDO GERADO PELO TUTOR */}
          {!carregando && tutoria && (
            <div className="space-y-6">
              {/* SEÇÃO 1: ENTENDA O ASSUNTO */}
              <section className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/60 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                  <span>💡</span> Entenda o Assunto
                </h4>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">
                  {tutoria.explicacao_pedagogica}
                </p>
              </section>

              {/* SEÇÃO 2: COMO FAZER (PASSO A PASSO) */}
              {tutoria.passo_a_passo_resolucao && tutoria.passo_a_passo_resolucao.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-1.5">
                    <span>🧭</span> Como Fazer (Passo a Passo)
                  </h4>
                  <ol className="space-y-2.5">
                    {tutoria.passo_a_passo_resolucao.map((passo, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 text-sm text-slate-700 dark:text-slate-200"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="mt-0.5 leading-relaxed">{passo}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* SEÇÃO 3: MATERIAL DE APOIO (DUCKDUCKGO) */}
              <section>
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-3 flex items-center gap-1.5">
                  <span>🔗</span> Material de Apoio (Links Reais)
                </h4>
                {!tutoria.links_recomendados || tutoria.links_recomendados.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Nenhum link externo complementar encontrado para este tema.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {tutoria.links_recomendados.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 p-3.5 hover:border-violet-400 dark:hover:border-violet-500 transition shadow-sm"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 truncate">
                            {item.titulo}
                          </p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{item.url}</p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-violet-600 dark:text-violet-400 group-hover:translate-x-0.5 transition">
                          Abrir ↗
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </section>

              {/* Rodapé de Ações */}
              <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800">
                <button
                  onClick={tentarNovamente}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Explicar de outra forma
                </button>
                <button
                  onClick={onFechar}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-semibold transition shadow"
                >
                  Entendi!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}