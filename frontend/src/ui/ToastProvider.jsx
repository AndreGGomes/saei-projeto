import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AvisosContext } from './avisos';
import { cx } from './utils';
import Modal from './Modal';
import Button, { BotaoIcone } from './Button';
import { IconeAlerta, IconeCheck, IconeFechar, IconeInfo } from './icons';

const TONS = {
  sucesso: {
    caixa:
      'border-emerald-200 bg-white text-emerald-900 dark:border-emerald-900/70 dark:bg-slate-900 dark:text-emerald-100',
    icone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300',
    Icone: IconeCheck,
  },
  erro: {
    caixa:
      'border-rose-200 bg-white text-rose-900 dark:border-rose-900/70 dark:bg-slate-900 dark:text-rose-100',
    icone: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300',
    Icone: IconeAlerta,
  },
  info: {
    caixa:
      'border-sky-200 bg-white text-sky-900 dark:border-sky-900/70 dark:bg-slate-900 dark:text-sky-100',
    icone: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300',
    Icone: IconeInfo,
  },
};

// Duração na tela: erros ficam mais tempo porque costumam exigir leitura.
const DURACAO = { sucesso: 4000, info: 4000, erro: 7000 };

function Notificacao({ aviso, onFechar }) {
  const tom = TONS[aviso.tom] || TONS.info;

  useEffect(() => {
    const timer = setTimeout(() => onFechar(aviso.id), DURACAO[aviso.tom] || 4000);
    return () => clearTimeout(timer);
  }, [aviso.id, aviso.tom, onFechar]);

  return (
    <div
      className={cx(
        'pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-3.5 shadow-lg shadow-slate-900/5 backdrop-blur sm:w-[22rem]',
        tom.caixa
      )}
    >
      <span className={cx('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', tom.icone)}>
        <tom.Icone className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        {aviso.titulo && <p className="text-sm font-semibold">{aviso.titulo}</p>}
        <p className="text-xs leading-relaxed break-words">{aviso.mensagem}</p>
      </div>
      <BotaoIcone rotulo="Fechar aviso" onClick={() => onFechar(aviso.id)} className="-mr-1 -mt-1 h-7 w-7">
        <IconeFechar className="h-3.5 w-3.5" />
      </BotaoIcone>
    </div>
  );
}

// Provider global de avisos: substitui alert() e confirm() nativos por notificações
// discretas e um modal de confirmação coerente com o resto da interface.
export default function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([]);
  const [confirmacao, setConfirmacao] = useState(null);
  const resolucaoRef = useRef(null);
  const sequenciaRef = useRef(0);

  const fechar = useCallback((id) => {
    setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id));
  }, []);

  const notificar = useCallback((tom, mensagem, titulo) => {
    sequenciaRef.current += 1;
    const id = sequenciaRef.current;
    setAvisos((atuais) => [...atuais.slice(-2), { id, tom, mensagem, titulo }]);
    return id;
  }, []);

  const confirmar = useCallback((opcoes) => {
    return new Promise((resolve) => {
      resolucaoRef.current = resolve;
      setConfirmacao(opcoes);
    });
  }, []);

  const responderConfirmacao = (resposta) => {
    if (resolucaoRef.current) resolucaoRef.current(resposta);
    resolucaoRef.current = null;
    setConfirmacao(null);
  };

  const valor = useMemo(
    () => ({
      sucesso: (mensagem, titulo) => notificar('sucesso', mensagem, titulo),
      erro: (mensagem, titulo) => notificar('erro', mensagem, titulo),
      info: (mensagem, titulo) => notificar('info', mensagem, titulo),
      confirmar,
    }),
    [notificar, confirmar]
  );

  return (
    <AvisosContext.Provider value={valor}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
        role="region"
        aria-label="Notificações"
      >
        <div aria-live="polite" className="flex w-full flex-col items-end gap-2">
          {avisos.map((aviso) => (
            <Notificacao key={aviso.id} aviso={aviso} onFechar={fechar} />
          ))}
        </div>
      </div>

      {confirmacao && (
        <Modal
          onFechar={() => responderConfirmacao(false)}
          titulo={confirmacao.titulo || 'Confirmar ação'}
          icone={<IconeAlerta className="h-5 w-5" />}
          tom="violeta"
          largura="sm"
          rodape={
            <>
              <Button variante="secundario" onClick={() => responderConfirmacao(false)}>
                {confirmacao.textoCancelar || 'Cancelar'}
              </Button>
              <Button
                variante={confirmacao.variante || 'perigo'}
                onClick={() => responderConfirmacao(true)}
              >
                {confirmacao.textoConfirmar || 'Confirmar'}
              </Button>
            </>
          }
        >
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {confirmacao.mensagem || 'Esta ação não pode ser desfeita.'}
          </p>
        </Modal>
      )}
    </AvisosContext.Provider>
  );
}
