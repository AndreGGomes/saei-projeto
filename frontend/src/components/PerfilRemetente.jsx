import { useRef, useState } from 'react';
import { auth } from '../actions';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Popover from './Popover';
import { IconeUsuarios } from '../ui/icons';

const PAPEIS = {
  ALUNO: { rotulo: 'Estudante', tom: 'esmeralda' },
  PROFESSOR: { rotulo: 'Professor', tom: 'ceu' },
  COORDENADOR: { rotulo: 'Coordenação', tom: 'violeta' },
};

// Mostra quem enviou o documento; ao clicar, busca o perfil público
// (GET /auth/{user_id}) e apresenta num popover com nome, papel e iniciais.
export default function PerfilRemetente({ remetente, className = '' }) {
  const [rect, setRect] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const ancoraRef = useRef(null);

  const abrirPopover = async () => {
    if (rect) {
      setRect(null);
      return;
    }
    setRect(ancoraRef.current.getBoundingClientRect());

    // Evita refazer a requisição se já temos o perfil deste remetente
    if (perfil && perfil.id === remetente.id) return;

    setCarregando(true);
    try {
      setPerfil(await auth.buscarPerfil(remetente.id));
    } catch (err) {
      console.error('Erro ao buscar perfil do remetente:', err);
      setPerfil(null);
    } finally {
      setCarregando(false);
    }
  };

  const papel = perfil ? PAPEIS[perfil.role] : null;

  return (
    <>
      <button
        ref={ancoraRef}
        type="button"
        onClick={abrirPopover}
        title="Ver perfil de quem enviou"
        className={`inline-flex items-center gap-1 rounded text-[11px] text-slate-500 underline-offset-2 transition-colors hover:text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:text-indigo-300 ${className}`}
      >
        <IconeUsuarios className="h-3 w-3" />
        {remetente.nome}
      </button>

      {rect && (
        <Popover rect={rect} ancoraRef={ancoraRef} onFechar={() => setRect(null)} largura={240}>
          {carregando ? (
            <p className="px-2.5 py-3 text-xs text-slate-400">Carregando perfil...</p>
          ) : perfil ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar nome={perfil.nome} tamanho="md" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                  {perfil.nome}
                </p>
                <div className="mt-1">
                  <Badge tom={papel?.tom || 'neutro'}>{papel?.rotulo || perfil.role}</Badge>
                </div>
              </div>
            </div>
          ) : (
            <p className="px-2.5 py-3 text-xs text-slate-400">Perfil não encontrado.</p>
          )}
        </Popover>
      )}
    </>
  );
}
