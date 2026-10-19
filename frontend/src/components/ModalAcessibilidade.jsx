import { useEffect, useState } from 'react';
import api from '../services/api';
import TermometroAcessibilidade from './TermometroAcessibilidade';

// Modal do Termômetro de Acessibilidade DUA (Visão do Professor e Coordenador).
// Dois modos de análise:
// 1. Documento: extrai o texto do PDF e chama POST /ia/avaliar-acessibilidade/documento/{id}
// 2. Texto colado: o professor cola o conteúdo do material e chama POST /ia/avaliar-acessibilidade
export default function ModalAcessibilidade({ documento, onFechar }) {
  const [modo, setModo] = useState('documento'); // 'documento' | 'texto'
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState(null);
  const [tentativa, setTentativa] = useState(0);
  const [textoMaterial, setTextoMaterial] = useState('');

  // 1. ANÁLISE DO DOCUMENTO (mount, nova tentativa ou retorno ao modo documento)
  useEffect(() => {
    if (modo !== 'documento') return undefined;

    let ativo = true;

    api
      .post(`/ia/avaliar-acessibilidade/documento/${documento.id}`)
      .then((res) => {
        if (ativo) setResultado(res.data);
      })
      .catch((err) => {
        if (!ativo) return;
        setResultado(null);
        setErro(
          err.response?.data?.detail ||
            'Não foi possível analisar a acessibilidade agora. Tente novamente em instantes.'
        );
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [modo, documento.id, tentativa]);

  // 2. FECHAR COM ESCAPE
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onFechar();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onFechar]);

  // 3. ALTERNAR ENTRE ANÁLISE POR DOCUMENTO E POR TEXTO COLADO
  const usarModo = (novoModo) => {
    if (novoModo === modo) return;
    setErro('');
    setResultado(null);
    setModo(novoModo);
    if (novoModo === 'documento') {
      setCarregando(true);
      setTentativa((t) => t + 1);
    } else {
      setCarregando(false);
    }
  };

  // 4. ANÁLISE DO TEXTO COLADO (modo manual)
  const analisarTexto = () => {
    if (!textoMaterial || textoMaterial.trim().length < 10) {
      setErro('Informe um texto com pelo menos 10 caracteres para ser analisado.');
      return;
    }

    setCarregando(true);
    setErro('');
    setResultado(null);

    api
      .post('/ia/avaliar-acessibilidade', { texto_material: textoMaterial })
      .then((res) => setResultado(res.data))
      .catch((err) => {
        setResultado(null);
        setErro(err.response?.data?.detail || 'Erro ao comunicar com o serviço de IA.');
      })
      .finally(() => setCarregando(false));
  };

  // 5. REINICIA O ESTADO ANTES DE REFAZER A ANÁLISE
  const analisarNovamente = () => {
    setErro('');
    setResultado(null);
    if (modo === 'documento') {
      setCarregando(true);
      setTentativa((t) => t + 1);
    }
  };

  if (!documento) return null;

  const chipModo =
    'rounded-lg px-3 py-1.5 text-[11px] font-semibold transition border';
  const chipAtivo =
    'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300';
  const chipInativo =
    'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-colors"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-label="Termômetro de Acessibilidade DUA"
    >
      <div
        className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-sky-500/10 via-indigo-500/5 to-transparent p-5 dark:border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-sm text-white shadow">
                  🌡️
                </span>
                Termômetro de Acessibilidade (DUA)
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Documento:{' '}
                <strong className="text-slate-700 dark:text-slate-200">{documento.titulo}</strong>{' '}
                <span className="ml-1 rounded bg-sky-100 px-1.5 py-0.5 font-mono text-[10px] text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  {documento.tipo}
                </span>
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Nota de 0 a 100 da acessibilidade do material, com base no Desenho Universal para a Aprendizagem.
              </p>
            </div>
            <button
              onClick={onFechar}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Fechar"
            >
              ✕
            </button>
          </div>

          {/* Seletor de modo de análise */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => usarModo('documento')}
              className={`${chipModo} ${modo === 'documento' ? chipAtivo : chipInativo}`}
            >
              📄 Analisar o PDF do documento
            </button>
            <button
              onClick={() => usarModo('texto')}
              className={`${chipModo} ${modo === 'texto' ? chipAtivo : chipInativo}`}
            >
              📝 Colar texto do material
            </button>
            <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Exclusivo para professores e coordenadores
            </span>
          </div>
        </div>

        <div className="space-y-5 p-6">
          {/* CARREGANDO */}
          {modo === 'documento' && carregando && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-3 h-11 w-11 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600"></div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Lendo o material e medindo a acessibilidade...
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  A IA está aplicando as diretrizes do Desenho Universal para a Aprendizagem (DUA).
                </p>
              </div>

              {/* Skeletons simulando gauge + feedback */}
              <div className="animate-pulse space-y-4 pt-2">
                <div className="mx-auto h-28 w-64 rounded-full border border-slate-100 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-800/40"></div>
                <div className="space-y-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                  <div className="h-4 w-44 rounded bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
              </div>
            </div>
          )}

          {/* ERRO */}
          {!carregando && erro && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/50">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                Ops! Não foi possível gerar o termômetro
              </p>
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{erro}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={analisarNovamente}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                >
                  Tentar novamente
                </button>
                {modo === 'documento' && (
                  <button
                    onClick={() => usarModo('texto')}
                    className="rounded-lg border border-red-300 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                  >
                    Avaliar texto colado
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ENTRADA DE TEXTO (modo manual) */}
          {modo === 'texto' && !resultado && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Texto do material didático ou atividade
              </label>
              <textarea
                rows={7}
                value={textoMaterial}
                onChange={(e) => setTextoMaterial(e.target.value)}
                disabled={carregando}
                placeholder="Cole aqui o texto do seu plano de aula ou atividade para avaliar a acessibilidade geral..."
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                onClick={analisarTexto}
                disabled={carregando}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {carregando ? 'Analisando com IA...' : '🌡️ Analisar acessibilidade'}
              </button>
            </div>
          )}

          {/* RESULTADO */}
          {!carregando && resultado && (
            <div className="space-y-5">
              <TermometroAcessibilidade avaliacao={resultado} />

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  onClick={analisarNovamente}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {modo === 'documento' ? 'Analisar novamente' : 'Reavaliar texto'}
                </button>
                <button
                  onClick={onFechar}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white transition shadow hover:bg-indigo-700"
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
