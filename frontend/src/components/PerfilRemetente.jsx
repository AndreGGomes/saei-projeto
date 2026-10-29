import { useRef, useState } from 'react';
import { auth } from '../actions';
import Popover from './Popover';

const PAPEIS = {
  ALUNO: 'Aluno',
  PROFESSOR: 'Professor',
  COORDENADOR: 'Coordenador',
};

// Mostra quem enviou o documento; ao clicar, busca o perfil público
// (GET /auth/{user_id}) e apresenta num popover com nome, papel e foto.
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

  return (
    <>
      <button
        ref={ancoraRef}
        onClick={abrirPopover}
        title="Ver perfil de quem enviou"
        className={`text-[11px] text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:underline transition ${className}`}
      >
        Enviado por {remetente.nome}
      </button>

      {rect && (
        <Popover rect={rect} ancoraRef={ancoraRef} onFechar={() => setRect(null)} largura={230}>
          {carregando ? (
            <p className="px-2 py-3 text-xs text-slate-400 animate-pulse">Carregando perfil...</p>
          ) : perfil ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold">
                {perfil.nome ? perfil.nome.charAt(0).toUpperCase() : '?'}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{perfil.nome}</p>
                <p className="text-[11px] text-slate-400">{PAPEIS[perfil.role] || perfil.role}</p>
              </div>
            </div>
          ) : (
            <p className="px-2 py-3 text-xs text-slate-400">Perfil não encontrado.</p>
          )}
        </Popover>
      )}
    </>
  );
}
