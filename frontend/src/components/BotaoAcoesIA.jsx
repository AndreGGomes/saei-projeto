import { useRef, useState } from 'react';
import Popover from './Popover';
import ModalResumoIA from './ModalResumoIA';
import ModalTutorIA from './ModalTutorIA';
import ModalAdaptarMaterial from './ModalAdaptarMaterial';
import ModalAcessibilidade from './ModalAcessibilidade';

export default function BotaoAcoesIA({ documento, className = '', perfil = 'ALUNO' }) {
  const [rect, setRect] = useState(null);
  const [resumoAberto, setResumoAberto] = useState(false);
  const [tutorAberto, setTutorAberto] = useState(false);
  const [adaptarAberto, setAdaptarAberto] = useState(false);
  const [acessibilidadeAberta, setAcessibilidadeAberta] = useState(false);
  const ancoraRef = useRef(null);

  // A adaptação de materiais é um recurso de mediação (guia para quem ensina): só professor e coordenador
  const podeAdaptar =
    (perfil === 'PROFESSOR' || perfil === 'COORDENADOR') &&
    (documento.tipo === 'PLANO_DE_AULA' || documento.tipo === 'ATIVIDADE');

  // O Termômetro de Acessibilidade (DUA) também avalia material didático de quem ensina
  const podeAvaliarAcessibilidade = podeAdaptar;

  // Monta as ações disponíveis (se for ATIVIDADE, destaca o Tutor de Estudos)
  const acoes = [
    ...(documento.tipo === 'ATIVIDADE'
      ? [
          {
            id: 'tutor',
            rotulo: '🎓 Estudar com o Tutor',
            descricao: 'Explicação passo a passo adaptada para você',
          },
        ]
      : []),
    ...(podeAdaptar
      ? [
          {
            id: 'adaptar',
            rotulo: '🧩 Adaptar material',
            descricao: 'Guia metodológico inclusivo para a sala de aula',
          },
        ]
      : []),
    ...(podeAvaliarAcessibilidade
      ? [
          {
            id: 'acessibilidade',
            rotulo: '🌡️ Termômetro DUA',
            descricao: 'Nota de acessibilidade do material (0 a 100)',
          },
        ]
      : []),
    { id: 'resumo', rotulo: '✨ Gerar resumo', descricao: 'Resumo estruturado do documento' },
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
        onClick={alternarMenu}
        title="Ações de Inteligência Artificial"
        className={`inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold transition shadow-sm ${className}`}
      >
        <span aria-hidden="true">✨</span>
        <span>{documento.tipo === 'ATIVIDADE' ? 'Estudar com o Tutor' : 'IA'}</span>
      </button>

      {rect && (
        <Popover rect={rect} ancoraRef={ancoraRef} onFechar={() => setRect(null)} largura={260}>
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Inteligência Artificial Inclusiva
          </p>
          {acoes.map((acao) => (
            <button
              key={acao.id}
              onClick={() => executarAcao(acao)}
              className="w-full text-left rounded-lg px-2 py-2 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition"
            >
              <span className="block text-xs font-semibold text-slate-800 dark:text-white">{acao.rotulo}</span>
              <span className="block text-[11px] text-slate-400">{acao.descricao}</span>
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