import { useEffect, useState } from 'react';
import api from '../services/api';

// Modal que gera e exibe o resumo de IA de um documento (POST /documentos/{id}/resumo-ia).
// Estado único: carregando | erro | resumo. O reset síncrono acontece no handler do clique
// ("Tentar novamente"); o efeito só chama a API e grava o resultado nos callbacks.
export default function ModalResumoIA({ documento, onFechar }) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [resumo, setResumo] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  // 1. GERAÇÃO DO RESUMO (mount e cada nova tentativa)
  useEffect(() => {
    let ativo = true;

    api
      .post(`/documentos/${documento.id}/resumo-ia`)
      .then((res) => {
        if (ativo) setResumo(res.data);
      })
      .catch((err) => {
        if (!ativo) return;
        setResumo(null);
        setErro(err.response?.data?.detail || 'Não foi possível gerar o resumo agora. Tente novamente em instantes.');
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
    setResumo(null);
    setTentativa((t) => t + 1);
  };

  // 2. FECHAR COM ESCAPE
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onFechar();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onFechar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-colors"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-label="Resumo gerado por IA"
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 p-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm text-white">
                ✨
              </span>
              Resumo com IA
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{documento.titulo}</p>
          </div>
          <button
            onClick={onFechar}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {/* CARREGANDO */}
          {carregando && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                A IA está lendo o documento...
              </p>
              <p className="text-xs text-slate-400 mt-1">Isso pode levar alguns segundos.</p>
            </div>
          )}

          {/* ERRO */}
          {!carregando && erro && (
            <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-4">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">Não foi possível gerar o resumo</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{erro}</p>
              <button
                onClick={tentarNovamente}
                className="mt-3 rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-semibold transition"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* RESUMO */}
          {!carregando && resumo && (
            <div className="space-y-5">
              <section>
                <h4 className="text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400 mb-1">
                  {resumo.titulo_documento}
                </h4>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{resumo.resumo_geral}</p>
              </section>

              {resumo.pontos_chave && resumo.pontos_chave.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400 mb-2">
                    Pontos-chave
                  </h4>
                  <ul className="space-y-1.5">
                    {resumo.pontos_chave.map((ponto, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-violet-500 mt-0.5">•</span>
                        <span>{ponto}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {resumo.proximos_passos_ou_recomendacoes && (
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400 mb-1">
                    Próximos passos e recomendações
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {resumo.proximos_passos_ou_recomendacoes}
                  </p>
                </section>
              )}

              {resumo.links_estudo && resumo.links_estudo.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400 mb-2">
                    Links de estudo
                  </h4>
                  <ul className="space-y-1.5">
                    {resumo.links_estudo.map((link, idx) => (
                      <li key={idx} className="text-sm">
                        {/^https?:\/\//i.test(link) ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                          >
                            {link}
                          </a>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300 break-words">{link}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {resumo.aviso_ia && (
                <p className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 text-[11px] italic text-slate-500 dark:text-slate-400">
                  {resumo.aviso_ia}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={tentarNovamente}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Gerar novamente
                </button>
                <button
                  onClick={onFechar}
                  className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 text-xs font-semibold transition"
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
