import { useEffect, useState } from 'react';
import { ia } from '../actions';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Skeleton } from '../ui/Spinner';
import { IconeQuebraCabeca } from '../ui/icons';

// Adaptação inteligente de materiais (POST /ia/adaptar-material/documento/{id}).
// Renderiza: mudanças sugeridas, justificativa inclusiva e dicas de abordagem.
export default function ModalAdaptarMaterial({ documento, onFechar }) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [adaptacao, setAdaptacao] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;

    ia
      .adaptarMaterialDocumento(documento.id)
      .then((dados) => {
        if (ativo) setAdaptacao(dados);
      })
      .catch((err) => {
        if (!ativo) return;
        setAdaptacao(null);
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
    setAdaptacao(null);
    setTentativa((t) => t + 1);
  };

  return (
    <Modal
      onFechar={onFechar}
      titulo="Adaptação inteligente de material"
      descricao={documento.titulo}
      icone={<IconeQuebraCabeca className="h-5 w-5" />}
      tom="violeta"
      largura="lg"
      rodape={
        !carregando && adaptacao && (
          <>
            <Button variante="secundario" onClick={tentarNovamente}>
              Gerar outra sugestão
            </Button>
            <Button onClick={onFechar}>Concluir</Button>
          </>
        )
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tom="violeta" mono>
          {documento.tipo}
        </Badge>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Guia metodológico com base no laudo e nas diretrizes institucionais.
        </span>
      </div>

      {carregando && (
        <div className="space-y-4" role="status" aria-live="polite">
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
            Cruzando o material com as diretrizes de inclusão...
          </div>
          {[0, 1].map((i) => (
            <div key={i} className="space-y-2 rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          ))}
        </div>
      )}

      {!carregando && erro && (
        <Alert
          tom="erro"
          titulo="Não foi possível gerar a adaptação"
          acao={
            <Button tamanho="sm" variante="perigo" onClick={tentarNovamente}>
              Tentar novamente
            </Button>
          }
        >
          {erro}
        </Alert>
      )}

      {!carregando && adaptacao && (
        <div className="space-y-6">
          {adaptacao.mudancas_sugeridas?.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Mudanças sugeridas
              </h3>
              <ol className="mt-2 space-y-2">
                {adaptacao.mudancas_sugeridas.map((mudanca, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed text-slate-700 dark:text-slate-300">
                      {mudanca}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {adaptacao.justificativa_inclusiva && (
            <section className="rounded-xl border border-violet-200/70 bg-violet-50/60 p-4 dark:border-violet-900/60 dark:bg-violet-950/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                Justificativa inclusiva
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {adaptacao.justificativa_inclusiva}
              </p>
            </section>
          )}

          {adaptacao.dicas_de_abordagem?.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400">
                Dicas de abordagem em sala
              </h3>
              <ul className="mt-2 space-y-2">
                {adaptacao.dicas_de_abordagem.map((dica, idx) => (
                  <li
                    key={idx}
                    className="flex gap-2.5 rounded-xl border border-slate-200/80 px-3.5 py-2.5 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-500" aria-hidden="true" />
                    <span className="leading-relaxed">{dica}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}
