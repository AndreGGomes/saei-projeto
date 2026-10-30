// Contexto de avisos do sistema (notificações e confirmações).
//
// Fica num arquivo .js separado do componente para o React Fast Refresh continuar
// funcionando: ToastProvider.jsx exporta só o componente, este arquivo exporta só o
// contexto e o hook de leitura.

import { createContext, useContext } from 'react';

export const AvisosContext = createContext(null);

// Acesso aos avisos fora do JSX dos componentes. Devolve sempre as mesmas funções,
// então pode entrar em dependências de efeitos sem re-disparar nada.
export function useAvisos() {
  const contexto = useContext(AvisosContext);
  if (!contexto) {
    throw new Error('useAvisos precisa estar dentro de <ToastProvider>.');
  }
  return contexto;
}
