import { useEffect, useState } from 'react';
import { documentos as acoesDocumentos } from '../actions';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Skeleton } from '../ui/Spinner';
import { IconeBrilhos } from '../ui/icons';

// Resumo estruturado de um documento (POST /documentos/{id}/resumo-ia).
// Estados: carregando | erro | resumo. O reset acontece no handler do clique;
// o efeito apenas dispara a action e grava o resultado.
export default function ModalResumoIA({ documento, onFechar }) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [resumo, setResumo] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;

    acoesDocumentos
      .gerarResumoIA(documento.id)
      .then((dados) => {
        if (ativo) setResumo(dados);
      })
      .catch((err) => {
        if (!ativo) return;
        setResumo(null);
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
    setResumo(null);
    setTentativa((t) => t + 1);
  };

  return (
    <Modal
      onFechar={onFechar}
      titulo="Resumo com IA"
      descricao={documento.titulo}
      icone={<IconeBrilhos className="h-5 w-5" />}
      tom="violeta"
      largura="lg"
      rodape={
        !carregando &&
        resumo && (
          <>
            <Button variante="secundario" onClick={tentarNovamente}>
              Gerar novamente
            </Button>
            <Button onClick={onFechar}>Concluir</Button>
          </>
        )
      }
    >
      {carregando && (
        <div className="space-y-4" role="status" aria-live="polite">
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
            A IA está lendo o documento...
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      )}

      {!carregando && erro && (
        <Alert
          tom="erro"
          titulo="Não foi possível gerar o resumo"
          acao={
            <Button tamanho="sm" variante="perigo" onClick={tentarNovamente}>
              Tentar novamente
            </Button>
          }
        >
          {erro}
        </Alert>
      )}

      {!carregando && resumo && (
        <div className="space-y-6">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              {resumo.titulo_documento}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {resumo.resumo_geral}
            </p>
          </section>

          {resumo.pontos_chave?.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Pontos-chave
              </h3>
              <ul className="mt-2 space-y-2">
                {resumo.pontos_chave.map((ponto, idx) => (
                  <li
                    key={idx}
                    className="flex gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" aria-hidden="true" />
                    <span className="leading-relaxed">{ponto}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {resumo.proximos_passos_ou_recomendacoes && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Próximos passos e recomendações
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {resumo.proximos_passos_ou_recomendacoes}
              </p>
            </section>
          )}

          {resumo.links_estudo?.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Links de estudo
              </h3>
              <ul className="mt-2 space-y-1.5">
                {resumo.links_estudo.map((link, idx) => (
                  <li key={idx} className="text-sm">
                    {/^https?:\/\//i.test(link) ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
                      >
                        {link}
                      </a>
                    ) : (
                      <span className="break-words text-slate-700 dark:text-slate-300">{link}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {resumo.aviso_ia && (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[11px] italic leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
              {resumo.aviso_ia}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
