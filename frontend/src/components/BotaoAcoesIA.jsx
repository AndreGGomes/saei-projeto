import { useRef, useState } from 'react';
import Popover from './Popover';
import ModalResumoIA from './ModalResumoIA';
import ModalTutorIA from './ModalTutorIA';
import ModalAdaptarMaterial from './ModalAdaptarMaterial';
import ModalAcessibilidade from './ModalAcessibilidade';
import { IconeBrilhos, IconeQuebraCabeca, IconeTermometro, IconeTutoria } from '../ui/icons';
import { cx } from '../ui/utils';

export default function BotaoAcoesIA({ documento, className = '', perfil = 'ALUNO' }) {
  const [rect, setRect] = useState(null);
  const [resumoAberto, setResumoAberto] = useState(false);
  const [tutorAberto, setTutorAberto] = useState(false);
  const [adaptarAberto, setAdaptarAberto] = useState(false);
  const [acessibilidadeAberta, setAcessibilidadeAberta] = useState(false);
  const ancoraRef = useRef(null);

  // A adaptação é um recurso de mediação (guia para quem ensina): professor e coordenação.
  const materialDidatico = documento.tipo === 'PLANO_DE_AULA' || documento.tipo === 'ATIVIDADE';
  const podeAdaptar = (perfil === 'PROFESSOR' || perfil === 'COORDENADOR') && materialDidatico;
  const podeAvaliarAcessibilidade = podeAdaptar;

  const acoes = [
    ...(documento.tipo === 'ATIVIDADE'
      ? [
          {
            id: 'tutor',
            Icone: IconeTutoria,
            rotulo: 'Estudar com o tutor',
            descricao: 'Explicação passo a passo adaptada ao estudante',
            tom: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300',
          },
        ]
      : []),
    ...(podeAdaptar
      ? [
          {
            id: 'adaptar',
            Icone: IconeQuebraCabeca,
            rotulo: 'Adaptar material',
            descricao: 'Guia metodológico inclusivo para a sala',
            tom: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300',
          },
        ]
      : []),
    ...(podeAvaliarAcessibilidade
      ? [
          {
            id: 'acessibilidade',
            Icone: IconeTermometro,
            rotulo: 'Termômetro DUA',
            descricao: 'Nota de acessibilidade do material (0 a 100)',
            tom: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300',
          },
        ]
      : []),
    {
      id: 'resumo',
      Icone: IconeBrilhos,
      rotulo: 'Gerar resumo',
      descricao: 'Resumo estruturado com pontos-chave',
      tom: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300',
    },
  ];

  const alternarMenu = () => {
    if (rect) {
      setRect(null);
      return;
    }
    setRect(ancoraRef.current.getBoundingClientRect());
  };

  const executarAcao = (acao) => {
    setRect(null);
    if (acao.id === 'resumo') setResumoAberto(true);
    if (acao.id === 'tutor') setTutorAberto(true);
    if (acao.id === 'adaptar') setAdaptarAberto(true);
    if (acao.id === 'acessibilidade') setAcessibilidadeAberta(true);
  };

  return (
    <>
      <button
        ref={ancoraRef}
        type="button"
        onClick={alternarMenu}
        aria-haspopup="menu"
        aria-expanded={Boolean(rect)}
        title="Ações de inteligência artificial"
        className={cx(
          'inline-flex items-center gap-1.5 rounded-xl border border-violet-200/80 bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700 transition-colors',
          'hover:border-violet-300 hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:border-violet-900/70 dark:bg-violet-950/50 dark:text-violet-300 dark:hover:bg-violet-950',
          className
        )}
      >
        <IconeBrilhos className="h-3.5 w-3.5" />
        IA
      </button>

      {rect && (
        <Popover rect={rect} ancoraRef={ancoraRef} onFechar={() => setRect(null)} largura={280}>
          <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Inteligência artificial inclusiva
          </p>
          {acoes.map((acao) => (
            <button
              key={acao.id}
              type="button"
              role="menuitem"
              onClick={() => executarAcao(acao)}
              className="flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:hover:bg-slate-800"
            >
              <span
                className={cx(
                  'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  acao.tom
                )}
              >
                <acao.Icone className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                  {acao.rotulo}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                  {acao.descricao}
                </span>
              </span>
            </button>
          ))}
        </Popover>
      )}

      {resumoAberto && <ModalResumoIA documento={documento} onFechar={() => setResumoAberto(false)} />}
      {tutorAberto && <ModalTutorIA documento={documento} onFechar={() => setTutorAberto(false)} />}
      {adaptarAberto && (
        <ModalAdaptarMaterial documento={documento} onFechar={() => setAdaptarAberto(false)} />
      )}
      {acessibilidadeAberta && (
        <ModalAcessibilidade documento={documento} onFechar={() => setAcessibilidadeAberta(false)} />
      )}
    </>
  );
}
