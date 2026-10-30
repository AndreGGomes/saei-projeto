import { useEffect, useState } from 'react';
import { ia } from '../actions';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Field, Textarea } from '../ui/Field';
import { Skeleton } from '../ui/Spinner';
import { IconeDocumento, IconeTermometro } from '../ui/icons';
import { cx } from '../ui/utils';
import TermometroAcessibilidade from './TermometroAcessibilidade';

// Termômetro de acessibilidade DUA. Dois modos:
// 1. Documento: extrai o texto do PDF e chama /ia/avaliar-acessibilidade/documento/{id}
// 2. Texto colado: o professor cola o material e chama /ia/avaliar-acessibilidade
export default function ModalAcessibilidade({ documento, onFechar }) {
  const [modo, setModo] = useState('documento');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState(null);
  const [tentativa, setTentativa] = useState(0);
  const [textoMaterial, setTextoMaterial] = useState('');

  useEffect(() => {
    if (modo !== 'documento') return undefined;

    let ativo = true;

    ia
      .avaliarAcessibilidadeDocumento(documento.id)
      .then((dados) => {
        if (ativo) setResultado(dados);
      })
      .catch((err) => {
        if (!ativo) return;
        setResultado(null);
        setErro(err.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [modo, documento.id, tentativa]);

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

  const analisarTexto = () => {
    if (!textoMaterial || textoMaterial.trim().length < 10) {
      setErro('Informe um texto com pelo menos 10 caracteres para ser analisado.');
      return;
    }

    setCarregando(true);
    setErro('');
    setResultado(null);

    ia
      .avaliarAcessibilidadeTexto(textoMaterial)
      .then((dados) => setResultado(dados))
      .catch((err) => {
        setResultado(null);
        setErro(err.message);
      })
      .finally(() => setCarregando(false));
  };

  const analisarNovamente = () => {
    setErro('');
    setResultado(null);
    if (modo === 'documento') {
      setCarregando(true);
      setTentativa((t) => t + 1);
    }
  };

  const chip = (ativo) =>
    cx(
      'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900',
      ativo
        ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
    );

  return (
    <Modal
      onFechar={onFechar}
      titulo="Termômetro de acessibilidade (DUA)"
      descricao={documento.titulo}
      icone={<IconeTermometro className="h-5 w-5" />}
      tom="ceu"
      largura="lg"
      rodape={
        !carregando &&
        resultado && (
          <>
            <Button variante="secundario" onClick={analisarNovamente}>
              {modo === 'documento' ? 'Analisar novamente' : 'Reavaliar texto'}
            </Button>
            <Button onClick={onFechar}>Concluir</Button>
          </>
        )
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950/60">
          <button type="button" onClick={() => usarModo('documento')} className={chip(modo === 'documento')}>
            <IconeDocumento className="h-4 w-4" />
            PDF do documento
          </button>
          <button type="button" onClick={() => usarModo('texto')} className={chip(modo === 'texto')}>
            Colar texto
          </button>
        </div>
        <Badge tom="ceu" mono>
          {documento.tipo}
        </Badge>
      </div>

      {carregando && modo === 'documento' && (
        <div className="space-y-5" role="status" aria-live="polite">
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
            Lendo o material e medindo a acessibilidade...
          </div>
          <div className="space-y-3">
            <Skeleton className="mx-auto h-24 w-56 rounded-full" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </div>
        </div>
      )}

      {!carregando && erro && (
        <Alert
          tom="erro"
          titulo="Não foi possível gerar o termômetro"
          acao={
            <div className="flex flex-wrap gap-2">
              <Button tamanho="sm" variante="perigo" onClick={analisarNovamente}>
                Tentar novamente
              </Button>
              {modo === 'documento' && (
                <Button tamanho="sm" variante="secundario" onClick={() => usarModo('texto')}>
                  Colar texto
                </Button>
              )}
            </div>
          }
        >
          {erro}
        </Alert>
      )}

      {modo === 'texto' && !resultado && (
        <div className="space-y-3">
          <Field
            label="Texto do material"
            dica="Cole o conteúdo do plano de aula ou atividade (mínimo de 10 caracteres)."
          >
            {(props) => (
              <Textarea
                {...props}
                rows={7}
                value={textoMaterial}
                onChange={(e) => setTextoMaterial(e.target.value)}
                disabled={carregando}
                placeholder="Cole aqui o texto que você quer avaliar..."
                className={`${props.className} resize-y`}
              />
            )}
          </Field>
          <Button
            onClick={analisarTexto}
            carregando={carregando}
            iconeEsquerda={<IconeTermometro className="h-4 w-4" />}
            className="w-full"
          >
            {carregando ? 'Analisando com IA...' : 'Analisar acessibilidade'}
          </Button>
        </div>
      )}

      {!carregando && resultado && <TermometroAcessibilidade avaliacao={resultado} />}
    </Modal>
  );
}
